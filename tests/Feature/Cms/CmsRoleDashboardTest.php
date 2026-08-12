<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\GradeLockService;
use Spatie\Permission\Models\Role;

test('grade lock service locks after deadline', function () {
    SiteSetting::create(['key' => 'cms.grade_entry_deadline', 'value' => now()->subDay()->format('Y-m-d'), 'type' => 'text']);
    SiteSetting::create(['key' => 'cms.grades_locked', 'value' => '0', 'type' => 'text']);

    expect(app(GradeLockService::class)->isLocked())->toBeTrue();
});

test('admin can edit grades when locked but teacher cannot', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);

    SiteSetting::create(['key' => 'cms.grades_locked', 'value' => '1', 'type' => 'text']);

    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $teacherUser = User::factory()->create();
    $teacherUser->assignRole(UserRole::Teacher->value);

    $lock = app(GradeLockService::class);

    expect($lock->canEditGrades($admin))->toBeTrue()
        ->and($lock->canEditGrades($teacherUser))->toBeFalse();
});

test('teacher dashboard shows teacher-specific data', function () {
    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Teacher->value);

    $department = CmsDepartment::create(['name' => 'CS', 'description' => 'CS']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
    $teacher = CmsTeacher::create(['user_id' => $user->id, 'name' => 'Dr. Ali', 'email' => 'ali@test.com', 'status' => 'active']);
    $subject = CmsSubject::create(['department_id' => $department->id, 'code' => 'CS101', 'name' => 'Intro', 'credits' => 3, 'semester' => 'first']);
    $student = CmsStudent::create(['student_no' => 'S1', 'name' => 'Student', 'email' => 's@test.com', 'level_id' => $level->id, 'enrollment_date' => now(), 'status' => 'active']);

    CmsSchedule::create([
        'subject_id' => $subject->id,
        'teacher_id' => $teacher->id,
        'level_id' => $level->id,
        'day' => match (now()->dayOfWeek) {
            0 => 'sunday', 1 => 'monday', 2 => 'tuesday', 3 => 'wednesday',
            4 => 'thursday', 5 => 'friday', 6 => 'saturday', default => 'saturday',
        },
        'start_time' => '09:00',
        'end_time' => '10:00',
        'room' => 'A1',
        'type' => 'lecture',
        'academic_year' => '2025-2026',
        'semester' => 'first',
    ]);

    CmsEnrollment::create(['student_id' => $student->id, 'subject_id' => $subject->id, 'academic_year' => '2025-2026', 'semester' => 'first', 'status' => 'active']);

    $this->actingAs($user)->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/index')
            ->where('dashboardRole', 'teacher')
            ->has('teacherClasses', 1)
            ->where('stats.pending_grades_count', 1)
        );
});

test('student role gets student dashboard', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $department = CmsDepartment::create(['name' => 'Eng', 'description' => 'Eng']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'B', 'capacity' => 30]);
    CmsStudent::create(['user_id' => $user->id, 'student_no' => 'S2', 'name' => 'Sara', 'email' => 'sara@test.com', 'level_id' => $level->id, 'enrollment_date' => now(), 'status' => 'active']);

    $this->actingAs($user)->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/index')
            ->where('dashboardRole', 'student')
            ->where('studentProfile.name', 'Sara')
        );
});

test('admin can view cms audit logs and settings pages', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole(UserRole::Admin->value);

    $this->actingAs($user)->get('/cms/audit-logs')->assertOk();
    $this->actingAs($user)->get('/cms/settings')->assertOk();
});

test('grade update is blocked when grades are locked for teachers', function () {
    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);

    SiteSetting::create(['key' => 'cms.grades_locked', 'value' => '1', 'type' => 'text']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Teacher->value);

    $department = CmsDepartment::create(['name' => 'CS', 'description' => 'CS']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
    $teacher = CmsTeacher::create(['user_id' => $user->id, 'name' => 'Dr. Ali', 'email' => 'ali@test.com', 'status' => 'active']);
    $subject = CmsSubject::create(['department_id' => $department->id, 'code' => 'CS101', 'name' => 'Intro', 'credits' => 3, 'semester' => 'first']);
    $student = CmsStudent::create(['student_no' => 'S1', 'name' => 'Student', 'email' => 's@test.com', 'level_id' => $level->id, 'enrollment_date' => now(), 'status' => 'active']);
    $enrollment = CmsEnrollment::create(['student_id' => $student->id, 'subject_id' => $subject->id, 'academic_year' => '2025-2026', 'semester' => 'first', 'status' => 'active']);

    CmsSchedule::create([
        'subject_id' => $subject->id,
        'teacher_id' => $teacher->id,
        'level_id' => $level->id,
        'day' => 'saturday',
        'start_time' => '09:00',
        'end_time' => '10:00',
        'room' => 'A1',
        'type' => 'lecture',
        'academic_year' => '2025-2026',
        'semester' => 'first',
    ]);

    $this->actingAs($user)->post('/cms/grades/update', [
        'enrollment_id' => $enrollment->id,
        'midterm' => 80,
        'final' => 85,
    ])->assertRedirect()->assertSessionHasErrors('grades');

    expect(CmsGrade::where('enrollment_id', $enrollment->id)->exists())->toBeFalse();
});
