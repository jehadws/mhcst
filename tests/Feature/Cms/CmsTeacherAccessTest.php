<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createTeacherWithClass(): array
{
    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Teacher->value);

    $department = CmsDepartment::create(['name' => 'CS', 'description' => 'CS']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
    $teacher = CmsTeacher::create(['user_id' => $user->id, 'name' => 'Dr. Ali', 'email' => 'ali@test.com', 'status' => 'active']);
    $subject = CmsSubject::create(['department_id' => $department->id, 'code' => 'CS101', 'name' => 'Intro', 'credits' => 3, 'semester' => 'first']);
    $otherSubject = CmsSubject::create(['department_id' => $department->id, 'code' => 'CS102', 'name' => 'Advanced', 'credits' => 3, 'semester' => 'first']);
    $student = CmsStudent::create(['student_no' => 'S1', 'name' => 'Student One', 'email' => 's1@test.com', 'level_id' => $level->id, 'enrollment_date' => now(), 'status' => 'active']);
    $otherStudent = CmsStudent::create(['student_no' => 'S2', 'name' => 'Student Two', 'email' => 's2@test.com', 'level_id' => $level->id, 'enrollment_date' => now(), 'status' => 'active']);

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

    $enrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'status' => 'active',
    ]);

    CmsEnrollment::create([
        'student_id' => $otherStudent->id,
        'subject_id' => $otherSubject->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'status' => 'active',
    ]);

    return compact('user', 'teacher', 'subject', 'otherSubject', 'student', 'otherStudent', 'enrollment');
}

test('teacher cannot manage cms structure routes', function () {
    ['user' => $user] = createTeacherWithClass();

    $this->actingAs($user)->get('/cms/departments')->assertForbidden();
    $this->actingAs($user)->get('/cms/departments/create')->assertForbidden();
    $this->actingAs($user)->get('/cms/reports')->assertForbidden();
    $this->actingAs($user)->post('/cms/students', [])->assertForbidden();
});

test('teacher can view own schedules and students but not manage schedules', function () {
    ['user' => $user, 'student' => $student, 'otherStudent' => $otherStudent] = createTeacherWithClass();

    $this->actingAs($user)->get('/cms/schedules')->assertOk();
    $this->actingAs($user)->get('/cms/students')->assertOk()->assertInertia(fn ($page) => $page
        ->has('students.data', 1)
        ->where('students.data.0.id', $student->id)
    );

    $this->actingAs($user)->get("/cms/students/{$student->id}")->assertOk();
    $this->actingAs($user)->get("/cms/students/{$otherStudent->id}")->assertForbidden();
    $this->actingAs($user)->get('/cms/schedules/create')->assertForbidden();
});

test('teacher can update grades only for assigned subjects', function () {
    ['user' => $user, 'enrollment' => $enrollment, 'otherSubject' => $otherSubject, 'student' => $student] = createTeacherWithClass();

    $otherEnrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $otherSubject->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'status' => 'active',
    ]);

    $this->actingAs($user)->post('/cms/grades/update', [
        'enrollment_id' => $enrollment->id,
        'midterm' => 80,
        'final' => 85,
    ])->assertRedirect();

    $this->actingAs($user)->post('/cms/grades/update', [
        'enrollment_id' => $otherEnrollment->id,
        'midterm' => 80,
        'final' => 85,
    ])->assertForbidden();
});

test('admin retains full cms management access', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    CmsDepartment::create(['name' => 'Eng', 'description' => 'Eng']);

    $this->actingAs($admin)->get('/cms/departments')->assertOk();
    $this->actingAs($admin)->get('/cms/reports')->assertOk();
    $this->actingAs($admin)->get('/cms/departments/create')->assertOk();
});
