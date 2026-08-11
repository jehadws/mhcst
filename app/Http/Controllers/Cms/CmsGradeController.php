<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\UpdateGradeRequest;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsSubject;
use App\Services\CmsGradeImportService;
use App\Services\CmsSpreadsheetService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CmsGradeController extends Controller
{
    public function index(Request $request): Response
    {
        $subjects = CmsSubject::get(['id', 'code', 'name']);
        $selectedSubjectId = $request->input('subject_id', $subjects->first()?->id);

        $enrollments = [];
        if ($selectedSubjectId) {
            $enrollments = CmsEnrollment::with(['student', 'grade'])
                ->where('subject_id', $selectedSubjectId)
                ->where('status', 'active')
                ->get();
        }

        return Inertia::render('cms/grades/index', [
            'subjects' => $subjects,
            'selectedSubjectId' => (int) $selectedSubjectId,
            'enrollments' => $enrollments,
        ]);
    }

    public function update(UpdateGradeRequest $request)
    {
        $data = $request->validated();
        $enrollmentId = $data['enrollment_id'];

        $grade = CmsGrade::firstOrNew(['enrollment_id' => $enrollmentId]);
        $grade->fill($data);
        $grade->entered_by = auth()->id();
        $grade->entered_at = now();
        $grade->save();

        return redirect()->back()->with('success', 'Grade updated successfully.');
    }

    public function bulkUpdate(Request $request)
    {
        $request->validate([
            'grades' => ['required', 'array'],
            'grades.*.enrollment_id' => ['required', 'exists:cms_enrollments,id'],
            'grades.*.midterm' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'grades.*.final' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'grades.*.assignments' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'grades.*.projects' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'grades.*.participation' => ['nullable', 'numeric', 'min:0', 'max:100'],
        ]);

        foreach ($request->input('grades') as $item) {
            $grade = CmsGrade::firstOrNew(['enrollment_id' => $item['enrollment_id']]);
            $grade->midterm = $item['midterm'] ?? null;
            $grade->final = $item['final'] ?? null;
            $grade->assignments = $item['assignments'] ?? null;
            $grade->projects = $item['projects'] ?? null;
            $grade->participation = $item['participation'] ?? null;
            $grade->entered_by = auth()->id();
            $grade->entered_at = now();
            $grade->save();
        }

        return redirect()->back()->with('success', 'Grades updated in bulk successfully.');
    }

    public function export(Request $request)
    {
        $format = $request->input('format', 'xlsx');
        $title = $request->input('title', 'كشف درجات المواد');

        $query = CmsEnrollment::with(['student', 'subject', 'grade'])->where('status', 'active');

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        $enrollments = $query->get();

        if ($format === 'pdf') {
            return view('cms.exports.grades', [
                'enrollments' => $enrollments,
                'title' => $title,
                'exportedAt' => now(),
            ]);
        }

        return CmsSpreadsheetService::downloadXlsx(
            'grades-export-'.now()->format('Ymd-His').'.xlsx',
            $title,
            ['رقم القيد', 'اسم الطالب', 'رمز المادة', 'اسم المادة', 'النصفي (30%)', 'النهائي (40%)', 'الواجبات (15%)', 'المشاريع (10%)', 'المشاركة (5%)', 'المجموع', 'التقدير'],
            $enrollments->map(fn (CmsEnrollment $enrollment) => [
                $enrollment->student?->student_no ?? '',
                $enrollment->student?->name ?? '',
                $enrollment->subject?->code ?? '',
                $enrollment->subject?->name ?? '',
                $enrollment->grade?->midterm ?? '',
                $enrollment->grade?->final ?? '',
                $enrollment->grade?->assignments ?? '',
                $enrollment->grade?->projects ?? '',
                $enrollment->grade?->participation ?? '',
                $enrollment->grade?->total ?? '',
                $enrollment->grade?->grade_letter ?? '',
            ])->all()
        );
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv'],
        ]);

        $service = app(CmsGradeImportService::class);
        $result = $service->import($request->file('file'), auth()->id());

        return redirect()->back()
            ->with('success', "تم تحديث درجات {$result['updated']} قيد من الملف.")
            ->with('import_errors', $result['errors']);
    }

    public function importTemplate()
    {
        return CmsSpreadsheetService::downloadXlsx(
            'grades-import-template.xlsx',
            'قالب استيراد الدرجات',
            CmsGradeImportService::HEADERS,
            [[
                '2026-0001',
                'CS101',
                now()->year.'-'.(now()->year + 1),
                'first',
                90,
                85,
                100,
                95,
                100,
            ]]
        );
    }
}
