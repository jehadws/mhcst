<?php

namespace App\Http\Controllers;

use App\Models\CmsStudent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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
        $validated = $request->validate([
            'query' => ['required', 'string', 'min:4', 'max:255'],
        ]);

        $query = trim($validated['query']);

        $academicStudents = $this->academicStudentsByStudentNo($query);

        if ($academicStudents->isEmpty()) {
            $academicStudents = CmsStudent::query()
                ->with(['level.department', 'enrollments' => fn ($q) => $q->where('status', 'active')->with('subject')])
                ->where(function ($builder) use ($query) {
                    $builder->where('email', $query)
                        ->orWhere('phone', $query)
                        ->orWhere('name', $query);
                })
                ->orderBy('name')
                ->limit(10)
                ->get();
        }

        return response()->json([
            'query' => $query,
            'academic_students' => $academicStudents
                ->map(fn (CmsStudent $student) => $this->publicAcademicStudent($student))
                ->all(),
        ]);
    }

    /**
     * Exact student_no matches take priority: when one hits, only those
     * students are returned for the academic world.
     *
     * @return Collection<int, CmsStudent>
     */
    private function academicStudentsByStudentNo(string $query): Collection
    {
        return CmsStudent::query()
            ->with(['level.department', 'enrollments' => fn ($q) => $q->where('status', 'active')->with('subject')])
            ->where('student_no', $query)
            ->orderBy('name')
            ->limit(10)
            ->get();
    }

    /**
     * Shape the public academic student payload. Identity-level info only:
     * never expose grades, GPA or attendance data.
     *
     * @return array<string, mixed>
     */
    private function publicAcademicStudent(CmsStudent $student): array
    {
        return [
            'id' => $student->id,
            'student_no' => $student->student_no,
            'name' => $student->name,
            'status' => $student->status,
            'department' => $student->level?->department?->name,
            'level' => $student->level
                ? "Year {$student->level->year} · Section {$student->level->section}"
                : null,
            'subjects' => $student->enrollments
                ->map(fn ($enrollment) => $enrollment->subject)
                ->filter()
                ->unique('id')
                ->map(fn ($subject): array => [
                    'name' => $subject->name,
                    'code' => $subject->code,
                    'credits' => $subject->credits,
                ])
                ->values()
                ->all(),
        ];
    }
}
