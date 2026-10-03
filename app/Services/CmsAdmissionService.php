<?php

namespace App\Services;

use App\Models\CmsApplication;
use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * The admission lifecycle (phase 2): public form drafts, application
 * submission, and the dedicated admin accept / reject / review actions.
 *
 * Invariants:
 * - Applicant ≠ student. cms_students rows (and student numbers) are only
 *   created at acceptance; registration only creates the User + application.
 * - Acceptance is transactional: level row lock → seat check → student
 *   creation/activation → application status flip, all inside one commit,
 *   mirroring the CmsStudent::generateStudentNo() lock contract.
 * - Every status change is audited through HasAuditable on CmsApplication.
 */
class CmsAdmissionService
{
    public function __construct(
        private CmsAcademicSettingsService $settings,
        private CmsApplicationNotifier $notifier,
    ) {}

    /**
     * Departments (with their levels) selectable on the public form, filtered
     * by the admission settings' allowed department/level lists.
     */
    public function departmentOptions(): array
    {
        $departmentIds = $this->settings->allowedDepartmentIds();
        $levelIds = $this->settings->allowedLevelIds();

        return CmsDepartment::query()
            ->whereNull('deleted_at')
            ->when($departmentIds !== null, fn ($query) => $query->whereIn('id', $departmentIds))
            ->whereHas('levels', function ($query) use ($levelIds) {
                $query->whereNull('deleted_at')
                    ->when($levelIds !== null, fn ($q) => $q->whereIn('id', $levelIds));
            })
            ->orderBy('name')
            ->with(['levels' => function ($query) use ($levelIds) {
                $query->whereNull('deleted_at')
                    ->when($levelIds !== null, fn ($q) => $q->whereIn('id', $levelIds))
                    ->orderBy('year')
                    ->orderBy('section');
            }])
            ->get()
            ->map(fn (CmsDepartment $department) => [
                'id' => $department->id,
                'name' => $department->name,
                'levels' => $department->levels->map(fn (CmsLevel $level) => [
                    'id' => $level->id,
                    'label' => 'Year '.$level->year.' – '.$level->section,
                    'year' => $level->year,
                    'section' => $level->section,
                ]),
            ])
            ->all();
    }

    /**
     * The current browser's draft, if any — used to resume the form after a
     * dropped connection. Drafts are keyed by a cookie token, so the resume
     * survives the server session (e.g. the visitor comes back the next day).
     */
    public function draftForToken(string $draftToken): ?CmsApplication
    {
        return CmsApplication::query()
            ->where('status', CmsApplication::STATUS_DRAFT)
            ->where('draft_token', $draftToken)
            ->first();
    }

    /**
     * Create or refresh the browser's draft. Deliberately lenient: partial
     * payloads are fine, only the stored field types are validated.
     */
    public function saveDraft(string $draftToken, array $data): CmsApplication
    {
        $form = array_filter([
            'name' => Str::limit(trim((string) ($data['name'] ?? '')), 255, ''),
            'email' => Str::limit(trim((string) ($data['email'] ?? '')), 255, ''),
            'phone' => Str::limit(trim((string) ($data['phone'] ?? '')), 50, ''),
            'gender' => in_array($data['gender'] ?? null, ['male', 'female'], true) ? $data['gender'] : null,
            'birth_date' => $data['birth_date'] ?? null,
            'city' => Str::limit(trim((string) ($data['city'] ?? '')), 100, ''),
            'address' => Str::limit(trim((string) ($data['address'] ?? '')), 500, ''),
        ], fn ($value) => $value !== null && (string) $value !== '');

        return DB::transaction(function () use ($draftToken, $data, $form) {
            $draft = $this->draftForToken($draftToken);

            if (! $draft) {
                $draft = new CmsApplication([
                    'draft_token' => $draftToken,
                    'status' => CmsApplication::STATUS_DRAFT,
                ]);
                // Quiet: autosave churn is not a lifecycle event worth auditing.
                $draft->saveQuietly();
            }

            $draft->forceFill([
                'department_id' => is_numeric($data['department_id'] ?? null) ? (int) $data['department_id'] : null,
                'level_id' => is_numeric($data['level_id'] ?? null) ? (int) $data['level_id'] : null,
                'form_data' => $form,
            ])->saveQuietly();

            return $draft;
        });
    }

    /**
     * Convert the browser's draft (if any) into a real submitted application
     * for the freshly-created user. Must be called inside the registration
     * transaction that created the user.
     */
    public function submitFromDraft(string $draftToken, User $user, array $validated, string $departmentId, string $levelId): CmsApplication
    {
        $draft = $this->draftForToken($draftToken);

        $attributes = [
            'user_id' => $user->id,
            'department_id' => (int) $departmentId,
            'level_id' => (int) $levelId,
            'form_data' => $this->submissionFormData($validated),
            'status' => CmsApplication::STATUS_SUBMITTED,
            'submitted_at' => now(),
        ];

        if ($draft) {
            $draft->update($attributes);

            return $draft;
        }

        return CmsApplication::create($attributes);
    }

    /**
     * Accept an application: lock the level, assert a seat is left, create
     * (or activate — pre-phase-2 transition) the student, flip the status.
     * Returns the accepted application and, when requested, the generated
     * temporary password to hand to the admin (shown once, never stored).
     *
     * @return array{application: CmsApplication, temp_password: ?string}
     */
    public function accept(CmsApplication $application, bool $generateTempPassword = false): array
    {
        [$application, $tempPassword] = DB::transaction(function () use ($application, $generateTempPassword) {
            $application = CmsApplication::query()
                ->whereKey($application->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $this->assertActionable($application, 'قبول');

            $level = CmsLevel::query()
                ->whereKey($application->level_id)
                ->lockForUpdate()
                ->firstOrFail();

            $this->assertLevelSeatAvailable($level);

            $tempPassword = null;
            $student = $application->user ? CmsStudent::where('user_id', $application->user->id)->first() : null;

            if ($student) {
                // Pre-phase-2 transition: pending students already carry a
                // profile and student number — activate instead of duplicating.
                $student->update([
                    'status' => 'active',
                    'level_id' => $application->level_id,
                ]);
            } else {
                $formData = $application->form_data ?? [];

                CmsStudent::create([
                    'user_id' => $application->user_id,
                    'student_no' => CmsStudent::generateStudentNo(),
                    'name' => $formData['name'] ?? $application->user?->name,
                    'email' => $formData['email'] ?? $application->user?->email,
                    'phone' => $formData['phone'] ?? null,
                    'gender' => $formData['gender'] ?? null,
                    'birth_date' => $formData['birth_date'] ?? null,
                    'address' => $formData['address'] ?? null,
                    'level_id' => $application->level_id,
                    'enrollment_date' => now()->toDateString(),
                    'status' => 'active',
                ]);
            }

            if ($generateTempPassword && $application->user) {
                $tempPassword = Str::password(12, symbols: false);
                $application->user->update([
                    'password' => $tempPassword,
                    'must_change_password' => true,
                ]);
            }

            $application->update(['status' => CmsApplication::STATUS_ACCEPTED]);

            return [$application, $tempPassword];
        });

        $this->notifier->notifyAccepted($application);

        return ['application' => $application, 'temp_password' => $tempPassword];
    }

    /**
     * Reject an application with a mandatory, admin-authored reason shown to
     * the applicant on the طلبي page.
     */
    public function reject(CmsApplication $application, string $reason): CmsApplication
    {
        $application = DB::transaction(function () use ($application, $reason) {
            $application = CmsApplication::query()
                ->whereKey($application->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            $this->assertActionable($application, 'رفض');

            $application->update([
                'status' => CmsApplication::STATUS_REJECTED,
                'rejected_reason' => $reason,
            ]);

            return $application;
        });

        $this->notifier->notifyRejected($application);

        return $application;
    }

    /**
     * Move a submitted application into review.
     */
    public function markUnderReview(CmsApplication $application): CmsApplication
    {
        $application = DB::transaction(function () use ($application) {
            $application = CmsApplication::query()
                ->whereKey($application->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ($application->status !== CmsApplication::STATUS_SUBMITTED) {
                throw ValidationException::withMessages([
                    'application' => 'يمكن تحويل الطلبات المرسلة فقط إلى حالة المراجعة. — Only submitted applications can be moved to review.',
                ]);
            }

            $application->update(['status' => CmsApplication::STATUS_UNDER_REVIEW]);

            return $application;
        });

        $this->notifier->notifyUnderReview($application);

        return $application;
    }

    /**
     * The live application of a logged-in applicant (draft rows excluded).
     */
    public function applicationForUser(User $user): ?CmsApplication
    {
        return CmsApplication::query()
            ->notDraft()
            ->where('user_id', $user->id)
            ->latest()
            ->first();
    }

    private function submissionFormData(array $validated): array
    {
        return array_filter([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'gender' => $validated['gender'],
            'birth_date' => $validated['birth_date'],
            'city' => $validated['city'] ?? null,
            'address' => $validated['address'] ?? null,
        ], fn ($value) => $value !== null && $value !== '');
    }

    /**
     * Only submitted / under-review applications can be decided.
     */
    private function assertActionable(CmsApplication $application, string $actionLabel): void
    {
        if (! in_array($application->status, [CmsApplication::STATUS_SUBMITTED, CmsApplication::STATUS_UNDER_REVIEW], true)) {
            throw ValidationException::withMessages([
                'application' => "لا يمكن {$actionLabel} هذا الطلب لأن حالته الحالية «{$application->status}». — This application cannot be {$actionLabel} from its current status.",
            ]);
        }
    }

    /**
     * Level capacity limits ACTIVE students in the section. capacity = 0
     * means unlimited. Must run inside the caller's transaction (the level
     * row is locked there) so concurrent acceptances serialize.
     */
    private function assertLevelSeatAvailable(CmsLevel $level): void
    {
        $capacity = max(0, (int) ($level->capacity ?? 0));

        if ($capacity === 0) {
            return;
        }

        $activeStudents = CmsStudent::query()
            ->where('level_id', $level->getKey())
            ->where('status', 'active')
            ->count();

        if ($activeStudents >= $capacity) {
            throw ValidationException::withMessages([
                'application' => 'هذه الشعبة مكتملة العدد من الطلاب، ولا يمكن قبول طلاب آخرين فيها. — This section has reached its student capacity.',
            ]);
        }
    }
}
