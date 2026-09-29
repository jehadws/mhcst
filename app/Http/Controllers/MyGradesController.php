<?php

namespace App\Http\Controllers;

use App\Models\CmsEnrollment;
use App\Models\CmsStudent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyGradesController extends Controller
{
    /**
     * The student's active and completed enrollments with their grade parts,
     * plus the overall GPA (same averaging rule as the dashboard overview).
     */
    public function __invoke(Request $request): Response
    {
        $student = CmsStudent::query()
            ->where('user_id', $request->user()->id)
            ->first();

        $grades = $student === null
            ? []
            : CmsEnrollment::query()
                ->with(['grade', 'subject:id,code,name,credits'])
                ->where('student_id', $student->id)
                ->whereIn('status', ['active', 'completed'])
                ->orderByDesc('academic_year')
                ->orderBy('semester')
                ->get()
                ->map(fn (CmsEnrollment $enrollment): array => [
                    'id' => $enrollment->id,
                    'status' => $enrollment->status,
                    'academic_year' => $enrollment->academic_year,
                    'semester' => $enrollment->semester,
                    'subject' => $enrollment->subject === null ? null : [
                        'id' => $enrollment->subject->id,
                        'code' => $enrollment->subject->code,
                        'name' => $enrollment->subject->name,
                        'credits' => (int) $enrollment->subject->credits,
                    ],
                    'grade' => $enrollment->grade === null ? null : [
                        'midterm' => $enrollment->grade->midterm,
                        'final' => $enrollment->grade->final,
                        'assignments' => $enrollment->grade->assignments,
                        'projects' => $enrollment->grade->projects,
                        'participation' => $enrollment->grade->participation,
                        'total' => $enrollment->grade->total,
                        'grade_letter' => $enrollment->grade->grade_letter,
                        'entered_at' => $enrollment->grade->entered_at?->toDateString(),
                    ],
                ])
                ->all();

        $gradedTotals = collect($grades)
            ->filter(fn (array $row): bool => $row['grade'] !== null && $row['grade']['total'] !== null)
            ->pluck('grade.total');

        return Inertia::render('dashboard/student/my-grades', [
            'student' => $this->studentPayload($student),
            'grades' => $grades,
            'gpa' => $gradedTotals->isEmpty() ? null : round($gradedTotals->avg(), 2),
        ]);
    }

    /**
     * Shared student profile shape for the "my studies" pages.
     */
    private function studentPayload(?CmsStudent $student): ?array
    {
        if ($student === null) {
            return null;
        }

        return [
            'id' => $student->id,
            'name' => $student->name,
            'student_no' => $student->student_no,
            'status' => $student->status,
            'department' => $student->level?->department?->name,
            'level' => $student->level === null ? null : [
                'year' => (int) $student->level->year,
                'section' => $student->level->section,
            ],
        ];
    }
}
