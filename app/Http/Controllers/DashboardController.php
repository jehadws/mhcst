<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lead;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'students_count' => Student::count(),
            'courses_count' => Course::count(),
            'active_courses' => Course::where('status', 'published')->count(),
            'enrollments_this_month' => Enrollment::whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])->count(),
            'pending_enrollments' => Enrollment::where('status', 'pending')->count(),
            'total_revenue' => Enrollment::where('payment_status', 'paid')->sum('amount_paid'),
            'new_leads' => Lead::where('status', 'new')->count(),
        ];

        $recentEnrollments = Enrollment::with('course')
            ->latest()
            ->take(10)
            ->get();

        $enrollmentsByMonth = Enrollment::select(
            DB::raw("strftime('%Y', created_at) as year"),
            DB::raw("strftime('%m', created_at) as month"),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('year', 'month')
            ->orderBy('year')->orderBy('month')
            ->get();

        $revenueByMonth = Enrollment::select(
            DB::raw("strftime('%Y', created_at) as year"),
            DB::raw("strftime('%m', created_at) as month"),
            DB::raw('SUM(amount_paid) as total')
        )
            ->where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('year', 'month')
            ->orderBy('year')->orderBy('month')
            ->get();

        return Inertia::render('dashboard/index', [
            'stats' => $stats,
            'recentEnrollments' => $recentEnrollments,
            'enrollmentsByMonth' => $enrollmentsByMonth,
            'revenueByMonth' => $revenueByMonth,
        ]);
    }
}
