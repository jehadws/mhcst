<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentPortalController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('site/student/portal');
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->query('query');
        $enrollments = collect();

        if ($query) {
            $searchTerm = trim($query);
            $enrollments = Enrollment::with(['course', 'certificate', 'student'])
                ->where(function ($q) use ($searchTerm) {
                    $q->where('email', 'like', '%'.$searchTerm.'%')
                        ->orWhere('phone', 'like', '%'.$searchTerm.'%')
                        ->orWhere('full_name', 'like', '%'.$searchTerm.'%');
                })
                ->latest()
                ->get();
        }

        return response()->json([
            'query' => $query ?? '',
            'enrollments' => $enrollments,
        ]);
    }
}
