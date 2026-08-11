<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\StoreEnrollmentRequest;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CmsEnrollmentController extends Controller
{
    public function index(Request $request): Response
    {
        $query = CmsEnrollment::with(['student', 'subject.department']);

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->academic_year);
        }

        if ($request->filled('semester')) {
            $query->where('semester', $request->semester);
        }

        return Inertia::render('cms/enrollments/index', [
            'enrollments' => $query->latest()->paginate(15)->withQueryString(),
            'subjects' => CmsSubject::get(['id', 'code', 'name']),
            'filters' => $request->only('subject_id', 'academic_year', 'semester'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('cms/enrollments/create', [
            'students' => CmsStudent::get(['id', 'name', 'student_no']),
            'subjects' => CmsSubject::get(['id', 'code', 'name']),
            'levels' => CmsLevel::with('department')->get(),
        ]);
    }

    public function store(StoreEnrollmentRequest $request)
    {
        CmsEnrollment::create($request->validated());

        return redirect()->route('cms.enrollments.index')->with('success', 'Enrollment created successfully.');
    }

    public function bulkEnroll(Request $request)
    {
        $request->validate([
            'level_id' => ['required', 'exists:cms_levels,id'],
            'subject_id' => ['required', 'exists:cms_subjects,id'],
            'academic_year' => ['required', 'string', 'max:20'],
            'semester' => ['required', 'in:first,second,summer'],
        ]);

        $students = CmsStudent::where('level_id', $request->level_id)->where('status', 'active')->get();
        $count = 0;

        foreach ($students as $student) {
            $exists = CmsEnrollment::where('student_id', $student->id)
                ->where('subject_id', $request->subject_id)
                ->where('academic_year', $request->academic_year)
                ->where('semester', $request->semester)
                ->exists();

            if (! $exists) {
                CmsEnrollment::create([
                    'student_id' => $student->id,
                    'subject_id' => $request->subject_id,
                    'academic_year' => $request->academic_year,
                    'semester' => $request->semester,
                    'status' => 'active',
                ]);
                $count++;
            }
        }

        return redirect()->route('cms.enrollments.index')->with('success', "Enrolled {$count} students successfully.");
    }

    public function destroy(CmsEnrollment $enrollment)
    {
        $enrollment->delete();

        return redirect()->route('cms.enrollments.index')->with('success', 'Enrollment deleted successfully.');
    }
}
