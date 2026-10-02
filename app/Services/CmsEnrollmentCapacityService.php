<?php

namespace App\Services;

use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use Illuminate\Database\QueryException;
use Illuminate\Validation\ValidationException;

/**
 * Seat management for subject offerings.
 *
 * Capacity semantics (same as the legacy checks in StoreEnrollmentRequest and
 * bulkEnroll): cms_levels.capacity limits ACTIVE enrollments per subject among
 * students of the same level for a term. Every authoritative check must run
 * inside the caller's DB::transaction; assertSeatAvailable() takes a row lock
 * on the level so concurrent writers serialize on the same row before counting.
 *
 * On SQLite lockForUpdate is a no-op: the SQLite tests prove the counting
 * logic, while tests/Feature/Cms/EnrollmentCapacityTest.php proves the row
 * locking itself on MySQL only.
 */
class CmsEnrollmentCapacityService
{
    /**
     * Lock the level row so concurrent enrollments for the same level
     * serialize before any seat count. Callers must be inside a transaction.
     */
    public function lockLevel(CmsLevel $level): CmsLevel
    {
        return CmsLevel::query()
            ->whereKey($level->getKey())
            ->lockForUpdate()
            ->firstOrFail();
    }

    /**
     * Seats left for a subject within the level cohort, or null when the
     * level has no capacity limit (capacity = 0).
     */
    public function seatsRemaining(CmsLevel $level, int $subjectId, string $academicYear, string $semester): ?int
    {
        $capacity = max(0, (int) ($level->capacity ?? 0));

        if ($capacity === 0) {
            return null;
        }

        return max(0, $capacity - $this->activeEnrollmentCount($level, $subjectId, $academicYear, $semester));
    }

    /**
     * Authoritative capacity check. Must be called inside a transaction:
     * locks the level row, then counts active enrollments, and throws a
     * user-facing ValidationException when the section is full.
     */
    public function assertSeatAvailable(CmsLevel $level, int $subjectId, string $academicYear, string $semester): void
    {
        $this->lockLevel($level);

        $capacity = max(0, (int) ($level->capacity ?? 0));

        if ($capacity > 0 && $this->activeEnrollmentCount($level, $subjectId, $academicYear, $semester) >= $capacity) {
            throw ValidationException::withMessages([
                'subject_id' => 'هذه الشعبة مكتملة العدد لهذه المادة، ولا يمكن إضافة طلاب آخرين. — This section has reached maximum capacity for this subject.',
            ]);
        }
    }

    /**
     * True when the exception is the (student_id, subject_id, academic_year,
     * semester) unique index firing — expected only under true concurrency,
     * because every enrollment flow pre-checks duplicates and restores
     * soft-deleted rows first. Callers translate it into a friendly
     * ValidationException instead of a 500.
     */
    public static function isDuplicateEnrollmentViolation(QueryException $exception): bool
    {
        $info = $exception->errorInfo ?: ($exception->getPrevious()?->errorInfo ?? []);
        $sqlState = is_array($info) ? ($info[0] ?? null) : null;
        $driverCode = is_array($info) ? ($info[1] ?? null) : null;
        $message = strtolower($exception->getMessage());

        if (in_array($sqlState, ['23000', '23505'], true)) {
            return true;
        }

        if (in_array((int) $driverCode, [1062, 19, 23505], true)) {
            return true;
        }

        return str_contains($message, 'duplicate entry')
            || str_contains($message, 'unique constraint');
    }

    private function activeEnrollmentCount(CmsLevel $level, int $subjectId, string $academicYear, string $semester): int
    {
        return CmsEnrollment::query()
            ->where('subject_id', $subjectId)
            ->where('academic_year', $academicYear)
            ->where('semester', $semester)
            ->where('status', 'active')
            ->whereHas('student', function ($query) use ($level): void {
                $query->where('level_id', $level->getKey());
            })
            ->count();
    }
}
