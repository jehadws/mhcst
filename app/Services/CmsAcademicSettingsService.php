<?php

namespace App\Services;

use App\Models\CmsStudent;
use App\Models\CmsTerm;
use App\Models\SiteSetting;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
     *     subject_registration_open: bool,
     *     registration_starts_at: ?string,
     *     registration_ends_at: ?string,
     *     add_drop_deadline: ?string,
     *     admission_open: bool,
     *     admission_opens_at: ?string,
     *     admission_closes_at: ?string,
     *     admission_department_ids: list<int>,
     *     admission_level_ids: list<int>,
     *     admission_is_open: bool
     * }
     */
    public function settings(): array
    {
        $activeTerm = $this->activeTerm();

        return [
            ...$this->gradeLock->settings(),
            'academic_year' => SiteSetting::get('cms.academic_year') ?: null,
            'semester_start' => SiteSetting::get('cms.semester_start') ?: null,
            'semester_end' => SiteSetting::get('cms.semester_end') ?: null,
            'consecutive_absence_threshold' => $this->consecutiveAbsenceThreshold(),
            'absence_rate_threshold' => $this->absenceRateThreshold(),
            'current_semester' => $this->currentSemester(),
            'subject_registration_open' => $this->subjectRegistrationOpen(),
            'registration_starts_at' => $activeTerm?->registration_starts_at?->toDateString(),
            'registration_ends_at' => $activeTerm?->registration_ends_at?->toDateString(),
            'add_drop_deadline' => $activeTerm?->add_drop_deadline?->toDateString(),
            'admission_open' => $this->admissionSwitchOpen(),
            'admission_opens_at' => SiteSetting::get('cms.admission_opens_at') ?: null,
            'admission_closes_at' => SiteSetting::get('cms.admission_closes_at') ?: null,
            'admission_department_ids' => $this->allowedDepartmentIds() ?? [],
            'admission_level_ids' => $this->allowedLevelIds() ?? [],
            'admission_is_open' => $this->admissionOpen(),
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
     * keyed against. The active cms_terms row wins when one exists; the
     * legacy settings pair is the fallback so pre-terms configuration keeps
     * working.
     *
     * @return array{academic_year: ?string, semester: ?string}
     */
    public function currentTerm(): array
    {
        $term = $this->activeTerm();

        if ($term !== null) {
            return [
                'academic_year' => $term->academic_year,
                'semester' => $term->semester,
            ];
        }

        return [
            'academic_year' => $this->currentAcademicYear(),
            'semester' => $this->currentSemester(),
        ];
    }

    /**
     * The single active term, or null when no term has been activated yet
     * (pre-terms legacy configuration).
     */
    public function activeTerm(): ?CmsTerm
    {
        return CmsTerm::query()->where('is_active', true)->first();
    }

    /**
     * The dated registration window of the active term, independent of any
     * student. The boolean switch stays as an emergency kill-switch; without
     * an active term or explicit dates the legacy behaviour applies (open
     * until the term identity is missing or the switch is off).
     *
     * @return array{open: bool, reason: ?string, starts_at: ?string, ends_at: ?string, add_drop_deadline: ?string, self_drop_open: bool}
     */
    public function registrationWindow(): array
    {
        $term = $this->activeTerm();

        $startsAt = $term?->registration_starts_at?->toDateString();
        $endsAt = $term?->registration_ends_at?->toDateString();
        $addDropDeadline = $term?->add_drop_deadline?->toDateString();

        // Self-drop is governed by the add/drop deadline only — not by the
        // registration switch or the registration start/end dates: dropping
        // always reduces load, never adds it. A term without a deadline never
        // closes self-drop.
        $selfDropOpen = $term?->add_drop_deadline === null || ! today()->gt($term->add_drop_deadline);

        if (! $this->subjectRegistrationOpen()) {
            return ['open' => false, 'reason' => 'closed_switch', 'starts_at' => $startsAt, 'ends_at' => $endsAt, 'add_drop_deadline' => $addDropDeadline, 'self_drop_open' => $selfDropOpen];
        }

        if ($term !== null) {
            if ($term->registration_starts_at !== null && today()->lt($term->registration_starts_at)) {
                return ['open' => false, 'reason' => 'not_started', 'starts_at' => $startsAt, 'ends_at' => $endsAt, 'add_drop_deadline' => $addDropDeadline, 'self_drop_open' => $selfDropOpen];
            }

            if ($term->registration_ends_at !== null && today()->gt($term->registration_ends_at)) {
                return ['open' => false, 'reason' => 'ended', 'starts_at' => $startsAt, 'ends_at' => $endsAt, 'add_drop_deadline' => $addDropDeadline, 'self_drop_open' => $selfDropOpen];
            }
        }

        return ['open' => true, 'reason' => null, 'starts_at' => $startsAt, 'ends_at' => $endsAt, 'add_drop_deadline' => $addDropDeadline, 'self_drop_open' => $selfDropOpen];
    }

    /**
     * Authoritative dated-window check for writes: register() and
     * approveRegistrations() both call this so a window that ended (or has
     * not started) blocks new picks and approvals regardless of what the
     * client shows.
     */
    public function ensureRegistrationDatesOpen(): void
    {
        $window = $this->registrationWindow();

        if (! $window['open']) {
            throw ValidationException::withMessages([
                'subject_ids' => 'Subject registration is currently closed for this term. — تسجيل المواد مغلق حالياً لهذا الفصل.',
            ]);
        }
    }

    /**
     * The admin admission switch. Defaults to open until an admin closes it.
     */
    public function admissionSwitchOpen(): bool
    {
        $value = SiteSetting::get('cms.admission_open');

        if ($value === null || $value === '') {
            return true;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    /**
     * Whether the public admission form accepts new applications: the switch
     * must be on and today must fall inside the optional open/close dates.
     */
    public function admissionOpen(): bool
    {
        if (! $this->admissionSwitchOpen()) {
            return false;
        }

        $opensAt = SiteSetting::get('cms.admission_opens_at');
        $closesAt = SiteSetting::get('cms.admission_closes_at');

        if ($opensAt !== null && $opensAt !== '' && today()->lt(Carbon::parse($opensAt))) {
            return false;
        }

        if ($closesAt !== null && $closesAt !== '' && today()->gt(Carbon::parse($closesAt))) {
            return false;
        }

        return true;
    }

    /**
     * Department ids the admission form may be submitted for; empty means
     * every department is allowed.
     *
     * @return list<int>|null
     */
    public function allowedDepartmentIds(): ?array
    {
        return $this->allowedIdList('cms.admission_department_ids');
    }

    /**
     * Level ids the admission form may be submitted for; empty means every
     * level is allowed.
     *
     * @return list<int>|null
     */
    public function allowedLevelIds(): ?array
    {
        return $this->allowedIdList('cms.admission_level_ids');
    }

    /**
     * Whether the self-service registration page can accept this student's
     * submissions: the term window is open and the student profile is active.
     *
     * @return array{open: bool, reason: ?string, starts_at: ?string, ends_at: ?string, add_drop_deadline: ?string, self_drop_open: bool, student_active: bool}
     */
    public function registrationWindowFor(CmsStudent $student): array
    {
        return [
            ...$this->registrationWindow(),
            'student_active' => $student->status === 'active',
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateSettings(array $data): void
    {
        DB::transaction(function () use ($data) {
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

            $this->persistBoolean('cms.admission_open', (bool) ($data['admission_open'] ?? true));
            $this->persist('cms.admission_opens_at', $data['admission_opens_at'] ?? '');
            $this->persist('cms.admission_closes_at', $data['admission_closes_at'] ?? '');
            $this->persistJson('cms.admission_department_ids', array_values(array_map(intval(...), $data['admission_department_ids'] ?? [])));
            $this->persistJson('cms.admission_level_ids', array_values(array_map(intval(...), $data['admission_level_ids'] ?? [])));

            $this->syncActiveTerm($data);
        });
    }

    /**
     * Upserts the cms_terms row for the (academic_year, semester) pair the
     * admin just saved, stamps its dated window, and makes it the single
     * active term. Backfills created terms are never activated here — only
     * an explicit settings save activates one.
     *
     * @param  array<string, mixed>  $data
     */
    private function syncActiveTerm(array $data): void
    {
        $academicYear = trim((string) ($data['academic_year'] ?? ''));
        $semester = (string) ($data['current_semester'] ?? '');

        if ($academicYear === '' || ! in_array($semester, ['first', 'second', 'summer'], true)) {
            return;
        }

        $term = CmsTerm::query()->updateOrCreate(
            ['academic_year' => $academicYear, 'semester' => $semester],
            [
                'registration_starts_at' => ($data['registration_starts_at'] ?? '') ?: null,
                'registration_ends_at' => ($data['registration_ends_at'] ?? '') ?: null,
                'add_drop_deadline' => ($data['add_drop_deadline'] ?? '') ?: null,
                'is_active' => true,
            ]
        );

        // Exactly one active term: everything else is deactivated. A builder
        // update on purpose — no audit rows for the bulk flip.
        CmsTerm::query()->whereKeyNot($term->id)->update(['is_active' => false]);
    }

    /**
     * @return list<int>|null
     */
    private function allowedIdList(string $key): ?array
    {
        $value = SiteSetting::get($key);

        if (! is_array($value)) {
            return null;
        }

        $ids = array_values(array_filter(array_map(intval(...), $value)));

        return $ids === [] ? null : $ids;
    }

    private function persistJson(string $key, array $value): void
    {
        SiteSetting::updateOrCreate(
            ['key' => $key],
            ['value' => json_encode($value, JSON_UNESCAPED_UNICODE), 'type' => 'json']
        );
    }

    private function persistBoolean(string $key, bool $value): void
    {
        SiteSetting::updateOrCreate(
            ['key' => $key],
            ['value' => $value ? '1' : '0', 'type' => 'boolean']
        );
    }

    private function persist(string $key, string $value): void
    {
        SiteSetting::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'type' => 'text']
        );
    }
}
