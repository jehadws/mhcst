<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\User;
use Spatie\Permission\Models\Role;

/**
 * Phase 7 hardening — the admin edit path on an existing enrollment:
 * identity is immutable, status changes follow a state machine, and
 * activating re-checks capacity at write time under a row lock.
 */
function enrollmentUpdateSetup(int $capacity = 30): array
{
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $department = CmsDepartment::create(['name' => 'Update Dept', 'description' => 'Update']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => $capacity]);
    $subject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'UPD101',
        'name' => 'Update Subject',
        'credits' => 3,
        'semester' => 'first',
    ]);
    $student = CmsStudent::create([
        'user_id' => User::factory()->create()->id,
        'student_no' => 'UPD-0001',
        'name' => 'Update Student',
        'email' => 'upd-student@test.com',
        'level_id' => $level->id,
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);

    return [$admin, $department, $level, $subject, $student];
}

function updateSubjectFor(CmsDepartment $department, string $code): CmsSubject
{
    return CmsSubject::create([
        'department_id' => $department->id,
        'code' => $code,
        'name' => "Subject {$code}",
        'credits' => 3,
        'semester' => 'first',
    ]);
}

function updateEnrollmentFor(CmsStudent $student, CmsSubject $subject, string $status = 'pending'): CmsEnrollment
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

function updatePayload(CmsEnrollment $enrollment, array $overrides = []): array
{
    return array_merge([
        'student_id' => (string) $enrollment->student_id,
        'subject_id' => (string) $enrollment->subject_id,
        'academic_year' => $enrollment->academic_year,
        'semester' => $enrollment->semester,
        'status' => $enrollment->status,
        'withdrawn_reason' => $enrollment->withdrawn_reason,
    ], $overrides);
}

test('a pending enrollment can be activated from the edit path', function () {
    [$admin, , , $subject, $student] = enrollmentUpdateSetup();
    $enrollment = updateEnrollmentFor($student, $subject);

    $this->actingAs($admin)
        ->put(route('cms.enrollments.update', $enrollment), updatePayload($enrollment, ['status' => 'active']))
        ->assertRedirect(route('cms.enrollments.index'));

    expect($enrollment->refresh()->status)->toBe('active');
});

test('activating is refused at write time when the section is full', function () {
    [$admin, , $level, $subject, $student] = enrollmentUpdateSetup(capacity: 1);
    $other = CmsStudent::create([
        'user_id' => User::factory()->create()->id,
        'student_no' => 'UPD-0002',
        'name' => 'Other Student',
        'level_id' => $level->id,
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);
    updateEnrollmentFor($other, $subject, 'active');

    $enrollment = updateEnrollmentFor($student, $subject);

    $this->actingAs($admin)
        ->put(route('cms.enrollments.update', $enrollment), updatePayload($enrollment, ['status' => 'active']))
        ->assertSessionHasErrors('subject_id');

    expect($enrollment->refresh()->status)->toBe('pending');
});

test('identity fields are immutable on the edit path', function () {
    [$admin, $department, $level, $subject, $student] = enrollmentUpdateSetup();
    $enrollment = updateEnrollmentFor($student, $subject);
    $otherSubject = updateSubjectFor($department, 'UPD102');
    $otherStudent = CmsStudent::create([
        'user_id' => User::factory()->create()->id,
        'student_no' => 'UPD-0002',
        'name' => 'Other Student',
        'level_id' => $level->id,
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);

    $this->actingAs($admin)
        ->put(route('cms.enrollments.update', $enrollment), updatePayload($enrollment, ['subject_id' => (string) $otherSubject->id]))
        ->assertSessionHasErrors('subject_id');

    $this->actingAs($admin)
        ->put(route('cms.enrollments.update', $enrollment), updatePayload($enrollment, ['student_id' => (string) $otherStudent->id]))
        ->assertSessionHasErrors('student_id');

    $this->actingAs($admin)
        ->put(route('cms.enrollments.update', $enrollment), updatePayload($enrollment, ['semester' => 'second']))
        ->assertSessionHasErrors('semester');

    expect($enrollment->refresh()->subject_id)->toBe($subject->id)
        ->and($enrollment->refresh()->student_id)->toBe($student->id)
        ->and($enrollment->refresh()->semester)->toBe('first');
});

test('completed is a terminal status on the edit path', function () {
    [$admin, , , $subject, $student] = enrollmentUpdateSetup();
    $enrollment = updateEnrollmentFor($student, $subject, 'completed');

    $this->actingAs($admin)
        ->put(route('cms.enrollments.update', $enrollment), updatePayload($enrollment, ['status' => 'active']))
        ->assertSessionHasErrors('status');

    expect($enrollment->refresh()->status)->toBe('completed');
});

test('withdrawing requires a reason and completing only comes from active', function () {
    [$admin, $department, , $subject, $student] = enrollmentUpdateSetup();
    $active = updateEnrollmentFor($student, $subject, 'active');
    $pending = updateEnrollmentFor($student, updateSubjectFor($department, 'UPD103'));

    $this->actingAs($admin)
        ->put(route('cms.enrollments.update', $active), updatePayload($active, ['status' => 'withdrawn']))
        ->assertSessionHasErrors('withdrawn_reason');

    $this->actingAs($admin)
        ->put(route('cms.enrollments.update', $active), updatePayload($active, ['status' => 'completed']))
        ->assertRedirect(route('cms.enrollments.index'));
    expect($active->refresh()->status)->toBe('completed');

    $this->actingAs($admin)
        ->put(route('cms.enrollments.update', $pending), updatePayload($pending, ['status' => 'completed']))
        ->assertSessionHasErrors('status');
});

test('a withdrawn pick can be re-opened as pending and the reason is cleared', function () {
    [$admin, , , $subject, $student] = enrollmentUpdateSetup();
    $enrollment = updateEnrollmentFor($student, $subject, 'withdrawn');
    $enrollment->update(['withdrawn_reason' => 'Wrong pick']);

    $this->actingAs($admin)
        ->put(route('cms.enrollments.update', $enrollment), updatePayload($enrollment, ['status' => 'pending']))
        ->assertRedirect(route('cms.enrollments.index'));

    expect($enrollment->refresh()->status)->toBe('pending')
        ->and($enrollment->withdrawn_reason)->toBeNull();
});

test('demoting an active pick to pending is not allowed on the edit path', function () {
    [$admin, , , $subject, $student] = enrollmentUpdateSetup();
    $enrollment = updateEnrollmentFor($student, $subject, 'active');

    $this->actingAs($admin)
        ->put(route('cms.enrollments.update', $enrollment), updatePayload($enrollment, ['status' => 'pending']))
        ->assertSessionHasErrors('status');

    expect($enrollment->refresh()->status)->toBe('active');
});

test('a suspended student can still be withdrawn or completed, but not activated', function () {
    [$admin, $department, , $subject, $student] = enrollmentUpdateSetup();
    $student->update(['status' => 'suspended']);

    $withdraw = updateEnrollmentFor($student, $subject, 'active');

    $this->actingAs($admin)
        ->put(route('cms.enrollments.update', $withdraw), updatePayload($withdraw, ['status' => 'withdrawn', 'withdrawn_reason' => 'Student suspended']))
        ->assertRedirect(route('cms.enrollments.index'));
    expect($withdraw->refresh()->status)->toBe('withdrawn');

    $activate = updateEnrollmentFor($student, updateSubjectFor($department, 'UPD104'));

    $this->actingAs($admin)
        ->put(route('cms.enrollments.update', $activate), updatePayload($activate, ['status' => 'active']))
        ->assertSessionHasErrors('student_id');
});
