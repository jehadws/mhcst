<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Instructor;
use Inertia\Inertia;
use Inertia\Response;

class InstructorController extends Controller
{
    public function index(): Response
    {
        $instructors = Instructor::withCount('courses')->latest()->get();

        return Inertia::render('admin/instructors/index', [
            'instructors' => $instructors,
        ]);
    }
}
