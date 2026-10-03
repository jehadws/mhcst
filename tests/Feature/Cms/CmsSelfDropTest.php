<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\User;
use App\Services\CmsAcademicSettingsService;
use App\Services\CmsSubjectRegistrationService;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Phase 3 — student self-drop inside the add/drop window.
 */
function selfDropSetup(?string $addDropDeadline = '2030-12-31'): array
{
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $department = CmsDepartment::create(['name' => 'Drop Dept', 'description' => 'Drop']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);

    $student = CmsStudent::create([
        'user_id' => $user->id,
        'student_no' => 'DROP-0001',
        'name' => 'Drop Student',
        'email' => 'drop-student@test.com',
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
        'add_drop_deadline' => $addDropDeadline,
    ]);

    return [$user, $student, $department];
}

function selfDropSubject(int $departmentId, string $code): CmsSubject
{
    return CmsSubject::create([
        'department_id' => $departmentId,
        'code' => $code,
        'name' => "Subject {$code}",
        'credits' => 3,
        'semester' => 'first',
    ]);
}

function selfDropEnrollment(CmsStudent $student, CmsSubject $subject, string $status = 'pending'): CmsEnrollment
{
    return CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => $status,
        'source' => 'self',
    ]);
}

test('student drops a pending pick inside the add/drop window', function () {
    [$user, $student, $department] = selfDropSetup();
    $subject = selfDropSubject($department->id, 'D101');
    $enrollment = selfDropEnrollment($student, $subject);

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.drop', ['enrollment' => $enrollment->id]))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($enrollment->refresh()->status)->toBe('dropped');
});

test('student drops an active pick inside the add/drop window', function () {
    [$user, $student, $department] = selfDropSetup();
    $subject = selfDropSubject($department->id, 'D102');
    $enrollment = selfDropEnrollment($student, $subject, 'active');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.drop', ['enrollment' => $enrollment->id]))
        ->assertRedirect();

    expect($enrollment->refresh()->status)->toBe('dropped');
});

test('dropping is refused after the add/drop deadline', function () {
    [$user, $student, $department] = selfDropSetup(now()->subDay()->toDateString());
    $subject = selfDropSubject($department->id, 'D103');
    $enrollment = selfDropEnrollment($student, $subject, 'active');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.drop', ['enrollment' => $enrollment->id]))
        ->assertRedirect()
        ->assertSessionHasErrors('enrollment');

    expect($enrollment->refresh()->status)->toBe('active');
});

test('a term without an add/drop deadline never closes self-drop', function () {
    [$user, $student, $department] = selfDropSetup(null);
    $subject = selfDropSubject($department->id, 'D104');
    $enrollment = selfDropEnrollment($student, $subject, 'active');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.drop', ['enrollment' => $enrollment->id]))
        ->assertRedirect();

    expect($enrollment->refresh()->status)->toBe('dropped');
});

test('self-drop is governed by the deadline, not by the registration switch or dates', function () {
    [$user, $student, $department] = selfDropSetup(now()->addDay()->toDateString());
    $subject = selfDropSubject($department->id, 'D105');
    $enrollment = selfDropEnrollment($student, $subject, 'active');

    // Registration itself is closed (ended window) but the add/drop deadline
    // has not passed: the student can still correct a mistake by dropping.
    app(CmsAcademicSettingsService::class)->updateSettings([
        'grades_locked' => false,
        'academic_year' => '2026-2027',
        'current_semester' => 'first',
        'subject_registration_open' => true,
        'consecutive_absence_threshold' => 3,
        'absence_rate_threshold' => 20,
        'registration_starts_at' => now()->subDays(20)->toDateString(),
        'registration_ends_at' => now()->subDays(5)->toDateString(),
        'add_drop_deadline' => now()->addDay()->toDateString(),
    ]);

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.drop', ['enrollment' => $enrollment->id]))
        ->assertRedirect();

    expect($enrollment->refresh()->status)->toBe('dropped');
});

test('a dropped pick frees the subject and re-registration reopens the same row', function () {
    [$user, $student, $department] = selfDropSetup();
    $subject = selfDropSubject($department->id, 'D106');
    $enrollment = selfDropEnrollment($student, $subject, 'active');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.drop', ['enrollment' => $enrollment->id]))
        ->assertRedirect();

    expect(app(CmsSubjectRegistrationService::class)->availableFor($student)->pluck('id'))->toContain($subject->id);

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertRedirect();

    expect(CmsEnrollment::count())->toBe(1);
    expect($enrollment->refresh()->status)->toBe('pending');
});

test('withdrawn, completed, and dropped picks cannot be dropped again', function () {
    [$user, $student, $department] = selfDropSetup();

    foreach (['withdrawn', 'completed', 'dropped'] as $status) {
        $subject = selfDropSubject($department->id, "D{$status}");
        $enrollment = selfDropEnrollment($student, $subject, $status);

        $this->actingAs($user)
            ->post(route('dashboard.subject-registration.drop', ['enrollment' => $enrollment->id]))
            ->assertSessionHasErrors('enrollment');

        expect($enrollment->refresh()->status)->toBe($status);
    }
});

test('a student cannot drop another student’s enrollment', function () {
    [$user] = selfDropSetup();
    $otherStudent = CmsStudent::create([
        'user_id' => User::factory()->create()->id,
        'student_no' => 'DROP-0002',
        'name' => 'Other Student',
        'email' => 'other-drop@test.com',
        'level_id' => 1,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    $subject = selfDropSubject(1, 'DX01');
    $enrollment = selfDropEnrollment($otherStudent, $subject, 'active');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.drop', ['enrollment' => $enrollment->id]))
        ->assertNotFound();

    expect($enrollment->refresh()->status)->toBe('active');
});

test('the registration page exposes the drop affordances through the window state', function () {
    [$user] = selfDropSetup(now()->addDays(7)->toDateString());

    $this->actingAs($user)->get(route('dashboard.subject-registration.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('registration_window.self_drop_open', true)
            ->where('registration_window.add_drop_deadline', now()->addDays(7)->toDateString())
        );
});

test('the preview endpoint lists problems without writing anything', function () {
    [$user, $student, $department] = selfDropSetup(null);
    $subject = selfDropSubject($department->id, 'D107');
    selfDropEnrollment($student, $subject, 'active');

    $freshSubject = selfDropSubject($department->id, 'D108');

    $this->actingAs($user)
        ->get(route('dashboard.subject-registration.preview', ['subject_ids' => [$subject->id, $freshSubject->id]]))
        ->assertOk()
        ->assertJson(fn ($json) => $json
            ->has('problems', 1)
            ->where('problems.0', fn ($problem) => str_contains($problem, 'D107'))
        );

    expect(CmsEnrollment::query()->where('status', 'pending')->count())->toBe(0);
});

test('the preview endpoint returns an empty list for a clean selection', function () {
    [$user, , $department] = selfDropSetup(null);
    $subject = selfDropSubject($department->id, 'D109');

    $this->actingAs($user)
        ->get(route('dashboard.subject-registration.preview', ['subject_ids' => [$subject->id]]))
        ->assertOk()
        ->assertJsonPath('problems', []);
});

test('drop requires authentication', function () {
    $this->post(route('dashboard.subject-registration.drop', ['enrollment' => 1]))
        ->assertRedirect('/login');
});

test('an enrollment from a previous term cannot be self-dropped', function () {
    [$user, $student, $department] = selfDropSetup();
    $subject = selfDropSubject($department->id, 'D110');
    $enrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2025-2026',
        'semester' => 'second',
        'enrollment_date' => now(),
        'status' => 'active',
        'source' => 'self',
    ]);

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.drop', ['enrollment' => $enrollment->id]))
        ->assertSessionHasErrors('enrollment');

    expect($enrollment->refresh()->status)->toBe('active');
});

test('a suspended student cannot self-drop', function () {
    [$user, $student, $department] = selfDropSetup();
    $subject = selfDropSubject($department->id, 'D111');
    $enrollment = selfDropEnrollment($student, $subject, 'active');
    $student->update(['status' => 'suspended']);

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.drop', ['enrollment' => $enrollment->id]))
        ->assertSessionHasErrors('enrollment');

    expect($enrollment->refresh()->status)->toBe('active');
});

test('the service refuses enrollments belonging to another student', function () {
    [$user, $student] = selfDropSetup();
    $otherStudent = CmsStudent::create([
        'user_id' => User::factory()->create()->id,
        'student_no' => 'DROP-0003',
        'name' => 'Third Student',
        'level_id' => 1,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    $subject = selfDropSubject(1, 'DX02');
    $enrollment = selfDropEnrollment($otherStudent, $subject, 'active');

    expect(fn () => app(CmsSubjectRegistrationService::class)->dropRegistration($student, $enrollment))
        ->toThrow(HttpException::class);

    expect($enrollment->refresh()->status)->toBe('active');
});
