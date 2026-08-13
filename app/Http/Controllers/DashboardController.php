<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\BlogPost;
use App\Models\CmsAttendance;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\Faq;
use App\Models\Testimonial;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $role = $this->resolveDashboardRole($user);

        return match ($role) {
            'teacher' => $this->teacherDashboard($user),
            'student' => $this->studentDashboard($user),
            'content' => $this->contentDashboard(),
            default => $this->adminDashboard(),
        };
    }

    private function resolveDashboardRole(?User $user): string
    {
        if (! $user) {
            return 'admin';
        }

        if ($user->hasAnyRole([UserRole::Admin->value, UserRole::Manager->value])) {
            return 'admin';
        }

        if ($user->hasRole(UserRole::Teacher->value)) {
            return 'teacher';
        }

        if ($user->hasRole(UserRole::Student->value)) {
            return 'student';
        }

        if ($user->hasRole(UserRole::ContentEditor->value)) {
            return 'content';
        }

        return 'content';
    }

    private function adminDashboard(): Response
    {
        $now = CarbonImmutable::now();

        $studentsCount = CmsStudent::count();
        $studentsLastMonth = CmsStudent::where('created_at', '<', $now->startOfMonth())->count();

        return Inertia::render('dashboard/index', [
            'dashboardRole' => 'admin',
            'stats' => [
                'students_count' => $studentsCount,
                'students_delta' => $this->percentChange($studentsLastMonth, $studentsCount),
                'teachers_count' => CmsTeacher::count(),
                'departments_count' => CmsDepartment::count(),
                'subjects_count' => CmsSubject::count(),
                'enrollments_count' => CmsEnrollment::count(),
                'active_students' => CmsStudent::where('status', 'active')->count(),
                'attendance_today_count' => CmsAttendance::whereDate('date', today())->count(),
            ],
            'studentsByDepartment' => CmsDepartment::withCount('students')
                ->get()
                ->map(fn ($d) => ['name' => $d->name, 'count' => $d->students_count]),
            'recentStudents' => CmsStudent::with('level.department')->latest()->take(5)->get(),
            'recentGrades' => CmsGrade::with(['enrollment.student', 'enrollment.subject'])->latest()->take(6)->get(),
            'todaySchedules' => CmsSchedule::with(['subject', 'teacher', 'level.department'])
                ->where('day', $this->todayScheduleDay())
                ->orderBy('start_time')
                ->take(5)
                ->get(),
            'attendanceByMonth' => $this->seriesByMonth(
                $this->monthlyTotals(CmsAttendance::query(), $now),
                $now
            ),
        ]);
    }

    private function teacherDashboard(User $user): Response
    {
        $teacher = CmsTeacher::where('user_id', $user->id)->first();

        if (! $teacher) {
            return Inertia::render('dashboard/index', [
                'dashboardRole' => 'teacher',
                'teacherProfile' => null,
                'todaySchedules' => [],
                'teacherClasses' => [],
                'stats' => [
                    'classes_count' => 0,
                    'students_count' => 0,
                    'pending_grades_count' => 0,
                    'today_classes_count' => 0,
                ],
            ]);
        }

        $subjectIds = CmsSchedule::where('teacher_id', $teacher->id)
            ->distinct()
            ->pluck('subject_id');

        $todaySchedules = CmsSchedule::with(['subject', 'level.department'])
            ->where('teacher_id', $teacher->id)
            ->where('day', $this->todayScheduleDay())
            ->orderBy('start_time')
            ->get();

        $classes = CmsSubject::whereIn('id', $subjectIds)
            ->get()
            ->map(function (CmsSubject $subject) {
                $enrollmentIds = CmsEnrollment::where('subject_id', $subject->id)
                    ->where('status', 'active')
                    ->pluck('id');

                $pendingGrades = CmsEnrollment::where('subject_id', $subject->id)
                    ->where('status', 'active')
                    ->whereDoesntHave('grade', fn ($q) => $q->whereNotNull('total'))
                    ->count();

                return [
                    'id' => $subject->id,
                    'code' => $subject->code,
                    'name' => $subject->name,
                    'student_count' => $enrollmentIds->count(),
                    'pending_grades' => $pendingGrades,
                ];
            });

        $pendingGradesCount = $classes->sum('pending_grades');

        return Inertia::render('dashboard/index', [
            'dashboardRole' => 'teacher',
            'teacherProfile' => [
                'name' => $teacher->name,
                'specialization' => $teacher->specialization,
            ],
            'todaySchedules' => $todaySchedules,
            'teacherClasses' => $classes,
            'stats' => [
                'classes_count' => $classes->count(),
                'students_count' => $classes->sum('student_count'),
                'pending_grades_count' => $pendingGradesCount,
                'today_classes_count' => $todaySchedules->count(),
            ],
        ]);
    }

    private function studentDashboard(User $user): Response
    {
        $student = CmsStudent::with('level.department')->where('user_id', $user->id)->first();

        if (! $student) {
            return Inertia::render('dashboard/index', [
                'dashboardRole' => 'student',
                'studentProfile' => null,
                'transcriptUrl' => null,
            ]);
        }

        $enrollments = CmsEnrollment::with(['subject', 'grade'])
            ->where('student_id', $student->id)
            ->where('status', 'active')
            ->get();

        $gradesWithTotal = $enrollments->filter(fn ($e) => $e->grade?->total !== null);
        $gpa = $gradesWithTotal->isNotEmpty()
            ? round($gradesWithTotal->avg(fn ($e) => (float) $e->grade->total), 2)
            : null;

        $attendanceRecords = CmsAttendance::whereIn(
            'enrollment_id',
            $enrollments->pluck('id')
        )->get();

        $attendanceRate = $attendanceRecords->isNotEmpty()
            ? round(
                ($attendanceRecords->whereIn('status', ['present', 'late'])->count() / $attendanceRecords->count()) * 100,
                1
            )
            : null;

        $todaySchedules = CmsSchedule::with(['subject', 'teacher'])
            ->where('level_id', $student->level_id)
            ->where('day', $this->todayScheduleDay())
            ->orderBy('start_time')
            ->get();

        return Inertia::render('dashboard/index', [
            'dashboardRole' => 'student',
            'studentProfile' => [
                'id' => $student->id,
                'name' => $student->name,
                'student_no' => $student->student_no,
                'department' => $student->level?->department?->name,
            ],
            'transcriptUrl' => route('dashboard.my-transcript'),
            'todaySchedules' => $todaySchedules,
            'recentGrades' => $enrollments
                ->filter(fn ($e) => $e->grade !== null)
                ->take(6)
                ->map(fn ($e) => [
                    'subject' => $e->subject?->name,
                    'code' => $e->subject?->code,
                    'total' => $e->grade?->total,
                    'grade_letter' => $e->grade?->grade_letter,
                ])
                ->values(),
            'stats' => [
                'enrolled_subjects' => $enrollments->count(),
                'gpa' => $gpa,
                'attendance_rate' => $attendanceRate,
                'today_classes_count' => $todaySchedules->count(),
            ],
        ]);
    }

    private function contentDashboard(): Response
    {
        return Inertia::render('dashboard/index', [
            'dashboardRole' => 'content',
            'stats' => [
                'blog_posts_count' => BlogPost::count(),
                'published_posts_count' => BlogPost::count(),
                'faqs_count' => Faq::count(),
                'testimonials_count' => Testimonial::count(),
            ],
        ]);
    }

    private function monthlyTotals($query, CarbonImmutable $now): array
    {
        $select = [
            DB::raw("strftime('%Y', created_at) as year"),
            DB::raw("strftime('%m', created_at) as month"),
            DB::raw('COUNT(*) as value'),
        ];

        return $query->select($select)
            ->where('created_at', '>=', $now->subMonths(11)->startOfMonth())
            ->groupBy('year', 'month')
            ->get()
            ->map(fn ($row) => [
                'year' => (int) $row->year,
                'month' => (int) $row->month,
                'value' => (float) $row->value,
            ])
            ->toArray();
    }

    private function seriesByMonth(array $totals, CarbonImmutable $now): array
    {
        $series = [];

        for ($i = 11; $i >= 0; $i--) {
            $date = $now->subMonths($i);
            $series[] = ['month' => $date->translatedFormat('M'), 'value' => 0];
        }

        foreach ($totals as $total) {
            $label = CarbonImmutable::create($total['year'], $total['month'], 1)->translatedFormat('M');

            foreach ($series as &$point) {
                if ($point['month'] === $label) {
                    $point['value'] = $total['value'];
                    break;
                }
            }
        }

        return $series;
    }

    private function todayScheduleDay(): string
    {
        return match (CarbonImmutable::now()->dayOfWeek) {
            0 => 'sunday',
            1 => 'monday',
            2 => 'tuesday',
            3 => 'wednesday',
            4 => 'thursday',
            5 => 'friday',
            6 => 'saturday',
            default => 'saturday',
        };
    }

    private function percentChange(float|int $previous, float|int $current): ?float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
