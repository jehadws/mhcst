<?php

namespace App\Http\Controllers;

use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyScheduleController extends Controller
{
    /**
     * The student's weekly schedule for their level, ordered by the schedule
     * day enum (Saturday first), then by start time. Sessions without an
     * assigned teacher still appear — teacher is null.
     */
    public function __invoke(Request $request): Response
    {
        $student = CmsStudent::query()
            ->where('user_id', $request->user()->id)
            ->first();

        $sessions = $student === null || $student->level_id === null
            ? []
            : CmsSchedule::query()
                ->with(['subject:id,code,name', 'teacher:id,name'])
                ->where('level_id', $student->level_id)
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

        return Inertia::render('dashboard/student/my-schedule', [
            'student' => $this->studentPayload($student),
            'sessions' => $sessions,
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
