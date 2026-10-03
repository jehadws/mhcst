<?php

namespace App\Services;

use App\Models\CmsAuditLog;
use App\Models\CmsEnrollment;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use Illuminate\Database\QueryException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class CmsSubjectRegistrationService
{
    /**
     * Enrollment statuses that occupy a spot and block re-registration.
     * Withdrawn (rejected) and dropped picks free the subject up again.
     *
     * @var list<string>
     */
    private const BLOCKING_STATUSES = ['pending', 'active', 'completed'];

    public function __construct(
        private CmsAcademicSettingsService $academicSettings,
        private CmsEnrollmentCapacityService $capacity,
        private RegistrationStatusNotifier $registrationNotifier,
    ) {}

    /**
     * Subjects the student may self-register: their department's subjects for
     * the current term (from the CMS academic settings), excluding subjects
     * they already hold a pending, active, or completed enrollment for.
     *
     * @return Collection<int, CmsSubject>
     */
    public function availableFor(CmsStudent $student): Collection
    {
        $departmentId = $student->level?->department_id;
        $semester = $this->academicSettings->currentTerm()['semester'];

        if ($departmentId === null || $semester === null) {
            return collect();
        }

        return CmsSubject::query()
            ->where('department_id', $departmentId)
            ->where('semester', $semester)
            ->whereNotExists(function ($query) use ($student) {
                $query->selectRaw(1)
                    ->from('cms_enrollments')
                    ->whereColumn('cms_enrollments.subject_id', 'cms_subjects.id')
                    ->where('cms_enrollments.student_id', $student->id)
                    ->whereNull('cms_enrollments.deleted_at')
                    ->whereIn('cms_enrollments.status', self::BLOCKING_STATUSES);
            })
            ->orderBy('code')
            ->get();
    }

    /**
     * Dry-run of register(): every reason the given subject selection would
     * be rejected right now, as user-facing messages. Powers the confirmation
     * dialog's pre-submit problems list and keeps register() as the single
     * source of the same rules.
     *
     * @param  list<int>  $subjectIds
     * @return list<string>
     */
    public function evaluate(CmsStudent $student, array $subjectIds): array
    {
        $problems = [];

        if ($student->status !== 'active') {
            return ['Only active students can register for subjects.'];
        }

        if (! $this->academicSettings->registrationWindow()['open']) {
            $problems[] = 'Subject registration is currently closed.';

            return $problems;
        }

        $term = $this->academicSettings->currentTerm();
        $academicYear = $term['academic_year'];
        $semester = $term['semester'];

        if ($academicYear === null || $semester === null) {
            $problems[] = 'Subject registration is not available yet — the current academic term is not configured.';

            return $problems;
        }

        $departmentId = $student->level?->department_id;

        if ($departmentId === null) {
            $problems[] = 'Your student profile is not linked to a department.';

            return $problems;
        }

        $subjectIds = array_values(array_unique(array_map('intval', $subjectIds)));

        if ($subjectIds === []) {
            $problems[] = 'Select at least one subject to register.';

            return $problems;
        }

        $subjects = CmsSubject::query()->whereIn('id', $subjectIds)->get();

        foreach ($subjects as $subject) {
            if ((int) $subject->department_id !== (int) $departmentId) {
                $problems[] = "Subject {$subject->code} does not belong to your department.";

                continue;
            }

            if ($subject->semester !== $semester) {
                $problems[] = "Subject {$subject->code} is not offered in the current semester.";

                continue;
            }

            $blocking = CmsEnrollment::withTrashed()
                ->where('student_id', $student->id)
                ->where('subject_id', $subject->id)
                ->whereNull('deleted_at')
                ->whereIn('status', self::BLOCKING_STATUSES)
                ->exists();

            if ($blocking) {
                $problems[] = "You are already registered for {$subject->code}.";

                continue;
            }

            // Pending picks do not consume seats, but a full section can only
            // shrink — picking into it would create a guaranteed rejection.
            $level = $student->level;

            if ($level !== null) {
                $remaining = $this->capacity->seatsRemaining($level, (int) $subject->id, (string) $academicYear, (string) $semester);

                if ($remaining !== null && $remaining <= 0) {
                    $problems[] = "مادة {$subject->code} ({$subject->name}): الشعبة مكتملة العدد حالياً. يمكنك اختيار مادة أخرى أو التواصل مع إدارة الكلية.";
                }
            }
        }

        return $problems;
    }

    /**
     * Register the student for the given subjects as a self-service pick.
     * Creates pending enrollments for the current term that an admin must
     * approve. Validates every rule before writing anything.
     *
     * @param  list<int>  $subjectIds
     * @return int Number of enrollments created or re-opened.
     */
    public function register(CmsStudent $student, array $subjectIds): int
    {
        if ($student->status !== 'active') {
            abort(403, 'Only active students can register for subjects.');
        }

        $problems = $this->evaluate($student, $subjectIds);

        if ($problems !== []) {
            throw ValidationException::withMessages([
                'subject_ids' => $problems,
            ]);
        }

        $term = $this->academicSettings->currentTerm();
        $academicYear = (string) $term['academic_year'];
        $semester = (string) $term['semester'];
        $activeTerm = $this->academicSettings->activeTerm();

        $subjects = CmsSubject::query()->whereIn('id', $subjectIds)->get();

        $registered = 0;

        DB::transaction(function () use ($student, $subjects, $academicYear, $semester, $activeTerm, &$registered) {
            foreach ($subjects as $subject) {
                $existing = CmsEnrollment::withTrashed()
                    ->where('student_id', $student->id)
                    ->where('subject_id', $subject->id)
                    ->where('academic_year', $academicYear)
                    ->where('semester', $semester)
                    ->first();

                if ($existing) {
                    // A previously withdrawn/dropped or trashed pick for this
                    // term is re-opened instead of inserting a duplicate row.
                    if ($existing->trashed()) {
                        $existing->restore();
                    }
                    $existing->update([
                        'status' => 'pending',
                        'source' => 'self',
                        'term_id' => $activeTerm?->id,
                        'withdrawn_reason' => null,
                        'enrollment_date' => now(),
                    ]);
                } else {
                    try {
                        CmsEnrollment::create([
                            'student_id' => $student->id,
                            'subject_id' => $subject->id,
                            'academic_year' => $academicYear,
                            'semester' => $semester,
                            'term_id' => $activeTerm?->id,
                            'enrollment_date' => now(),
                            'status' => 'pending',
                            'source' => 'self',
                        ]);
                    } catch (QueryException $exception) {
                        // A concurrent identical submission wins the unique index.
                        if (CmsEnrollmentCapacityService::isDuplicateEnrollmentViolation($exception)) {
                            throw ValidationException::withMessages([
                                'subject_ids' => "أنت مسجل بالفعل في مادة {$subject->code} لنفس الفصل الدراسي.",
                            ]);
                        }

                        throw $exception;
                    }
                }

                $registered++;
            }

            // The dashboard route lives outside the cms.audit middleware, so
            // self-registrations are audited explicitly here.
            CmsAuditLog::create([
                'user_id' => auth()->id(),
                'action' => 'post',
                'entity_type' => 'enrollments',
                'entity_id' => null,
                'new_values' => [
                    'student_id' => $student->id,
                    'subject_ids' => $subjects->pluck('id')->all(),
                    'academic_year' => $academicYear,
                    'semester' => $semester,
                    'source' => 'self',
                ],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        });

        return $registered;
    }

    /**
     * The student drops one of their own pending/active picks. Allowed while
     * the term's add/drop deadline has not passed (a term without a deadline
     * never closes self-drop); afterwards only admins withdraw, with a reason.
     */
    public function dropRegistration(CmsStudent $student, CmsEnrollment $enrollment): CmsEnrollment
    {
        if (! in_array($enrollment->status, ['pending', 'active'], true)) {
            throw ValidationException::withMessages([
                'enrollment' => 'Only pending or active registrations can be dropped.',
            ]);
        }

        if (! $this->academicSettings->registrationWindow()['self_drop_open']) {
            throw ValidationException::withMessages([
                'enrollment' => 'The add/drop deadline has passed — contact administration to withdraw. — انتهى موعد الإضافة والحذف، يُرجى التواصل مع الإدارة.',
            ]);
        }

        $enrollment->update(['status' => 'dropped']);

        // The drop is confirmed to the student by email; best-effort, so a
        // mail outage never blocks or rolls back the drop itself.
        try {
            $this->registrationNotifier->notifyDropped($enrollment->refresh());
        } catch (\Throwable $exception) {
            Log::warning('registration drop notification failed', [
                'enrollment_id' => $enrollment->id,
                'error' => $exception->getMessage(),
            ]);
        }

        return $enrollment->refresh();
    }

    /**
     * Approve pending self-registered enrollments in bulk. Only rows that are
     * currently `pending` are flipped to `active`; anything already handled is
     * left untouched. The term's dated registration window must be open.
     * Each row is capacity-checked under the level row lock inside one
     * transaction, so approval can never overflow a section — over-capacity
     * rows stay `pending` and are reported as skipped. Each approved
     * registration notifies the student by email after the commit.
     *
     * @param  list<int>  $enrollmentIds
     * @return array{approved: int, skipped: list<string>, approved_enrollments: Collection<int, CmsEnrollment>}
     */
    public function approveRegistrations(array $enrollmentIds): array
    {
        $this->academicSettings->ensureRegistrationDatesOpen();

        $enrollmentIds = array_values(array_unique(array_map('intval', $enrollmentIds)));

        if ($enrollmentIds === []) {
            return ['approved' => 0, 'skipped' => [], 'approved_enrollments' => collect()];
        }

        $flipped = CmsEnrollment::query()
            ->whereIn('id', $enrollmentIds)
            ->where('status', 'pending')
            ->with(['student.level', 'subject'])
            ->get();

        if ($flipped->isEmpty()) {
            return ['approved' => 0, 'skipped' => [], 'approved_enrollments' => collect()];
        }

        $approved = collect();
        $skipped = [];

        DB::transaction(function () use ($flipped, $approved, &$skipped): void {
            foreach ($flipped as $enrollment) {
                $level = $enrollment->student?->level;

                try {
                    if ($level !== null) {
                        $this->capacity->assertSeatAvailable(
                            $level,
                            (int) $enrollment->subject_id,
                            (string) $enrollment->academic_year,
                            (string) $enrollment->semester,
                        );
                    }
                } catch (ValidationException) {
                    // Approval can never overflow a section: leave the pick
                    // pending and report it to the admin.
                    $skipped[] = $enrollment->subject?->code ?? (string) $enrollment->subject_id;

                    continue;
                }

                $enrollment->update(['status' => 'active']);
                $approved->push($enrollment);
            }
        });

        foreach ($approved as $enrollment) {
            try {
                $this->registrationNotifier->notifyApproved($enrollment);
            } catch (\Throwable $exception) {
                Log::warning('registration approval notification failed', [
                    'enrollment_id' => $enrollment->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return ['approved' => $approved->count(), 'skipped' => $skipped, 'approved_enrollments' => $approved];
    }

    /**
     * Bulk reject of pending self-registered picks: every row flips to
     * `withdrawn` with the (preset or free-text) reason the student sees,
     * and each student is notified by email. Rows that are no longer
     * `pending` (already approved, dropped, …) are left untouched and
     * reported as skipped so a stale selection never corrupts state.
     *
     * @param  list<int>  $enrollmentIds
     * @return array{rejected: int, skipped: int, rejected_enrollments: Collection<int, CmsEnrollment>}
     */
    public function rejectRegistrations(array $enrollmentIds, ?string $reason = null): array
    {
        $enrollmentIds = array_values(array_unique(array_map('intval', $enrollmentIds)));

        if ($enrollmentIds === []) {
            return ['rejected' => 0, 'skipped' => 0, 'rejected_enrollments' => collect()];
        }

        $rejected = collect();
        $skipped = 0;

        DB::transaction(function () use ($enrollmentIds, $reason, $rejected, &$skipped): void {
            foreach (CmsEnrollment::query()->whereIn('id', $enrollmentIds)->with(['student', 'subject'])->get() as $enrollment) {
                if ($enrollment->status !== 'pending') {
                    $skipped++;

                    continue;
                }

                $enrollment->update(['status' => 'withdrawn', 'withdrawn_reason' => $reason]);
                $rejected->push($enrollment);
            }
        });

        foreach ($rejected as $enrollment) {
            try {
                $this->registrationNotifier->notifyRejected($enrollment->refresh());
            } catch (\Throwable $exception) {
                Log::warning('registration rejection notification failed', [
                    'enrollment_id' => $enrollment->id,
                    'error' => $exception->getMessage(),
                ]);
            }
        }

        return ['rejected' => $rejected->count(), 'skipped' => $skipped, 'rejected_enrollments' => $rejected];
    }

    /**
     * Ready-made Arabic WhatsApp follow-up for one enrollment (admin-side),
     * mirroring the application notifier's contract.
     *
     * @return array{link: ?string, message: string}
     */
    public function waPayload(CmsEnrollment $enrollment, string $event, ?string $reason = null): array
    {
        return $this->registrationNotifier->waPayload($enrollment, $event, $reason);
    }

    /**
     * Reject a pending self-registered enrollment. The pick becomes
     * `withdrawn`, which frees the subject up for re-registration. The
     * student is notified by email so the rejection is not silent.
     */
    public function rejectRegistration(CmsEnrollment $enrollment, ?string $reason = null): CmsEnrollment
    {
        if ($enrollment->status !== 'pending') {
            throw ValidationException::withMessages([
                'enrollment' => 'Only pending registrations can be rejected.',
            ]);
        }

        $enrollment->update(['status' => 'withdrawn', 'withdrawn_reason' => $reason]);
        $enrollment = $enrollment->refresh();

        $this->registrationNotifier->notifyRejected($enrollment);

        return $enrollment;
    }

    /**
     * Admin withdrawal of a pending/active enrollment — the path students
     * must take once the add/drop deadline has passed. Always carries a
     * reason so the student sees why the pick was removed.
     */
    public function withdrawRegistration(CmsEnrollment $enrollment, string $reason): CmsEnrollment
    {
        if (! in_array($enrollment->status, ['pending', 'active'], true)) {
            throw ValidationException::withMessages([
                'enrollment' => 'Only pending or active registrations can be withdrawn.',
            ]);
        }

        $enrollment->update(['status' => 'withdrawn', 'withdrawn_reason' => $reason]);
        $enrollment = $enrollment->refresh();

        $this->registrationNotifier->notifyRejected($enrollment);

        return $enrollment;
    }
}
