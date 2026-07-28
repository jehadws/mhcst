<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        $courses = Course::with('instructor')->latest()->get();

        return Inertia::render('admin/courses/index', [
            'courses' => $courses,
        ]);
    }
}
