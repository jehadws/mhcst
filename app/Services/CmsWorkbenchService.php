<?php

namespace App\Services;

use App\Models\CmsApplication;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * The admin workbench (phase 4): everything that needs a decision on one
 * screen — new applications, pending enrollment picks, the over-capacity
 * tripwire, active students with no enrollment this term, and the term's
 * upcoming deadlines.
 */
class CmsWorkbenchService
{
    public function __construct(
        private CmsAcademicSettingsService $academicSettings,
        private GradeLockService $gradeLock,
    ) {}

    /**
     * @return array{
     *     applications_submitted: int,
     *     applications_under_review: int,
     *     pending_enrollments: int,
     *     over_capacity_count: int,
     *     over_capacity: list<array{level_year: int, level_section: string, subject: string, term: string, enrolled: int, capacity: int}>,
     *     students_without_enrollment_count: int,
     *     students_without_enrollment: list<array{id: int, name: string, student_no: string, level: ?string}>,
     *     term: array{academic_year: ?string, semester: ?string},
     *     deadlines: list<array{key: string, date: ?string, days_remaining: ?int, passed: bool}>
     * }
     */
    public function summary(): array
    {
        $term = $this->academicSettings->currentTerm();

        return [
            'applications_submitted' => $this->applicationCount(CmsApplication::STATUS_SUBMITTED),
            'applications_under_review' => $this->applicationCount(CmsApplication::STATUS_UNDER_REVIEW),
            'pending_enrollments' => $this->pendingEnrollments($term),
            'over_capacity_count' => $this->overCapacityRows()['count'],
            'over_capacity' => $this->overCapacityRows()['rows'],
            'students_without_enrollment_count' => $this->studentsWithoutEnrollment($term)['count'],
            'students_without_enrollment' => $this->studentsWithoutEnrollment($term)['rows'],
            'term' => $term,
            'deadlines' => $this->deadlines(),
        ];
    }

    private function applicationCount(string $status): int
    {
        return CmsApplication::query()
            ->notDraft()
            ->where('status', $status)
            ->count();
    }

    /**
     * Pending enrollment picks keyed against the current term's string pair
     * (the same read convention as everywhere else); without a term identity
     * every pending row counts.
     *
     * @param  array{academic_year: ?string, semester: ?string}  $term
     */
    private function pendingEnrollments(array $term): int
    {
        return CmsEnrollment::query()
            ->where('status', 'pending')
            ->when($term['academic_year'] !== null, fn ($q) => $q->where('academic_year', $term['academic_year']))
            ->when($term['semester'] !== null, fn ($q) => $q->where('semester', $term['semester']))
            ->count();
    }

    /**
     * Tripwire: any (level, subject, term) group whose active enrollments
     * exceed the level's seat capacity. Phase 1's locked approvals mean this
     * must always be empty — a non-empty list means capacity was bypassed
     * (direct DB edits, imports, admin creates) and needs a human.
     *
     * @return array{count: int, rows: list<array{level_year: int, level_section: string, subject: string, term: string, enrolled: int, capacity: int}>}
     */
    private function overCapacityRows(): array
    {
        $rows = CmsEnrollment::query()
            ->where('cms_enrollments.status', 'active')
            ->join('cms_students', 'cms_students.id', '=', 'cms_enrollments.student_id')
            ->join('cms_levels', 'cms_levels.id', '=', 'cms_students.level_id')
            ->where('cms_levels.capacity', '>', 0)
            ->groupBy(
                'cms_levels.id',
                'cms_levels.year',
                'cms_levels.section',
                'cms_levels.capacity',
                'cms_enrollments.subject_id',
                'cms_enrollments.academic_year',
                'cms_enrollments.semester',
            )
            ->selectRaw('cms_levels.id as level_id, cms_levels.year, cms_levels.section, cms_levels.capacity, cms_enrollments.subject_id, cms_enrollments.academic_year, cms_enrollments.semester, COUNT(*) as enrolled')
            ->havingRaw('COUNT(*) > cms_levels.capacity')
            ->get();

        $subjects = CmsSubject::query()
            ->whereIn('id', $rows->pluck('subject_id')->unique()->values())
            ->pluck('code', 'id');

        $presented = $rows->take(10)->map(fn ($row) => [
            'level_year' => (int) $row->year,
            'level_section' => (string) $row->section,
            'subject' => (string) $subjects->get($row->subject_id, (string) $row->subject_id),
            'term' => $row->academic_year.' / '.$row->semester,
            'enrolled' => (int) $row->enrolled,
            'capacity' => (int) $row->capacity,
        ])->values()->all();

        return ['count' => $rows->count(), 'rows' => $presented];
    }

    /**
     * Active students holding no pending/active enrollment in the current
     * term. Without a configured term there is nothing to compare against,
     * so the report stays empty instead of alarming on every student.
     *
     * @param  array{academic_year: ?string, semester: ?string}  $term
     * @return array{count: int, rows: list<array{id: int, name: string, student_no: string, level: ?string}>}
     */
    private function studentsWithoutEnrollment(array $term): array
    {
        if ($term['academic_year'] === null || $term['semester'] === null) {
            return ['count' => 0, 'rows' => []];
        }

        $levels = CmsLevel::query()
            ->with('department')
            ->get()
            ->mapWithKeys(fn (CmsLevel $level) => [$level->id => $level->department?->name.' — '.$level->year.'/'.$level->section]);

        $students = CmsStudent::query()
            ->where('status', 'active')
            ->whereDoesntHave('enrollments', fn ($q) => $q
                ->whereIn('status', ['pending', 'active'])
                ->where('academic_year', $term['academic_year'])
                ->where('semester', $term['semester']))
            ->orderBy('student_no')
            ->get(['id', 'name', 'student_no', 'level_id']);

        return [
            'count' => $students->count(),
            'rows' => $students->take(8)->map(fn (CmsStudent $student) => [
                'id' => $student->id,
                'name' => $student->name,
                'student_no' => $student->student_no,
                'level' => $student->level_id !== null ? $levels->get($student->level_id) : null,
            ])->all(),
        ];
    }

    /**
     * The term's upcoming deadlines plus the grade-entry deadline, each with
     * the days remaining (null when not set). `passed` marks a date already
     * behind us so the UI can grey it out.
     *
     * @return list<array{key: string, date: ?string, days_remaining: ?int, passed: bool}>
     */
    private function deadlines(): array
    {
        $activeTerm = $this->academicSettings->activeTerm();
        $gradeEntryDeadline = $this->gradeLock->settings()['grade_entry_deadline'];

        $raw = [
            'registration_ends_at' => $activeTerm?->registration_ends_at,
            'add_drop_deadline' => $activeTerm?->add_drop_deadline,
            'grade_entry_deadline' => $gradeEntryDeadline !== null && $gradeEntryDeadline !== ''
                ? Carbon::parse($gradeEntryDeadline)->startOfDay()
                : null,
        ];

        $deadlines = [];

        foreach ($raw as $key => $date) {
            if ($date === null) {
                $deadlines[] = ['key' => $key, 'date' => null, 'days_remaining' => null, 'passed' => false];

                continue;
            }

            $date = $date->copy()->startOfDay();
            $today = today()->startOfDay();

            $deadlines[] = [
                'key' => $key,
                'date' => $date->toDateString(),
                'days_remaining' => $date->gte($today) ? (int) $date->diffInDays($today) : null,
                'passed' => $date->lt($today),
            ];
        }

        return $deadlines;
    }
}
