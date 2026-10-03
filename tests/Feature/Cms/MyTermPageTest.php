<?php

use App\Enums\UserRole;
use App\Models\CmsAttendance;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\User;
use App\Services\CmsAcademicSettingsService;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

/**
 * Phase 3 — the one "My Term" view: schedule, enrolled subjects with status,
 * grades, attendance, and pending requests for the current term only.
 */
function myTermSetup(): array
{
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $department = CmsDepartment::create(['name' => 'MyTerm Dept', 'description' => 'MyTerm']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 2, 'section' => 'B', 'capacity' => 0]);

    $student = CmsStudent::create([
        'user_id' => $user->id,
        'student_no' => 'MYT-0001',
        'name' => 'MyTerm Student',
        'email' => 'myterm-student@test.com',
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    app(CmsAcademicSettingsService::class)->updateSettings([
        'grades_locked' => false,
        'academic_year' => '2026-2027',
        'current_semester' => 'first',
        'subject_registration_open' => true,
        'consecutive_absence_threshold' => 3,
        'absence_rate_threshold' => 20,
        'add_drop_deadline' => now()->addDays(14)->toDateString(),
    ]);

    return [$user, $student, $department, $level];
}

function myTermSubject(int $departmentId, string $code): CmsSubject
{
    return CmsSubject::create([
        'department_id' => $departmentId,
        'code' => $code,
        'name' => "Subject {$code}",
        'credits' => 3,
        'semester' => 'first',
    ]);
}

function myTermEnrollment(CmsStudent $student, CmsSubject $subject, string $status = 'active', string $termYear = '2026-2027', string $termSemester = 'first'): CmsEnrollment
{
    return CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => $termYear,
        'semester' => $termSemester,
        'enrollment_date' => now(),
        'status' => $status,
        'source' => 'self',
        'withdrawn_reason' => $status === 'withdrawn' ? 'Section overflow' : null,
    ]);
}

test('my term page shows this term only: subjects, statuses, grades, attendance, pending, schedule', function () {
    [$user, $student, $department, $level] = myTermSetup();

    $gradedSubject = myTermSubject($department->id, 'M101');
    $pendingSubject = myTermSubject($department->id, 'M102');
    $withdrawnSubject = myTermSubject($department->id, 'M103');
    $oldTermSubject = myTermSubject($department->id, 'M104');

    $graded = myTermEnrollment($student, $gradedSubject, 'active');
    myTermEnrollment($student, $pendingSubject, 'pending');
    myTermEnrollment($student, $withdrawnSubject, 'withdrawn');
    myTermEnrollment($student, $oldTermSubject, 'active', '2025-2026', 'second');

    CmsGrade::create([
        'enrollment_id' => $graded->id,
        'midterm' => 100,
        'final' => 100,
        'assignments' => 100,
        'projects' => 100,
        'participation' => 100,
        'entered_at' => now(),
    ]);

    CmsAttendance::create(['enrollment_id' => $graded->id, 'date' => now()->subDays(2), 'status' => 'present', 'recorded_by' => $user->id]);
    CmsAttendance::create(['enrollment_id' => $graded->id, 'date' => now()->subDay(), 'status' => 'absent', 'recorded_by' => $user->id]);

    CmsSchedule::create([
        'subject_id' => $gradedSubject->id,
        'level_id' => $level->id,
        'day' => 'monday',
        'start_time' => '09:00',
        'end_time' => '10:30',
        'room' => 'A-101',
        'type' => 'lecture',
        'academic_year' => '2026-2027',
        'semester' => 'first',
    ]);

    // A schedule from another term must not leak into this term's page.
    CmsSchedule::create([
        'subject_id' => $oldTermSubject->id,
        'level_id' => $level->id,
        'day' => 'tuesday',
        'start_time' => '09:00',
        'end_time' => '10:30',
        'room' => 'B-202',
        'type' => 'lecture',
        'academic_year' => '2025-2026',
        'semester' => 'second',
    ]);

    $this->actingAs($user)->get(route('dashboard.my-term'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/student/my-term')
            ->has('enrollments', 3)
            ->has('enrollments.0', fn ($enrollment) => $enrollment
                ->where('id', $graded->id)
                ->where('status', 'active')
                ->where('subject.code', 'M101')
                ->where('grade.total', '100.00')
                ->where('grade.grade_letter', 'A')
                ->where('attendance.total', 2)
                ->where('attendance.absent', 1)
                ->where('attendance.rate', 50)
                ->etc()
            )
            ->has('enrollments.1', fn ($enrollment) => $enrollment
                ->where('status', 'pending')
                ->where('subject.code', 'M102')
                ->etc()
            )
            ->has('enrollments.2', fn ($enrollment) => $enrollment
                ->where('status', 'withdrawn')
                ->where('withdrawn_reason', 'Section overflow')
                ->where('subject.code', 'M103')
                ->etc()
            )
            ->has('sessions', 1)
            ->where('sessions.0.day', 'monday')
            ->where('sessions.0.subject.code', 'M101')
            ->where('term.academic_year', '2026-2027')
            ->where('registration_window.self_drop_open', true)
            ->where('student.student_no', 'MYT-0001')
        );
});

test('my term page handles a student without linked profile and an unconfigured term', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $this->actingAs($user)->get(route('dashboard.my-term'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/student/my-term')
            ->where('student', null)
            ->where('enrollments', [])
            ->where('sessions', [])
        );
});

test('my term page is reachable only through the student gates', function () {
    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);

    $teacher = User::factory()->create();
    $teacher->assignRole(UserRole::Teacher->value);

    $this->actingAs($teacher)->get(route('dashboard.my-term'))->assertForbidden();
});

test('my term page requires authentication', function () {
    $this->get(route('dashboard.my-term'))->assertRedirect('/login');
});

/**
 * Phase 3 — backfill correctness. RefreshDatabase has already run the
 * migrations on an empty database, so rows are inserted now and the
 * idempotent backfill migration is re-invoked directly.
 */
test('backfill links legacy rows to created terms and leaves garbage unlinked', function () {
    // No updateSettings() here: no term may exist yet, the backfill itself
    // has to create it (inactive).
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    $department = CmsDepartment::create(['name' => 'Backfill Dept', 'description' => 'Backfill']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 0]);
    $student = CmsStudent::create([
        'user_id' => User::factory()->create()->id,
        'student_no' => 'BKF-0001',
        'name' => 'Backfill Student',
        'email' => 'backfill-student@test.com',
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);
    $subject = myTermSubject($department->id, 'M201');

    $goodEnrollment = myTermEnrollment($student, $subject, 'active');

    // Simulate pre-term rows: term_id is null (the column is new) and one row
    // carries a garbage pair the enum never allowed.
    DB::table('cms_enrollments')->insert([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'dropped',
        'source' => 'admin',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $garbageId = (int) DB::getPdo()->lastInsertId();

    $scheduleId = DB::table('cms_schedules')->insertGetId([
        'subject_id' => $subject->id,
        'level_id' => $level->id,
        'day' => 'monday',
        'start_time' => '09:00',
        'end_time' => '10:30',
        'type' => 'lecture',
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $migration = require __DIR__.'/../../../database/migrations/2026_10_02_044246_backfill_cms_terms_from_legacy_string_columns.php';
    $migration->up();

    $term = DB::table('cms_terms')
        ->where('academic_year', '2026-2027')
        ->where('semester', 'first')
        ->first();

    expect($term)->not->toBeNull();
    expect((int) $term->is_active)->toBe(0);
    expect($goodEnrollment->refresh()->term_id)->toBe($term->id);
    expect(DB::table('cms_schedules')->find($scheduleId)->term_id)->toBe($term->id);
    expect(DB::table('cms_enrollments')->find($garbageId)->term_id)->toBeNull();
});

test('backfill is idempotent — re-running creates no duplicate terms', function () {
    [$user, $student, $department] = myTermSetup();
    $subject = myTermSubject($department->id, 'M202');

    myTermEnrollment($student, $subject, 'active');

    $migration = require __DIR__.'/../../../database/migrations/2026_10_02_044246_backfill_cms_terms_from_legacy_string_columns.php';
    $migration->up();
    $migration->up();

    expect(DB::table('cms_terms')->count())->toBe(1);
});
