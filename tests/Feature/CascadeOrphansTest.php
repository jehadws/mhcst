<?php

use App\Enums\UserRole;
use App\Models\CmsAttendance;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsGradeRevision;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\User;
use Spatie\Permission\Models\Role;

function makeCascadeManager(): User
{
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole(UserRole::Admin->value);

    return $user;
}

function cascadeTree(): array
{
    $dept = CmsDepartment::create(['name' => 'Cascade-'.uniqid()]);
    $level = CmsLevel::create(['department_id' => $dept->id, 'year' => 1, 'section' => 'A', 'capacity' => 40]);
    $subject = CmsSubject::create([
        'department_id' => $dept->id,
        'code' => 'CAS-'.uniqid(),
        'name' => 'Cascade Subject',
        'credits' => 3,
        'has_lab' => false,
        'semester' => 'first',
    ]);
    $student = CmsStudent::create([
        'level_id' => $level->id,
        'student_no' => 'CAS-'.uniqid(),
        'name' => 'Cascade Student',
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);
    $enrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'status' => 'active',
    ]);

    return compact('dept', 'level', 'subject', 'student', 'enrollment');
}

test('soft-deleting a student cascades delete to grades, attendance, and revisions', function () {
    $manager = makeCascadeManager();
    [
        'student' => $student,
        'enrollment' => $enrollment,
    ] = cascadeTree();

    // Create dependent rows
    $grade = CmsGrade::create([
        'enrollment_id' => $enrollment->id,
        'midterm' => 50,
        'final' => 60,
    ]);

    $revision = CmsGradeRevision::create([
        'grade_id' => $grade->id,
        'enrollment_id' => $enrollment->id,
        'old_values' => ['midterm' => 40],
        'new_values' => ['midterm' => 50],
    ]);

    $attendance = CmsAttendance::create([
        'enrollment_id' => $enrollment->id,
        'date' => now()->toDateString(),
        'status' => 'present',
    ]);

    // Destroy student through the controller
    $this->actingAs($manager)
        ->delete(route('cms.students.destroy', $student))
        ->assertRedirect(route('cms.students.index'));

    // Student and enrollment are soft-deleted
    expect(CmsStudent::find($student->id))->toBeNull();
    expect(CmsStudent::withTrashed()->find($student->id)->trashed())->toBeTrue();
    expect(CmsEnrollment::find($enrollment->id))->toBeNull();
    expect(CmsEnrollment::withTrashed()->find($enrollment->id)->trashed())->toBeTrue();

    // Grades, attendance, and revisions are hard-deleted (no soft-delete on these models)
    expect(CmsGrade::find($grade->id))->toBeNull();
    expect(CmsGradeRevision::find($revision->id))->toBeNull();
    expect(CmsAttendance::find($attendance->id))->toBeNull();
});

test('soft-deleting a subject cascades delete to grades, attendance, and revisions', function () {
    $manager = makeCascadeManager();
    [
        'subject' => $subject,
        'enrollment' => $enrollment,
    ] = cascadeTree();

    $grade = CmsGrade::create([
        'enrollment_id' => $enrollment->id,
        'midterm' => 45,
    ]);

    $attendance = CmsAttendance::create([
        'enrollment_id' => $enrollment->id,
        'date' => now()->toDateString(),
        'status' => 'absent',
    ]);

    $this->actingAs($manager)
        ->delete(route('cms.subjects.destroy', $subject))
        ->assertRedirect(route('cms.subjects.index'));

    expect(CmsEnrollment::withTrashed()->find($enrollment->id)->trashed())->toBeTrue();
    expect(CmsGrade::find($grade->id))->toBeNull();
    expect(CmsAttendance::find($attendance->id))->toBeNull();
});
