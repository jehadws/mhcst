<?php

namespace App\Services;

use App\Models\CmsSchedule;

class ScheduleValidatorService
{
    /**
     * Validate schedule conflict.
     *
     * @param array{
     *     teacher_id: int,
     *     level_id: int,
     *     subject_id: int,
     *     day: string,
     *     start_time: string,
     *     end_time: string,
     *     room?: string|null,
     *     academic_year: string,
     *     semester: string
     * } $data
     * @return array<string> List of validation errors, empty if valid
     */
    public function validate(array $data, ?int $ignoreId = null): array
    {
        $errors = [];

        $startTime = strtotime($data['start_time']);
        $endTime = strtotime($data['end_time']);

        if ($endTime <= $startTime) {
            $errors[] = 'End time must be after start time.';

            return $errors;
        }

        $query = CmsSchedule::where('academic_year', $data['academic_year'])
            ->where('semester', $data['semester'])
            ->where('day', $data['day']);

        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        $existing = $query->get();

        foreach ($existing as $schedule) {
            $existStart = strtotime($schedule->start_time);
            $existEnd = strtotime($schedule->end_time);

            $hasTimeOverlap = ($startTime < $existEnd) && ($endTime > $existStart);

            if ($hasTimeOverlap) {
                if ((int) $schedule->teacher_id === (int) $data['teacher_id']) {
                    $errors[] = 'Teacher already has a scheduled class during this time slot.';
                }
                if ((int) $schedule->level_id === (int) $data['level_id']) {
                    $errors[] = 'Level/Section already has a scheduled class during this time slot.';
                }
                if (! empty($data['room']) && ! empty($schedule->room) && strtolower($schedule->room) === strtolower($data['room'])) {
                    $errors[] = "Room {$data['room']} is already occupied during this time slot.";
                }
            }
        }

        // Teacher max 6 hours per day
        $teacherDaySchedules = CmsSchedule::where('academic_year', $data['academic_year'])
            ->where('semester', $data['semester'])
            ->where('day', $data['day'])
            ->where('teacher_id', $data['teacher_id']);

        if ($ignoreId) {
            $teacherDaySchedules->where('id', '!=', $ignoreId);
        }

        $totalSeconds = ($endTime - $startTime);
        foreach ($teacherDaySchedules->get() as $s) {
            $totalSeconds += (strtotime($s->end_time) - strtotime($s->start_time));
        }

        if ($totalSeconds > 6 * 3600) {
            $errors[] = 'Teacher cannot exceed 6 hours of classes per day.';
        }

        return array_unique($errors);
    }
}
