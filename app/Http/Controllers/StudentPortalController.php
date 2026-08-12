<?php

namespace App\Http\Controllers;

use App\Models\CmsStudent;
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
        $query = trim((string) $request->query('query', ''));
        $trainingEnrollments = collect();
        $academicStudents = collect();

        if ($query !== '') {
            $trainingEnrollments = Enrollment::with(['course', 'certificate', 'student'])
                ->where(function ($q) use ($query) {
                    $q->where('email', 'like', '%'.$query.'%')
                        ->orWhere('phone', 'like', '%'.$query.'%')
                        ->orWhere('full_name', 'like', '%'.$query.'%');
                })
                ->latest()
                ->get();

            $academicStudents = CmsStudent::query()
                ->with(['level.department', 'enrollments' => fn ($q) => $q->where('status', 'active')->with('subject')])
                ->where(function ($q) use ($query) {
                    $q->where('email', 'like', '%'.$query.'%')
                        ->orWhere('phone', 'like', '%'.$query.'%')
                        ->orWhere('name', 'like', '%'.$query.'%')
                        ->orWhere('student_no', 'like', '%'.$query.'%');
                })
                ->orderBy('name')
                ->limit(10)
                ->get()
                ->map(fn (CmsStudent $student) => [
                    'id' => $student->id,
                    'student_no' => $student->student_no,
                    'name' => $student->name,
                    'email' => $student->email,
                    'status' => $student->status,
                    'department' => $student->level?->department?->name,
                    'level' => $student->level
                        ? "Year {$student->level->year} · Section {$student->level->section}"
                        : null,
                    'subjects' => $student->enrollments
                        ->map(fn ($enrollment) => $enrollment->subject?->name)
                        ->filter()
                        ->values()
                        ->all(),
                ]);
        }

        return response()->json([
            'query' => $query,
            'training_enrollments' => $trainingEnrollments,
            'academic_students' => $academicStudents,
        ]);
    }
}
