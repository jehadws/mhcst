<?php

namespace App\Services;

use App\Models\CmsAttendance;
use App\Models\CmsEnrollment;

class AttendanceAlertService
{
    /**
     * Check if enrollment exceeds threshold (3 consecutive absences or >= 20% absence rate).
     *
     * @return array{has_alert: bool, consecutive_absences: int, absence_rate: float, alert_reasons: array<string>}
     */
    public function checkEnrollmentAlerts(CmsEnrollment $enrollment): array
    {
        $records = CmsAttendance::where('enrollment_id', $enrollment->id)
            ->orderBy('date', 'desc')
            ->get();

        $totalSessions = $records->count();
        if ($totalSessions === 0) {
            return [
                'has_alert' => false,
                'consecutive_absences' => 0,
                'absence_rate' => 0.0,
                'alert_reasons' => [],
            ];
        }

        $absentCount = $records->where('status', 'absent')->count();
        $absenceRate = round(($absentCount / $totalSessions) * 100, 1);

        $consecutiveAbsences = 0;
        foreach ($records as $record) {
            if ($record->status === 'absent') {
                $consecutiveAbsences++;
            } else {
                break;
            }
        }

        $reasons = [];
        if ($consecutiveAbsences >= 3) {
            $reasons[] = "Student has {$consecutiveAbsences} consecutive absences.";
        }
        if ($absenceRate >= 20.0) {
            $reasons[] = "Absence rate reached {$absenceRate}%.";
        }

        return [
            'has_alert' => count($reasons) > 0,
            'consecutive_absences' => $consecutiveAbsences,
            'absence_rate' => $absenceRate,
            'alert_reasons' => $reasons,
        ];
    }
}
