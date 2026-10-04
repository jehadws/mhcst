<?php

namespace App\Http\Controllers;

use App\Models\CmsStudent;
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
        $validated = $request->validate([
            'query' => ['required', 'string', 'min:4', 'max:255'],
            'contact' => ['required', 'string', 'min:4', 'max:255'],
        ]);

        $studentNo = trim($validated['query']);
        $contact = trim($validated['contact']);

        // Dual-key lookup: a record is only returned when the student number
        // AND the private email/phone recorded on it both match. Student
        // numbers are sequential, so any single-key lookup would let a
        // guest enumerate the whole student body by iterating numbers.
        $academicStudents = CmsStudent::query()
            ->with(['level.department', 'enrollments' => fn ($q) => $q->where('status', 'active')->with('subject')])
            ->where('student_no', $studentNo)
            ->where(function ($builder) use ($contact) {
                $builder->where('email', $contact)
                    ->orWhere('phone', $contact);
            })
            ->orderBy('name')
            ->limit(10)
            ->get();

        return response()->json([
            'query' => $studentNo,
            'academic_students' => $academicStudents
                ->map(fn (CmsStudent $student) => $this->publicAcademicStudent($student))
                ->all(),
        ]);
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
