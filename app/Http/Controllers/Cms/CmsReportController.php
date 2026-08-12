<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\CmsAttendance;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\SiteSetting;
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

    public function departments(Request $request)
    {
        $departments = CmsDepartment::with('head')
            ->withCount(['levels', 'subjects', 'students'])
            ->orderBy('name')
            ->get()
            ->map(function (CmsDepartment $department) {
                $teachersCount = CmsSchedule::query()
                    ->whereHas('subject', fn ($query) => $query->where('department_id', $department->id))
                    ->distinct()
                    ->count('teacher_id');

                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'description' => $department->description,
                    'head_name' => $department->head?->name,
                    'levels_count' => $department->levels_count,
                    'subjects_count' => $department->subjects_count,
                    'students_count' => $department->students_count,
                    'teachers_count' => $teachersCount,
                ];
            });

        if ($request->input('format') === 'pdf') {
            return view('cms.exports.departments', [
                'departments' => $departments,
                'title' => $request->input('title', 'Department Summary Report'),
                'exportedAt' => now(),
                'instituteNameAr' => SiteSetting::get('site_name_ar', 'كلية المعايير الحديثة للعلوم والتقنية'),
                'instituteNameEn' => SiteSetting::get('site_name', 'Almaayir Alhaditha College for Science and Technology'),
            ]);
        }

        return Inertia::render('cms/reports/departments', [
            'departments' => $departments,
        ]);
    }

    public function teacherPerformance(): Response
    {
        $teachers = CmsTeacher::query()
            ->withCount('schedules')
            ->orderBy('name')
            ->get()
            ->map(function (CmsTeacher $teacher) {
                $subjectIds = CmsSchedule::query()
                    ->where('teacher_id', $teacher->id)
                    ->distinct()
                    ->pluck('subject_id');

                $enrollmentIds = CmsEnrollment::query()
                    ->whereIn('subject_id', $subjectIds)
                    ->pluck('id');

                $studentsCount = CmsEnrollment::query()
                    ->whereIn('subject_id', $subjectIds)
                    ->distinct()
                    ->count('student_id');

                $gradeTotals = CmsEnrollment::query()
                    ->whereIn('id', $enrollmentIds)
                    ->with('grade')
                    ->get()
                    ->map(fn (CmsEnrollment $enrollment) => $enrollment->grade?->total)
                    ->filter(fn ($total) => $total !== null);

                $attendanceRecords = CmsAttendance::query()
                    ->whereIn('enrollment_id', $enrollmentIds)
                    ->get();

                $attendanceRate = $attendanceRecords->isNotEmpty()
                    ? round(
                        ($attendanceRecords->whereIn('status', ['present', 'late'])->count() / $attendanceRecords->count()) * 100,
                        1
                    )
                    : null;

                return [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'specialization' => $teacher->specialization,
                    'classes_count' => $teacher->schedules_count,
                    'students_count' => $studentsCount,
                    'avg_grade' => $gradeTotals->isNotEmpty() ? round($gradeTotals->avg(), 2) : null,
                    'attendance_rate' => $attendanceRate,
                ];
            });

        return Inertia::render('cms/reports/teacher-performance', [
            'teachers' => $teachers,
        ]);
    }

    public function enrollmentStats(): Response
    {
        $stats = CmsDepartment::query()
            ->withCount([
                'students as active_students_count' => fn ($query) => $query->where('status', 'active'),
            ])
            ->get()
            ->map(function (CmsDepartment $department) {
                $enrollmentQuery = CmsEnrollment::query()
                    ->whereHas('subject', fn ($query) => $query->where('department_id', $department->id));

                return [
                    'id' => $department->id,
                    'name' => $department->name,
                    'active_students' => $department->active_students_count,
                    'active_enrollments' => (clone $enrollmentQuery)->where('status', 'active')->count(),
                    'dropped_enrollments' => (clone $enrollmentQuery)->where('status', 'dropped')->count(),
                    'completed_enrollments' => (clone $enrollmentQuery)->where('status', 'completed')->count(),
                ];
            });

        $monthly = CmsEnrollment::query()
            ->get(['created_at'])
            ->groupBy(fn (CmsEnrollment $enrollment) => $enrollment->created_at->format('Y-m'))
            ->map(fn ($group, $month) => ['month' => $month, 'total' => $group->count()])
            ->sortBy('month')
            ->values();

        return Inertia::render('cms/reports/enrollment-stats', [
            'departments' => $stats,
            'monthly' => $monthly,
        ]);
    }

    public function schedule(Request $request)
    {
        $levels = CmsLevel::with('department')->orderBy('department_id')->orderBy('year')->get();
        $levelId = (int) $request->input('level_id', $levels->first()?->id ?? 0);

        $schedules = $levelId
            ? CmsSchedule::with(['subject', 'teacher'])
                ->where('level_id', $levelId)
                ->orderBy('day')
                ->orderBy('start_time')
                ->get()
            : collect();

        if ($request->input('format') === 'pdf') {
            $level = $levels->firstWhere('id', $levelId);

            return view('cms.exports.schedule', [
                'schedules' => $schedules,
                'level' => $level,
                'title' => $request->input('title', 'Weekly Class Schedule'),
                'exportedAt' => now(),
                'instituteNameAr' => SiteSetting::get('site_name_ar', 'كلية المعايير الحديثة للعلوم والتقنية'),
                'instituteNameEn' => SiteSetting::get('site_name', 'Almaayir Alhaditha College for Science and Technology'),
            ]);
        }

        return Inertia::render('cms/reports/schedule', [
            'levels' => $levels,
            'schedules' => $schedules,
            'filters' => ['level_id' => $levelId ?: null],
        ]);
    }
}
