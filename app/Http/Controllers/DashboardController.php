<?php

namespace App\Http\Controllers;

use App\Models\CmsAttendance;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $now = CarbonImmutable::now();

        $studentsCount = CmsStudent::count();
        $studentsLastMonth = CmsStudent::where('created_at', '<', $now->startOfMonth())->count();

        $teachersCount = CmsTeacher::count();
        $departmentsCount = CmsDepartment::count();
        $subjectsCount = CmsSubject::count();
        $enrollmentsCount = CmsEnrollment::count();
        $activeStudentsCount = CmsStudent::where('status', 'active')->count();
        $attendanceTodayCount = CmsAttendance::whereDate('date', today())->count();

        $stats = [
            'students_count' => $studentsCount,
            'students_delta' => $this->percentChange($studentsLastMonth, $studentsCount),
            'teachers_count' => $teachersCount,
            'departments_count' => $departmentsCount,
            'subjects_count' => $subjectsCount,
            'enrollments_count' => $enrollmentsCount,
            'active_students' => $activeStudentsCount,
            'attendance_today_count' => $attendanceTodayCount,
        ];

        $studentsByDepartment = CmsDepartment::withCount('students')
            ->get()
            ->map(fn ($d) => [
                'name' => $d->name,
                'count' => $d->students_count,
            ]);

        $recentStudents = CmsStudent::with('level.department')
            ->latest()
            ->take(5)
            ->get();

        $recentGrades = CmsGrade::with(['enrollment.student', 'enrollment.subject'])
            ->latest()
            ->take(6)
            ->get();

        $todaySchedules = CmsSchedule::with(['subject', 'teacher', 'level.department'])
            ->take(5)
            ->get();

        $attendanceByMonth = $this->seriesByMonth(
            $this->monthlyTotals(CmsAttendance::query(), 'count', $now),
            $now
        );

        return Inertia::render('dashboard/index', [
            'stats' => $stats,
            'studentsByDepartment' => $studentsByDepartment,
            'recentStudents' => $recentStudents,
            'recentGrades' => $recentGrades,
            'todaySchedules' => $todaySchedules,
            'attendanceByMonth' => $attendanceByMonth,
        ]);
    }

    private function monthlyTotals($query, string $operation, CarbonImmutable $now): array
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

            $series[] = [
                'month' => $date->translatedFormat('M'),
                'value' => 0,
            ];
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

    private function percentChange(float|int $previous, float|int $current): ?float
    {
        if ($previous == 0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }
}
