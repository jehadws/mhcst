<?php

namespace App\Services;

use App\Models\CmsAttendance;
use App\Models\CmsGrade;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

/**
 * Deletes in the academic tree hard-delete the grade and attendance rows they
 * cascade to (those tables have no soft deletes), so any delete whose cascade
 * would erase recorded grades or attendance must be refused first — the admin
 * withdraws the enrollment or clears its records instead.
 */
class CmsDeletionGuard
{
    /**
     * Refuse the delete when any of the given enrollments still carries
     * recorded grades or attendance.
     *
     * @param  iterable<int, int>  $enrollmentIds
     */
    public function assertNoGradeData(iterable $enrollmentIds, string $contextAr, string $contextEn): void
    {
        $ids = Collection::make($enrollmentIds)
            ->map(fn ($id): int => (int) $id)
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            return;
        }

        $grades = CmsGrade::query()->whereIn('enrollment_id', $ids)->count();
        $attendance = CmsAttendance::query()->whereIn('enrollment_id', $ids)->count();

        if ($grades === 0 && $attendance === 0) {
            return;
        }

        throw ValidationException::withMessages([
            'delete' => "لا يمكن حذف {$contextAr} لوجود {$grades} درجة و {$attendance} سجل حضور مرتبطة به، وسيمسح الحذف نهائياً. اسحب التسجيل أو عالج سجلاته أولاً. — Cannot delete {$contextEn}: {$grades} grade record(s) and {$attendance} attendance record(s) are linked to it and would be permanently erased. Withdraw the enrollment or clear its records first.",
        ]);
    }
}
