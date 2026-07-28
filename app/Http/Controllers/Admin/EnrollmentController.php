<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Inertia\Inertia;
use Inertia\Response;

class EnrollmentController extends Controller
{
    public function index(): Response
    {
        $enrollments = Enrollment::latest()->get();

        return Inertia::render('admin/enrollments/index', [
            'enrollments' => $enrollments,
        ]);
    }
}
