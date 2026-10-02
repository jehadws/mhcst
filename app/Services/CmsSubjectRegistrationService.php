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
     * the current semester (from the CMS academic settings), excluding subjects
     * they already hold a pending, active, or completed enrollment for.
     *
     * @return Collection<int, CmsSubject>
     */
    public function availableFor(CmsStudent $student): Collection
    {
        $departmentId = $student->level?->department_id;
        $semester = $this->academicSettings->currentSemester();

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

        if (! $this->academicSettings->subjectRegistrationOpen()) {
            throw ValidationException::withMessages([
                'subject_ids' => 'Subject registration is currently closed.',
            ]);
        }

        $academicYear = $this->academicSettings->currentAcademicYear();
        $semester = $this->academicSettings->currentSemester();

        if ($academicYear === null || $semester === null) {
            throw ValidationException::withMessages([
                'subject_ids' => 'Subject registration is not available yet — the current academic term is not configured.',
            ]);
        }

        $departmentId = $student->level?->department_id;

        if ($departmentId === null) {
            throw ValidationException::withMessages([
                'subject_ids' => 'Your student profile is not linked to a department.',
            ]);
        }

        $subjectIds = array_values(array_unique(array_map('intval', $subjectIds)));

        if ($subjectIds === []) {
            throw ValidationException::withMessages([
                'subject_ids' => 'Select at least one subject to register.',
            ]);
        }

        $subjects = CmsSubject::query()->whereIn('id', $subjectIds)->get();

        foreach ($subjects as $subject) {
            if ((int) $subject->department_id !== (int) $departmentId) {
                throw ValidationException::withMessages([
                    'subject_ids' => "Subject {$subject->code} does not belong to your department.",
                ]);
            }

            if ($subject->semester !== $semester) {
                throw ValidationException::withMessages([
                    'subject_ids' => "Subject {$subject->code} is not offered in the current semester.",
                ]);
            }

            $blocking = CmsEnrollment::withTrashed()
                ->where('student_id', $student->id)
                ->where('subject_id', $subject->id)
                ->whereNull('deleted_at')
                ->whereIn('status', self::BLOCKING_STATUSES)
                ->exists();

            if ($blocking) {
                throw ValidationException::withMessages([
                    'subject_ids' => "You are already registered for {$subject->code}.",
                ]);
            }

            // Pending picks do not consume seats, but a full section can only
            // shrink — picking into it would create a guaranteed rejection.
            $level = $student->level;

            if ($level !== null) {
                $remaining = $this->capacity->seatsRemaining($level, (int) $subject->id, $academicYear, $semester);

                if ($remaining !== null && $remaining <= 0) {
                    throw ValidationException::withMessages([
                        'subject_ids' => "مادة {$subject->code} ({$subject->name}): الشعبة مكتملة العدد حالياً. يمكنك اختيار مادة أخرى أو التواصل مع إدارة الكلية.",
                    ]);
                }
            }
        }

        $registered = 0;

        DB::transaction(function () use ($student, $subjects, $academicYear, $semester, &$registered) {
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
                        'enrollment_date' => now(),
                    ]);
                } else {
                    try {
                        CmsEnrollment::create([
                            'student_id' => $student->id,
                            'subject_id' => $subject->id,
                            'academic_year' => $academicYear,
                            'semester' => $semester,
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
     * Approve pending self-registered enrollments in bulk. Only rows that are
     * currently `pending` are flipped to `active`; anything already handled is
     * left untouched. Each row is capacity-checked under the level row lock
     * inside one transaction, so approval can never overflow a section —
     * over-capacity rows stay `pending` and are reported as skipped. Each
     * approved registration notifies the student by email after the commit.
     *
     * @param  list<int>  $enrollmentIds
     * @return array{approved: int, skipped: list<string>}
     */
    public function approveRegistrations(array $enrollmentIds): array
    {
        $enrollmentIds = array_values(array_unique(array_map('intval', $enrollmentIds)));

        if ($enrollmentIds === []) {
            return ['approved' => 0, 'skipped' => []];
        }

        $flipped = CmsEnrollment::query()
            ->whereIn('id', $enrollmentIds)
            ->where('status', 'pending')
            ->with(['student.level', 'subject'])
            ->get();

        if ($flipped->isEmpty()) {
            return ['approved' => 0, 'skipped' => []];
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

        return ['approved' => $approved->count(), 'skipped' => $skipped];
    }

    /**
     * Reject a pending self-registered enrollment. The pick becomes
     * `withdrawn`, which frees the subject up for re-registration. The
     * student is notified by email so the rejection is not silent.
     */
    public function rejectRegistration(CmsEnrollment $enrollment): CmsEnrollment
    {
        if ($enrollment->status !== 'pending') {
            throw ValidationException::withMessages([
                'enrollment' => 'Only pending registrations can be rejected.',
            ]);
        }

        $enrollment->update(['status' => 'withdrawn']);
        $enrollment = $enrollment->refresh();

        $this->registrationNotifier->notifyRejected($enrollment);

        return $enrollment;
    }
}
