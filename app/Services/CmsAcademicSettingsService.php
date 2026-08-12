<?php

namespace App\Services;

use App\Models\SiteSetting;

class CmsAcademicSettingsService
{
    public function __construct(private GradeLockService $gradeLock) {}

    /**
     * @return array{
     *     grade_entry_deadline: ?string,
     *     grades_locked: bool,
     *     is_locked: bool,
     *     academic_year: ?string,
     *     semester_start: ?string,
     *     semester_end: ?string,
     *     consecutive_absence_threshold: int,
     *     absence_rate_threshold: float
     * }
     */
    public function settings(): array
    {
        return [
            ...$this->gradeLock->settings(),
            'academic_year' => SiteSetting::get('cms.academic_year') ?: null,
            'semester_start' => SiteSetting::get('cms.semester_start') ?: null,
            'semester_end' => SiteSetting::get('cms.semester_end') ?: null,
            'consecutive_absence_threshold' => $this->consecutiveAbsenceThreshold(),
            'absence_rate_threshold' => $this->absenceRateThreshold(),
        ];
    }

    public function consecutiveAbsenceThreshold(): int
    {
        $value = SiteSetting::get('cms.consecutive_absence_threshold');

        return $value !== null && $value !== '' ? max(1, (int) $value) : 3;
    }

    public function absenceRateThreshold(): float
    {
        $value = SiteSetting::get('cms.absence_rate_threshold');

        return $value !== null && $value !== '' ? max(1.0, (float) $value) : 20.0;
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateSettings(array $data): void
    {
        $this->gradeLock->updateSettings([
            'grade_entry_deadline' => $data['grade_entry_deadline'] ?? null,
            'grades_locked' => $data['grades_locked'] ?? false,
        ]);

        $this->persist('cms.academic_year', $data['academic_year'] ?? '');
        $this->persist('cms.semester_start', $data['semester_start'] ?? '');
        $this->persist('cms.semester_end', $data['semester_end'] ?? '');
        $this->persist('cms.consecutive_absence_threshold', (string) ($data['consecutive_absence_threshold'] ?? 3));
        $this->persist('cms.absence_rate_threshold', (string) ($data['absence_rate_threshold'] ?? 20));
    }

    private function persist(string $key, string $value): void
    {
        SiteSetting::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => 'text']
        );
    }
}
