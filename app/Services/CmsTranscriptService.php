<?php

namespace App\Services;

use App\Models\CmsStudent;
use App\Models\SiteSetting;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class CmsTranscriptService
{
    /**
     * @return array{student: CmsStudent, enrollments: Collection, gpa: float|null, issuedAt: Carbon, instituteNameAr: mixed, instituteNameEn: mixed}
     */
    public function dataForStudent(CmsStudent $student): array
    {
        $student->load('level.department');

        $enrollments = $student->enrollments()
            ->with(['subject', 'grade'])
            ->whereIn('status', ['active', 'completed'])
            ->orderBy('academic_year')
            ->orderBy('semester')
            ->get();

        $gradesWithTotal = $enrollments->filter(fn ($e) => $e->grade?->total !== null);
        $gpa = $gradesWithTotal->isNotEmpty()
            ? round($gradesWithTotal->avg(fn ($e) => (float) $e->grade->total), 2)
            : null;

        return [
            'student' => $student,
            'enrollments' => $enrollments,
            'gpa' => $gpa,
            'issuedAt' => now(),
            'instituteNameAr' => SiteSetting::get('site_name_ar', 'كلية المعايير الحديثة للعلوم والتقنية'),
            'instituteNameEn' => SiteSetting::get('site_name', 'Almaayir Alhaditha College for Science and Technology'),
        ];
    }

    public function render(CmsStudent $student): View
    {
        return view('cms.transcript', $this->dataForStudent($student));
    }
}
