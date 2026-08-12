<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Services\CmsAcademicSettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CmsSettingController extends Controller
{
    public function edit(CmsAcademicSettingsService $academicSettings): Response
    {
        return Inertia::render('cms/settings/index', [
            'settings' => $academicSettings->settings(),
        ]);
    }

    public function update(Request $request, CmsAcademicSettingsService $academicSettings)
    {
        $data = $request->validate([
            'grade_entry_deadline' => ['nullable', 'date'],
            'grades_locked' => ['boolean'],
            'academic_year' => ['nullable', 'string', 'max:20'],
            'semester_start' => ['nullable', 'date'],
            'semester_end' => ['nullable', 'date', 'after_or_equal:semester_start'],
            'consecutive_absence_threshold' => ['nullable', 'integer', 'min:1', 'max:30'],
            'absence_rate_threshold' => ['nullable', 'numeric', 'min:1', 'max:100'],
        ]);

        $academicSettings->updateSettings($data);

        return redirect()->route('cms.settings.edit')->with('success', 'Academic settings updated successfully.');
    }
}
