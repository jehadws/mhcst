<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentPortalController extends Controller
{
    public function index(Request $request): Response
    {
        $query = $request->query('query');
        $enrollments = collect();

        if ($query) {
            $searchTerm = trim($query);
            $enrollments = Enrollment::with(['course', 'certificate'])
                ->where(function ($q) use ($searchTerm) {
                    $q->where('email', $searchTerm)
                        ->orWhere('phone', $searchTerm)
                        ->orWhere('full_name', 'like', '%'.$searchTerm.'%');
                })
                ->latest()
                ->get();
        }

        return Inertia::render('site/student/portal', [
            'query' => $query ?? '',
            'enrollments' => $enrollments,
            'searched' => (bool) $query,
        ]);
    }
}
