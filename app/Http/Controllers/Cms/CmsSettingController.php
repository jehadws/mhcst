<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\CmsDepartment;
use App\Services\CmsAcademicSettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CmsSettingController extends Controller
{
    public function edit(CmsAcademicSettingsService $academicSettings): Response
    {
        $settings = $academicSettings->settings();

        $departments = CmsDepartment::query()
            ->with(['levels' => fn ($query) => $query->orderBy('year')->orderBy('section')])
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($department) => [
                'id' => $department->id,
                'name' => $department->name,
                'levels' => $department->levels
                    ->map(fn ($level) => [
                        'id' => $level->id,
                        'year' => (int) $level->year,
                        'section' => $level->section,
                    ])
                    ->all(),
            ])
            ->all();

        return Inertia::render('cms/settings/index', [
            'settings' => [
                ...$settings,
                'admission_department_ids' => [],
                'admission_level_ids' => $this->effectiveAdmissionLevelIds($settings, $departments),
            ],
            'departments' => $departments,
            'academicYearOptions' => $this->academicYearOptions($settings['academic_year']),
        ]);
    }

    public function update(Request $request, CmsAcademicSettingsService $academicSettings)
    {
        $data = $request->validate([
            'grade_entry_deadline' => ['nullable', 'date'],
            'grades_locked' => ['boolean'],
            'academic_year' => ['nullable', 'regex:/^\d{4}-\d{4}$/'],
            'semester_start' => ['nullable', 'date'],
            'semester_end' => ['nullable', 'date', 'after_or_equal:semester_start'],
            'consecutive_absence_threshold' => ['nullable', 'integer', 'min:1', 'max:30'],
            'absence_rate_threshold' => ['nullable', 'numeric', 'min:1', 'max:100'],
            'current_semester' => ['nullable', 'in:first,second,summer'],
            'subject_registration_open' => ['boolean'],
            'registration_starts_at' => ['nullable', 'date'],
            'registration_ends_at' => ['nullable', 'date', 'after_or_equal:registration_starts_at'],
            'add_drop_deadline' => [
                'nullable',
                'date',
                'after_or_equal:registration_starts_at',
                // before_or_equal rejects every value when the compared field
                // is missing, so it only applies alongside a semester end date.
                ...$request->filled('semester_end') ? ['before_or_equal:semester_end'] : [],
            ],
            'admission_open' => ['boolean'],
            'admission_opens_at' => ['nullable', 'date'],
            'admission_closes_at' => ['nullable', 'date', 'after_or_equal:admission_opens_at'],
            'admission_department_ids' => ['nullable', 'array'],
            'admission_department_ids.*' => ['integer', 'exists:cms_departments,id'],
            'admission_level_ids' => ['nullable', 'array'],
            'admission_level_ids.*' => ['integer', 'exists:cms_levels,id'],
        ]);

        $academicSettings->updateSettings($data);

        return redirect()->route('cms.settings.edit')->with('success', 'Academic settings updated successfully.');
    }

    /**
     * The level matrix is the single scope control, so the stored department
     * list collapses into level ids on load: an explicit level selection
     * survives as-is, a department-only restriction widens to that
     * department's levels, and stale ids (deleted levels) drop out instead of
     * failing the exists validation on the next save.
     *
     * @param  array<string, mixed>  $settings
     * @param  array<int, array{id: int, name: string, levels: array<int, array{id: int, year: int, section: string}>}>  $departments
     * @return list<int>
     */
    private function effectiveAdmissionLevelIds(array $settings, array $departments): array
    {
        $levelsByDepartment = [];
        $existingLevelIds = [];

        foreach ($departments as $department) {
            $levelsByDepartment[$department['id']] = array_column($department['levels'], 'id');
            $existingLevelIds = [...$existingLevelIds, ...$levelsByDepartment[$department['id']]];
        }

        $levelIds = array_values(array_intersect($settings['admission_level_ids'] ?? [], $existingLevelIds));

        if ($levelIds !== []) {
            return $levelIds;
        }

        $departmentIds = array_values(
            array_intersect($settings['admission_department_ids'] ?? [], array_keys($levelsByDepartment)),
        );

        if ($departmentIds === []) {
            return [];
        }

        return array_values(array_unique(array_merge(
            ...array_map(fn (int $id) => $levelsByDepartment[$id], $departmentIds),
        )));
    }

    /**
     * Select options for the academic year, centred on the current one
     * (Libyan academic years roll over in September) and always including the
     * stored value so an older configuration stays selectable.
     *
     * @return list<string>
     */
    private function academicYearOptions(?string $stored): array
    {
        $today = Carbon::today();
        $startYear = (int) $today->format('n') >= 9 ? (int) $today->format('Y') : (int) $today->format('Y') - 1;

        $options = collect(range($startYear - 1, $startYear + 2))
            ->map(fn (int $year) => $year.'-'.($year + 1))
            ->push($stored)
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->all();

        return $options;
    }
}
