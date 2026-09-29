<?php

namespace App\Http\Controllers;

use App\Models\CmsEnrollment;
use App\Models\CmsStudent;
use App\Services\CmsAcademicSettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyCoursesController extends Controller
{
    public function __construct(private CmsAcademicSettingsService $academicSettings) {}

    /**
     * All of the student's course enrollments, newest term first.
     */
    public function __invoke(Request $request): Response
    {
        $student = CmsStudent::with('level.department')
            ->where('user_id', $request->user()->id)
            ->first();

        $enrollments = $student === null
            ? []
            : CmsEnrollment::query()
                ->with('subject:id,code,name,credits,has_lab')
                ->where('student_id', $student->id)
                ->orderByDesc('academic_year')
                ->orderBy('semester')
                ->orderBy('id')
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
                        'has_lab' => (bool) $enrollment->subject->has_lab,
                    ],
                ])
                ->all();

        return Inertia::render('dashboard/student/my-courses', [
            'student' => $this->studentPayload($student),
            'enrollments' => $enrollments,
            'term' => $this->academicSettings->currentTerm(),
            'registration_window' => $student === null
                ? ['open' => false, 'student_active' => false]
                : $this->academicSettings->registrationWindowFor($student),
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
