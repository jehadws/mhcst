<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lead;
use App\Models\Student;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $now = CarbonImmutable::now();

        $enrollmentsThisMonth = Enrollment::whereBetween('created_at', [$now->startOfMonth(), $now->endOfMonth()])->count();
        $enrollmentsLastMonth = Enrollment::whereBetween('created_at', [$now->subMonth()->startOfMonth(), $now->subMonth()->endOfMonth()])->count();

        $studentsCount = Student::count();
        $studentsLastMonth = Student::where('created_at', '<', $now->startOfMonth())->count();

        $revenueThisMonth = Enrollment::where('payment_status', 'paid')->whereBetween('created_at', [$now->startOfMonth(), $now->endOfMonth()])->sum('amount_paid');
        $revenueLastMonth = Enrollment::where('payment_status', 'paid')->whereBetween('created_at', [$now->subMonth()->startOfMonth(), $now->subMonth()->endOfMonth()])->sum('amount_paid');

        $newLeads = Lead::where('status', 'new')->count();

        $stats = [
            'students_count' => $studentsCount,
            'students_delta' => $this->percentChange($studentsLastMonth, $studentsCount),
            'courses_count' => Course::where('status', 'published')->count(),
            'total_courses' => Course::count(),
            'enrollments_this_month' => $enrollmentsThisMonth,
            'enrollments_delta' => $this->percentChange($enrollmentsLastMonth, $enrollmentsThisMonth),
            'pending_enrollments' => Enrollment::where('status', 'pending')->count(),
            'total_revenue' => Enrollment::where('payment_status', 'paid')->sum('amount_paid'),
            'revenue_this_month' => $revenueThisMonth,
            'revenue_delta' => $this->percentChange($revenueLastMonth, $revenueThisMonth),
            'new_leads' => $newLeads,
        ];

        $recentEnrollments = Enrollment::with('course')
            ->latest()
            ->take(8)
            ->get(['id', 'full_name', 'email', 'course_id', 'status', 'amount_due', 'created_at']);

        $enrollmentsByMonth = $this->seriesByMonth(
            $this->monthlyTotals(Enrollment::query(), 'count', $now),
            $now
        );

        $revenueByMonth = $this->seriesByMonth(
            $this->monthlyTotals(
                Enrollment::where('payment_status', 'paid'),
                'sum',
                $now
            ),
            $now
        );

        $enrollmentsByStatus = Enrollment::select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => ['status' => $row->status, 'count' => $row->count]);

        $locale = app()->getLocale();
        $titleKey = $locale === 'ar' ? 'title_ar' : 'title_en';

        $topCourses = Enrollment::query()
            ->select('course_id', DB::raw('COUNT(*) as total'))
            ->whereNotNull('course_id')
            ->with('course:id,title_ar,title_en')
            ->groupBy('course_id')
            ->orderByDesc('total')
            ->take(5)
            ->get()
            ->map(fn ($row) => [
                'title' => $row->course ? ($row->course->{$titleKey} ?? $row->course->title_ar ?? $row->course->title_en ?? '—') : '—',
                'count' => $row->total,
            ]);

        $leadsByMonth = $this->seriesByMonth(
            $this->monthlyTotals(Lead::query(), 'count', $now),
            $now
        );

        return Inertia::render('dashboard/index', [
            'stats' => $stats,
            'recentEnrollments' => $recentEnrollments,
            'enrollmentsByMonth' => $enrollmentsByMonth,
            'revenueByMonth' => $revenueByMonth,
            'leadsByMonth' => $leadsByMonth,
            'enrollmentsByStatus' => $enrollmentsByStatus,
            'topCourses' => $topCourses,
        ]);
    }

    /**
     * Aggregate a model's rows into month buckets over the last 12 months.
     *
     * @return array<int, array{year: int, month: int, value: int|float}>
     */
    private function monthlyTotals($query, string $operation, CarbonImmutable $now): array
    {
        $select = [
            DB::raw("strftime('%Y', created_at) as year"),
            DB::raw("strftime('%m', created_at) as month"),
        ];

        $select[] = $operation === 'sum'
            ? DB::raw('SUM(amount_paid) as value')
            : DB::raw('COUNT(*) as value');

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

    /**
     * Fill a full 12-month series so charts render contiguous bars.
     *
     * @param  array<int, array{year: int, month: int, value: int|float}>  $totals
     * @return array<int, array{month: string, value: float}>
     */
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
