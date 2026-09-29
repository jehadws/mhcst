<?php

namespace App\Services;

use App\Models\CmsStudent;
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
     *     absence_rate_threshold: float,
     *     current_semester: ?string,
     *     subject_registration_open: bool
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
            'current_semester' => $this->currentSemester(),
            'subject_registration_open' => $this->subjectRegistrationOpen(),
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
     * The academic year subjects are registered against. Reuses the existing
     * 'cms.academic_year' settings key — it is already the admin-editable
     * "current year" on the academic settings page.
     */
    public function currentAcademicYear(): ?string
    {
        $value = SiteSetting::get('cms.academic_year');

        return $value !== null && $value !== '' ? $value : null;
    }

    /**
     * The semester (first/second/summer) subjects are registered against.
     * Stored under 'cms.current_semester'; admin UI lands with the
     * subject-registration window settings.
     */
    public function currentSemester(): ?string
    {
        $value = SiteSetting::get('cms.current_semester');

        return in_array($value, ['first', 'second', 'summer'], true) ? $value : null;
    }

    /**
     * Whether the student self-registration window is open. Defaults to open
     * until an admin closes it.
     */
    public function subjectRegistrationOpen(): bool
    {
        $value = SiteSetting::get('cms.subject_registration_open');

        if ($value === null || $value === '') {
            return true;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * The academic term (year + semester) registrations and schedules are
     * keyed against; null components mean the term is not configured yet.
     *
     * @return array{academic_year: ?string, semester: ?string}
     */
    public function currentTerm(): array
    {
        return [
            'academic_year' => $this->currentAcademicYear(),
            'semester' => $this->currentSemester(),
        ];
    }

    /**
     * Whether the self-service registration page can accept this student's
     * submissions: the window is open and the student profile is active.
     *
     * @return array{open: bool, student_active: bool}
     */
    public function registrationWindowFor(CmsStudent $student): array
    {
        return [
            'open' => $this->subjectRegistrationOpen(),
            'student_active' => $student->status === 'active',
        ];
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
        $this->persist('cms.current_semester', (string) ($data['current_semester'] ?? ''));
        $this->persist('cms.subject_registration_open', ($data['subject_registration_open'] ?? true) ? '1' : '0');
    }

    private function persist(string $key, string $value): void
    {
        SiteSetting::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => 'text']
        );
    }
}
