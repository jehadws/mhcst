<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\RegisterStudentRequest;
use App\Mail\StudentRegistrationPendingMail;
use App\Mail\StudentWelcomeMail;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\CmsAcademicSettingsService;
use App\Services\CmsAdmissionService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class StudentRegistrationController extends Controller
{
    /**
     * Cookie that carries the draft token: the key that lets a visitor resume
     * an unfinished application after a dropped connection or closed tab.
     */
    private const DRAFT_COOKIE = 'mhcst_draft_token';

    public function __construct(private CmsAdmissionService $admission) {}

    /**
     * Show the public student registration page.
     *
     * The form is resumable: whatever the guest typed is autosaved as a
     * per-session draft (CmsApplication status=draft) and pre-filled on the
     * next visit, so a dropped connection never loses progress. When the
     * admission window is closed the page renders a specific notice instead.
     */
    public function create(Request $request): Response
    {
        $admissionOpen = $this->admissionSettings()->admissionOpen();

        return Inertia::render('site/student/register', [
            'departments' => $admissionOpen ? $this->admission->departmentOptions() : [],
            'admission' => [
                'open' => $admissionOpen,
                'message' => $admissionOpen ? null : $this->closedMessage(),
            ],
            'draft' => $admissionOpen ? $this->draftPayload($request) : null,
        ]);
    }

    /**
     * Autosave a partial form payload as the guest session's draft. Lenient
     * by design — only resumable fields are read, no account is touched.
     */
    public function saveDraft(Request $request): RedirectResponse
    {
        if (! $this->admissionSettings()->admissionOpen()) {
            return back();
        }

        $data = $request->validateWithBag('saveDraft', [
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'string', 'max:10'],
            'birth_date' => ['nullable', 'string', 'max:10'],
            'city' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:500'],
            'department_id' => ['nullable'],
            'level_id' => ['nullable'],
        ]);

        // Nothing typed yet — don't create a pointless draft row.
        if (collect($data)->filter(fn ($value) => $value !== null && $value !== '')->isEmpty()) {
            return back();
        }

        $this->admission->saveDraft($this->draftToken($request), $data);

        return back();
    }

    /**
     * Handle the public student registration form submission.
     *
     * Creates the user + cms_applications row in a single transaction. The
     * applicant is NOT a student yet: the cms_students profile (and its
     * student number) is only created when an admin accepts the application.
     * Any per-session draft is converted into the submitted application, so
     * nothing is lost. Notification emails are queued after the transaction
     * commits, so a mail outage can never roll back the account.
     */
    public function store(RegisterStudentRequest $request): RedirectResponse
    {
        $settingsService = $this->admissionSettings();

        if (! $settingsService->admissionOpen()) {
            throw ValidationException::withMessages([
                'admission' => $this->closedMessage(),
            ]);
        }

        $allowedLevelIds = $settingsService->allowedLevelIds();

        if ($allowedLevelIds !== null && ! in_array((int) $request->input('level_id'), $allowedLevelIds, true)) {
            throw ValidationException::withMessages([
                'level_id' => 'المستوى المختار غير متاح للتقديم حالياً. — The selected level is not open for admission.',
            ]);
        }

        /** @var array<string, mixed> $data */
        $data = $request->safe()->except(['company', 'password_confirmation']);

        DB::transaction(function () use ($data, $request): void {
            /** @var User $user */
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($request->input('password')),
                'is_active' => true,
            ]);

            Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
            $user->assignRole(UserRole::Student->value);

            $this->admission->submitFromDraft(
                $this->draftToken($request),
                $user,
                $data,
                (string) $data['department_id'],
                (string) $data['level_id'],
            );

            event(new Registered($user));

            Auth::login($user);
        });

        $this->notifyAdmin($data['name'], $data['email']);
        $this->notifyStudent($data['name'], $data['email']);

        return to_route('application.status')->with('success', 'تم إرسال طلبك بنجاح — تابع حالته من صفحة «طلبي».');
    }

    private function draftPayload(Request $request): ?array
    {
        $draft = $this->admission->draftForToken($this->draftToken($request));

        if (! $draft) {
            return null;
        }

        return [
            ...($draft->form_data ?? []),
            'department_id' => $draft->department_id !== null ? (string) $draft->department_id : '',
            'level_id' => $draft->level_id !== null ? (string) $draft->level_id : '',
        ];
    }

    /**
     * The visitor's draft token: taken from the cookie when valid, otherwise
     * minted and queued so the very first response sets it.
     */
    private function draftToken(Request $request): string
    {
        $token = $request->cookie(self::DRAFT_COOKIE);

        if (is_string($token) && preg_match('/^[a-f0-9]{40}$/', $token)) {
            return $token;
        }

        $token = bin2hex(random_bytes(20));

        cookie()->queue(cookie(
            self::DRAFT_COOKIE,
            $token,
            60 * 24 * 60,
            (string) config('session.path', '/'),
            config('session.domain'),
            (bool) config('session.secure'),
            true,
            false,
            'Lax'
        ));

        return $token;
    }

    private function admissionSettings(): CmsAcademicSettingsService
    {
        return app(CmsAcademicSettingsService::class);
    }

    private function closedMessage(): string
    {
        return 'التسجيل مغلق حالياً — تابعنا لاحقاً لمعرفة موعد فتح باب القبول. — Admission is currently closed; please check back later.';
    }

    /**
     * Send a "new pending registration" email to the admin contact address.
     */
    private function notifyAdmin(string $studentName, string $studentEmail): void
    {
        $adminEmail = SiteSetting::where('key', 'contact_email')->value('value') ?: 'info@mhcst.edu.ly';

        try {
            Mail::to($adminEmail)->send(new StudentRegistrationPendingMail($studentName, $studentEmail));
        } catch (\Throwable $exception) {
            Log::warning('student registration admin notice failed', [
                'email' => $adminEmail,
                'error' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * Send a welcome email to the newly registered student.
     */
    private function notifyStudent(string $studentName, string $studentEmail): void
    {
        try {
            Mail::to($studentEmail, $studentName)->send(new StudentWelcomeMail($studentName));
        } catch (\Throwable $exception) {
            Log::warning('student registration welcome mail failed', [
                'email' => $studentEmail,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
