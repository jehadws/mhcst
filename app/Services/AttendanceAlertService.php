<?php

namespace App\Services;

use App\Models\CmsAttendance;
use App\Models\CmsEnrollment;

class AttendanceAlertService
{
    public function __construct(private CmsAcademicSettingsService $academicSettings) {}

    /**
     * Check if enrollment exceeds configured absence thresholds.
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

        $consecutiveThreshold = $this->academicSettings->consecutiveAbsenceThreshold();
        $rateThreshold = $this->academicSettings->absenceRateThreshold();

        $reasons = [];
        if ($consecutiveAbsences >= $consecutiveThreshold) {
            $reasons[] = "Student has {$consecutiveAbsences} consecutive absences.";
        }
        if ($absenceRate >= $rateThreshold) {
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
