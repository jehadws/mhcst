<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CmsReportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('cms/reports/index', [
            'departments' => CmsDepartment::get(['id', 'name']),
            'levels' => CmsLevel::with('department')->get(),
            'subjects' => CmsSubject::get(['id', 'code', 'name']),
            'teachers' => CmsTeacher::get(['id', 'name']),
        ]);
    }

    public function grades(Request $request): Response
    {
        $query = CmsEnrollment::with(['student', 'subject', 'grade']);

        if ($request->filled('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        return Inertia::render('cms/reports/grades', [
            'enrollments' => $query->get(),
            'students' => CmsStudent::get(['id', 'name', 'student_no']),
            'subjects' => CmsSubject::get(['id', 'code', 'name']),
            'filters' => $request->only('student_id', 'subject_id'),
        ]);
    }

    public function attendance(Request $request): Response
    {
        $query = CmsEnrollment::with(['student', 'subject', 'attendance']);

        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }

        return Inertia::render('cms/reports/attendance', [
            'enrollments' => $query->get(),
            'subjects' => CmsSubject::get(['id', 'code', 'name']),
            'filters' => $request->only('subject_id'),
        ]);
    }

    public function topStudents(Request $request): Response
    {
        $students = CmsStudent::with(['level.department', 'enrollments.grade'])
            ->where('status', 'active')
            ->get()
            ->map(function ($student) {
                $grades = $student->enrollments->map(fn ($e) => $e->grade?->total)->filter();
                $avg = $grades->count() > 0 ? round($grades->avg(), 2) : 0;
                $student->gpa_average = $avg;

                return $student;
            })
            ->sortByDesc('gpa_average')
            ->values()
            ->take(20);

        return Inertia::render('cms/reports/top-students', [
            'topStudents' => $students,
        ]);
    }
}
