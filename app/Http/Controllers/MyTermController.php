<?php

namespace App\Http\Controllers;

use App\Models\CmsEnrollment;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Services\CmsAcademicSettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * One "My Term" view: this term's schedule, enrolled subjects with status,
 * grades, attendance, and pending approval requests on a single page.
 */
class MyTermController extends Controller
{
    public function __invoke(
        Request $request,
        CmsAcademicSettingsService $academicSettings,
    ): Response {
        $student = CmsStudent::with('level.department')
            ->where('user_id', $request->user()->id)
            ->first();

        $term = $academicSettings->currentTerm();

        $enrollments = collect();
        $sessions = [];

        if ($student !== null && $term['academic_year'] !== null && $term['semester'] !== null) {
            $enrollments = CmsEnrollment::query()
                ->with([
                    'subject:id,code,name,credits,has_lab',
                    'grade:id,enrollment_id,midterm,final,assignments,projects,participation,total,grade_letter',
                    'attendance:id,enrollment_id,status',
                ])
                ->where('student_id', $student->id)
                ->where('academic_year', $term['academic_year'])
                ->where('semester', $term['semester'])
                ->orderBy('id')
                ->get()
                ->map(fn (CmsEnrollment $enrollment): array => $this->enrollmentPayload($enrollment))
                ->values();

            if ($student->level_id !== null) {
                $sessions = CmsSchedule::query()
                    ->with(['subject:id,code,name', 'teacher:id,name'])
                    ->where('level_id', $student->level_id)
                    ->where('academic_year', $term['academic_year'])
                    ->where('semester', $term['semester'])
                    ->orderByRaw("CASE day WHEN 'saturday' THEN 1 WHEN 'sunday' THEN 2 WHEN 'monday' THEN 3 WHEN 'tuesday' THEN 4 WHEN 'wednesday' THEN 5 WHEN 'thursday' THEN 6 ELSE 7 END")
                    ->orderBy('start_time')
                    ->get()
                    ->map(fn (CmsSchedule $schedule): array => [
                        'id' => $schedule->id,
                        'day' => $schedule->day,
                        'start_time' => $schedule->start_time,
                        'end_time' => $schedule->end_time,
                        'room' => $schedule->room,
                        'type' => $schedule->type,
                        'subject' => $schedule->subject === null ? null : [
                            'id' => $schedule->subject->id,
                            'code' => $schedule->subject->code,
                            'name' => $schedule->subject->name,
                        ],
                        'teacher' => $schedule->teacher === null ? null : [
                            'id' => $schedule->teacher->id,
                            'name' => $schedule->teacher->name,
                        ],
                    ])
                    ->all();
            }
        }

        return Inertia::render('dashboard/student/my-term', [
            'student' => $this->studentPayload($student),
            'term' => $term,
            'registration_window' => $student === null
                ? ['open' => false, 'student_active' => false]
                : $academicSettings->registrationWindowFor($student),
            'enrollments' => $enrollments,
            'sessions' => $sessions,
        ]);
    }

    /**
     * One enrolled subject with its grade and attendance summary for the term.
     *
     * @return array<string, mixed>
     */
    private function enrollmentPayload(CmsEnrollment $enrollment): array
    {
        $attendanceRecords = $enrollment->attendance;
        $totalSessions = $attendanceRecords->count();

        return [
            'id' => $enrollment->id,
            'status' => $enrollment->status,
            'source' => $enrollment->source,
            'withdrawn_reason' => $enrollment->withdrawn_reason,
            'subject' => $enrollment->subject === null ? null : [
                'id' => $enrollment->subject->id,
                'code' => $enrollment->subject->code,
                'name' => $enrollment->subject->name,
                'credits' => (int) $enrollment->subject->credits,
                'has_lab' => (bool) $enrollment->subject->has_lab,
            ],
            'grade' => $enrollment->grade === null ? null : [
                'total' => $enrollment->grade->total,
                'grade_letter' => $enrollment->grade->grade_letter,
            ],
            'attendance' => [
                'total' => $totalSessions,
                'absent' => $attendanceRecords->where('status', 'absent')->count(),
                'rate' => $totalSessions === 0
                    ? null
                    : round($attendanceRecords->whereIn('status', ['present', 'late'])->count() / $totalSessions * 100, 1),
            ],
        ];
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
