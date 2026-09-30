<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Http\Requests\RegisterStudentRequest;
use App\Models\CmsDepartment;
use App\Models\CmsStudent;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class StudentRegistrationController extends Controller
{
    /**
     * Show the public student registration page.
     * Provides departments and their levels for the dependent selects.
     */
    public function create(): Response
    {
        $departments = CmsDepartment::query()
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->with(['levels' => function ($query) {
                $query->whereNull('deleted_at')->orderBy('year')->orderBy('section');
            }])
            ->get()
            ->map(fn (CmsDepartment $d) => [
                'id' => $d->id,
                'name' => $d->name,
                'levels' => $d->levels->map(fn ($l) => [
                    'id' => $l->id,
                    'label' => 'Year '.$l->year.' – '.$l->section,
                    'year' => $l->year,
                    'section' => $l->section,
                ]),
            ]);

        return Inertia::render('site/student/register', [
            'departments' => $departments,
        ]);
    }

    /**
     * Handle the public student registration form submission.
     *
     * Creates the user + CmsStudent profile in a single transaction.
     * The student is created with status `pending`; an admin must approve
     * before the student is considered active. No enrollments are created here.
     */
    public function store(RegisterStudentRequest $request): RedirectResponse
    {
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

            $user->assignRole(UserRole::Student->value);

            CmsStudent::create([
                'user_id' => $user->id,
                'student_no' => CmsStudent::generateStudentNo(),
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'gender' => $data['gender'],
                'birth_date' => $data['birth_date'],
                'address' => isset($data['address'])
                    ? implode(', ', array_filter([$data['city'] ?? null, $data['address']]))
                    : ($data['city'] ?? null),
                'level_id' => $data['level_id'],
                'enrollment_date' => now()->toDateString(),
                'status' => 'pending',
            ]);

            event(new Registered($user));

            Auth::login($user);

            $this->notifyAdmin($data['name'], $data['email']);
            $this->notifyStudent($data['name'], $data['email']);
        });

        return to_route('dashboard');
    }

    /**
     * Send a "new pending registration" email to the admin contact address.
     */
    private function notifyAdmin(string $studentName, string $studentEmail): void
    {
        $adminEmail = SiteSetting::where('key', 'contact_email')->value('value') ?: 'info@mhcst.ly';

        try {
            Mail::raw(
                "A new student registration is pending approval.\n\n".
                "Name:  {$studentName}\n".
                "Email: {$studentEmail}\n\n".
                'Please log in to the CMS to review and approve or reject this registration.',
                function ($message) use ($adminEmail, $studentName): void {
                    $message->to($adminEmail)
                        ->subject("New Student Registration Pending: {$studentName}");
                }
            );
        } catch (\Throwable) {
            // Silence mail errors in development / unconfigured SMTP
        }
    }

    /**
     * Send a welcome email to the newly registered student.
     */
    private function notifyStudent(string $studentName, string $studentEmail): void
    {
        try {
            Mail::raw(
                "مرحباً {$studentName}،\n\n".
                "تم استلام طلب تسجيلك بنجاح. سيقوم فريقنا بمراجعة طلبك والرد عليك في أقرب وقت.\n\n".
                "بمجرد الموافقة على طلبك، ستتمكن من اختيار المواد الدراسية الخاصة بك.\n\n".
                'شكراً لتسجيلك.',
                function ($message) use ($studentEmail, $studentName): void {
                    $message->to($studentEmail, $studentName)
                        ->subject('تم استلام طلب التسجيل – مركز مهكست التدريبي');
                }
            );
        } catch (\Throwable) {
            // Silence mail errors in development / unconfigured SMTP
        }
    }
}
