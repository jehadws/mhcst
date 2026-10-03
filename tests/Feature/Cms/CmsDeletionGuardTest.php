<?php

use App\Enums\UserRole;
use App\Models\CmsAttendance;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

/**
 * Phase 7 hardening — deletes that cascade into the grade/attendance tables
 * (which have no soft deletes) are refused while recorded data exists.
 */
function deletionGuardSetup(): array
{
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $department = CmsDepartment::create(['name' => 'Guard Dept', 'description' => 'Guard']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
    $subject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'GRD101',
        'name' => 'Guard Subject',
        'credits' => 3,
        'semester' => 'first',
    ]);
    $student = CmsStudent::create([
        'user_id' => User::factory()->create()->id,
        'student_no' => 'GRD-0001',
        'name' => 'Guard Student',
        'email' => 'guard-student@test.com',
        'level_id' => $level->id,
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);

    return [$admin, $department, $level, $subject, $student];
}

function guardEnrollment(CmsStudent $student, CmsSubject $subject, string $status = 'active'): CmsEnrollment
{
    return CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => $status,
        'source' => 'admin',
    ]);
}

test('an enrollment with recorded grades cannot be deleted', function () {
    [$admin, , , $subject, $student] = deletionGuardSetup();
    $enrollment = guardEnrollment($student, $subject);
    CmsGrade::create(['enrollment_id' => $enrollment->id, 'midterm' => 90]);

    $this->actingAs($admin)
        ->delete(route('cms.enrollments.destroy', $enrollment))
        ->assertSessionHasErrors('delete');

    expect($enrollment->refresh()->deleted_at)->toBeNull()
        ->and(CmsGrade::where('enrollment_id', $enrollment->id)->count())->toBe(1);
});

test('an enrollment with attendance cannot be deleted', function () {
    [$admin, , , $subject, $student] = deletionGuardSetup();
    $enrollment = guardEnrollment($student, $subject);
    CmsAttendance::create(['enrollment_id' => $enrollment->id, 'date' => now()->toDateString(), 'status' => 'absent']);

    $this->actingAs($admin)
        ->delete(route('cms.enrollments.destroy', $enrollment))
        ->assertSessionHasErrors('delete');

    expect($enrollment->refresh()->deleted_at)->toBeNull();
});

test('an empty enrollment can still be deleted', function () {
    [$admin, , , $subject, $student] = deletionGuardSetup();
    $enrollment = guardEnrollment($student, $subject);

    $this->actingAs($admin)
        ->delete(route('cms.enrollments.destroy', $enrollment))
        ->assertRedirect(route('cms.enrollments.index'));

    $this->assertSoftDeleted($enrollment);
});

test('a level whose students have grades cannot be deleted', function () {
    [$admin, , $level, $subject, $student] = deletionGuardSetup();
    $enrollment = guardEnrollment($student, $subject);
    CmsGrade::create(['enrollment_id' => $enrollment->id, 'final' => 80]);

    $this->actingAs($admin)
        ->delete(route('cms.levels.destroy', $level))
        ->assertSessionHasErrors('delete');

    expect($level->refresh()->deleted_at)->toBeNull()
        ->and(CmsGrade::where('enrollment_id', $enrollment->id)->count())->toBe(1);
});

test('an empty level can still be deleted', function () {
    [$admin, , $level] = deletionGuardSetup();

    $this->actingAs($admin)
        ->delete(route('cms.levels.destroy', $level))
        ->assertRedirect(route('cms.levels.index'));

    $this->assertSoftDeleted($level);
});

test('a subject with recorded grades cannot be deleted', function () {
    [$admin, , , $subject, $student] = deletionGuardSetup();
    $enrollment = guardEnrollment($student, $subject);
    CmsGrade::create(['enrollment_id' => $enrollment->id, 'midterm' => 70]);

    $this->actingAs($admin)
        ->delete(route('cms.subjects.destroy', $subject))
        ->assertSessionHasErrors('delete');

    expect($subject->refresh()->deleted_at)->toBeNull();
});

test('a subject without recorded data can still be deleted', function () {
    [$admin, , , $subject, $student] = deletionGuardSetup();
    guardEnrollment($student, $subject);

    $this->actingAs($admin)
        ->delete(route('cms.subjects.destroy', $subject))
        ->assertRedirect(route('cms.subjects.index'));

    $this->assertSoftDeleted($subject);
});

test('a department containing recorded grades cannot be deleted', function () {
    [$admin, $department, , $subject, $student] = deletionGuardSetup();
    $enrollment = guardEnrollment($student, $subject);
    CmsAttendance::create(['enrollment_id' => $enrollment->id, 'date' => now()->toDateString(), 'status' => 'late']);

    $this->actingAs($admin)
        ->delete(route('cms.departments.destroy', $department))
        ->assertSessionHasErrors('delete');

    expect($department->refresh()->deleted_at)->toBeNull()
        ->and(CmsAttendance::where('enrollment_id', $enrollment->id)->count())->toBe(1);
});

test('a student with recorded grades cannot be deleted', function () {
    [$admin, , , $subject, $student] = deletionGuardSetup();
    $enrollment = guardEnrollment($student, $subject);
    CmsGrade::create(['enrollment_id' => $enrollment->id, 'midterm' => 60]);

    $this->actingAs($admin)
        ->delete(route('cms.students.destroy', $student))
        ->assertSessionHasErrors('delete');

    expect($student->refresh()->deleted_at)->toBeNull();
});

test('a student without recorded data can still be deleted', function () {
    [$admin, , , $subject, $student] = deletionGuardSetup();
    guardEnrollment($student, $subject);

    $this->actingAs($admin)
        ->delete(route('cms.students.destroy', $student))
        ->assertRedirect(route('cms.students.index'));

    $this->assertSoftDeleted($student);
    expect(DB::table('cms_enrollments')->whereNull('deleted_at')->count())->toBe(0);
});
