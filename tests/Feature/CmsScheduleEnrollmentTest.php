<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\NotificationTemplate;
use App\Models\User;
use Spatie\Permission\Models\Role;

function actingAsCmsAdmin(): User
{
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Admin->value);

    return $user;
}

function createCmsFixtures(): array
{
    $department = CmsDepartment::create([
        'name' => 'Engineering',
        'description' => 'Eng Dept',
    ]);

    $level = CmsLevel::create([
        'department_id' => $department->id,
        'year' => 1,
        'section' => 'A',
        'capacity' => 30,
    ]);

    $teacher = CmsTeacher::create([
        'name' => 'Dr. Test',
        'email' => 'teacher@example.com',
        'status' => 'active',
    ]);

    $subject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'CS101',
        'name' => 'Intro to CS',
        'credits' => 3,
        'semester' => 'first',
    ]);

    $student = CmsStudent::create([
        'student_no' => '2026-0001',
        'name' => 'Test Student',
        'email' => 'student@example.com',
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    return compact('department', 'level', 'teacher', 'subject', 'student');
}

test('authenticated user can edit and update a schedule', function () {
    $user = actingAsCmsAdmin();
    ['level' => $level, 'teacher' => $teacher, 'subject' => $subject] = createCmsFixtures();

    $schedule = CmsSchedule::create([
        'subject_id' => $subject->id,
        'teacher_id' => $teacher->id,
        'level_id' => $level->id,
        'day' => 'saturday',
        'start_time' => '09:00',
        'end_time' => '10:30',
        'room' => 'Lab 1',
        'type' => 'lecture',
        'academic_year' => '2025-2026',
        'semester' => 'first',
    ]);

    $this->actingAs($user)
        ->get("/cms/schedules/{$schedule->id}/edit")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('cms/schedules/edit'));

    $this->actingAs($user)
        ->put("/cms/schedules/{$schedule->id}", [
            'subject_id' => $subject->id,
            'teacher_id' => $teacher->id,
            'level_id' => $level->id,
            'day' => 'sunday',
            'start_time' => '11:00',
            'end_time' => '12:30',
            'room' => 'Hall 2',
            'type' => 'lab',
            'academic_year' => '2025-2026',
            'semester' => 'first',
        ])
        ->assertRedirect(route('cms.schedules.index'));

    expect($schedule->fresh())
        ->day->toBe('sunday')
        ->room->toBe('Hall 2')
        ->type->toBe('lab');
});

test('authenticated user can view and update an enrollment', function () {
    $user = actingAsCmsAdmin();
    ['subject' => $subject, 'student' => $student] = createCmsFixtures();

    $enrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'status' => 'active',
    ]);

    $this->actingAs($user)
        ->get("/cms/enrollments/{$enrollment->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('cms/enrollments/show'));

    $this->actingAs($user)
        ->put("/cms/enrollments/{$enrollment->id}", [
            'student_id' => $student->id,
            'subject_id' => $subject->id,
            'academic_year' => '2025-2026',
            'semester' => 'second',
            'status' => 'completed',
        ])
        ->assertRedirect(route('cms.enrollments.index'));

    expect($enrollment->fresh())
        ->semester->toBe('second')
        ->status->toBe('completed');
});

test('student role cannot access cms routes', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $this->actingAs($user)->get('/cms/departments')->assertForbidden();
});

test('notification template pages are accessible to crm users', function () {
    Role::firstOrCreate(['name' => UserRole::Support->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Support->value);
    $template = NotificationTemplate::factory()->create([
        'name' => 'Welcome Email',
        'channel' => 'email',
        'trigger_event' => 'enrollment.created',
        'subject' => 'Welcome',
        'body' => 'Hello {{name}}',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard.notification-templates.list'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/notification-templates/list'));

    $this->actingAs($user)
        ->get(route('dashboard.notification-templates.show', $template))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/notification-templates/show'));
});

test('dashboard today schedules filters by current weekday', function () {
    $user = actingAsCmsAdmin();
    ['level' => $level, 'teacher' => $teacher, 'subject' => $subject] = createCmsFixtures();

    $todayDay = match (now()->dayOfWeek) {
        0 => 'sunday',
        1 => 'monday',
        2 => 'tuesday',
        3 => 'wednesday',
        4 => 'thursday',
        5 => 'friday',
        6 => 'saturday',
        default => 'saturday',
    };

    $otherDay = $todayDay === 'saturday' ? 'sunday' : 'saturday';

    CmsSchedule::create([
        'subject_id' => $subject->id,
        'teacher_id' => $teacher->id,
        'level_id' => $level->id,
        'day' => $todayDay,
        'start_time' => '09:00',
        'end_time' => '10:00',
        'room' => 'A1',
        'type' => 'lecture',
        'academic_year' => '2025-2026',
        'semester' => 'first',
    ]);

    CmsSchedule::create([
        'subject_id' => $subject->id,
        'teacher_id' => $teacher->id,
        'level_id' => $level->id,
        'day' => $otherDay,
        'start_time' => '11:00',
        'end_time' => '12:00',
        'room' => 'B1',
        'type' => 'lecture',
        'academic_year' => '2025-2026',
        'semester' => 'first',
    ]);

    $this->actingAs($user)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('todaySchedules', 1)
            ->where('todaySchedules.0.day', $todayDay)
        );
});
