<?php

use App\Enums\UserRole;
use App\Models\CmsAuditLog;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\CmsSubjectRegistrationService;
use Spatie\Permission\Models\Role;

function createApprovalStudent(): array
{
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $department = CmsDepartment::create(['name' => 'Approval Dept', 'description' => 'Approval']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);

    $student = CmsStudent::create([
        'user_id' => $user->id,
        'student_no' => 'APR-0001',
        'name' => 'Approval Student',
        'email' => 'approval-student@test.com',
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    return [$user, $student, $level, $department];
}

function createApprovalSubject(int $departmentId, string $code): CmsSubject
{
    return CmsSubject::create([
        'department_id' => $departmentId,
        'code' => $code,
        'name' => "Subject {$code}",
        'credits' => 3,
        'semester' => 'first',
    ]);
}

function createApprovalEnrollment(int $studentId, int $subjectId, string $status = 'pending', string $source = 'self'): CmsEnrollment
{
    return CmsEnrollment::create([
        'student_id' => $studentId,
        'subject_id' => $subjectId,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => $status,
        'source' => $source,
    ]);
}

function setApprovalTerm(string $year = '2026-2027', string $semester = 'first'): void
{
    SiteSetting::updateOrCreate(['key' => 'cms.academic_year'], ['value' => $year, 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'cms.current_semester'], ['value' => $semester, 'type' => 'text']);
}

test('admin can bulk approve pending registrations without touching handled rows', function () {
    $admin = createAdminUser();
    [$user, $student, , $department] = createApprovalStudent();
    $subjectA = createApprovalSubject($department->id, 'AP101');
    $subjectB = createApprovalSubject($department->id, 'AP102');
    $subjectC = createApprovalSubject($department->id, 'AP103');

    $pendingA = createApprovalEnrollment($student->id, $subjectA->id);
    $pendingB = createApprovalEnrollment($student->id, $subjectB->id);
    $completed = createApprovalEnrollment($student->id, $subjectC->id, 'completed', 'admin');

    $this->actingAs($admin)
        ->post(route('cms.enrollments.approve'), [
            'enrollment_ids' => [$pendingA->id, $pendingB->id, $completed->id],
        ])
        ->assertRedirect(route('cms.enrollments.index'))
        ->assertSessionHas('success', 'Approved 2 registrations successfully.');

    expect($pendingA->refresh()->status)->toBe('active');
    expect($pendingB->refresh()->status)->toBe('active');
    expect($pendingA->refresh()->source)->toBe('self');
    expect($completed->refresh()->status)->toBe('completed');
});

test('managers can approve pending registrations', function () {
    $manager = createUserWithRoles([UserRole::Manager->value]);
    [$user, $student, , $department] = createApprovalStudent();
    $subject = createApprovalSubject($department->id, 'AP104');
    $pending = createApprovalEnrollment($student->id, $subject->id);

    $this->actingAs($manager)
        ->post(route('cms.enrollments.approve'), ['enrollment_ids' => [$pending->id]])
        ->assertRedirect();

    expect($pending->refresh()->status)->toBe('active');
});

test('approved pick is no longer offered in the student available list', function () {
    $admin = createAdminUser();
    [$user, $student, , $department] = createApprovalStudent();
    setApprovalTerm();
    $subject = createApprovalSubject($department->id, 'AP201');
    $pending = createApprovalEnrollment($student->id, $subject->id);

    $this->actingAs($admin)
        ->post(route('cms.enrollments.approve'), ['enrollment_ids' => [$pending->id]])
        ->assertRedirect();

    $available = app(CmsSubjectRegistrationService::class)->availableFor($student->refresh());

    expect($available->pluck('code')->all())->toBe([]);
});

test('admin can reject a pending registration and the subject becomes pickable again', function () {
    $admin = createAdminUser();
    [$user, $student, , $department] = createApprovalStudent();
    setApprovalTerm();
    $subject = createApprovalSubject($department->id, 'AP202');
    $pending = createApprovalEnrollment($student->id, $subject->id);

    $this->actingAs($admin)
        ->post(route('cms.enrollments.reject', $pending))
        ->assertRedirect(route('cms.enrollments.index'))
        ->assertSessionHas('success', 'Registration rejected successfully.');

    expect($pending->refresh()->status)->toBe('withdrawn');
    expect($pending->refresh()->source)->toBe('self');

    $available = app(CmsSubjectRegistrationService::class)->availableFor($student->refresh());

    expect($available->pluck('code')->all())->toBe(['AP202']);
});

test('rejecting an enrollment that is not pending is refused', function () {
    $admin = createAdminUser();
    [$user, $student, , $department] = createApprovalStudent();
    $subject = createApprovalSubject($department->id, 'AP203');
    $active = createApprovalEnrollment($student->id, $subject->id, 'active', 'admin');

    $this->actingAs($admin)
        ->post(route('cms.enrollments.reject', $active))
        ->assertSessionHasErrors('enrollment');

    expect($active->refresh()->status)->toBe('active');
});

test('teachers cannot approve or reject registrations', function () {
    $teacher = createUserWithRoles([UserRole::Teacher->value]);
    [$user, $student, , $department] = createApprovalStudent();
    $subject = createApprovalSubject($department->id, 'AP204');
    $pending = createApprovalEnrollment($student->id, $subject->id);

    $this->actingAs($teacher)
        ->post(route('cms.enrollments.approve'), ['enrollment_ids' => [$pending->id]])
        ->assertForbidden();
    $this->actingAs($teacher)
        ->post(route('cms.enrollments.reject', $pending))
        ->assertForbidden();

    expect($pending->refresh()->status)->toBe('pending');
});

test('students cannot approve or reject registrations', function () {
    [$user, $student, , $department] = createApprovalStudent();
    $subject = createApprovalSubject($department->id, 'AP205');
    $pending = createApprovalEnrollment($student->id, $subject->id);

    $this->actingAs($user)
        ->post(route('cms.enrollments.approve'), ['enrollment_ids' => [$pending->id]])
        ->assertForbidden();
    $this->actingAs($user)
        ->post(route('cms.enrollments.reject', $pending))
        ->assertForbidden();

    expect($pending->refresh()->status)->toBe('pending');
});

test('approval is captured by the cms audit middleware', function () {
    $admin = createAdminUser();
    [$user, $student, , $department] = createApprovalStudent();
    $subject = createApprovalSubject($department->id, 'AP206');
    $pending = createApprovalEnrollment($student->id, $subject->id);

    $this->actingAs($admin)
        ->post(route('cms.enrollments.approve'), ['enrollment_ids' => [$pending->id]])
        ->assertRedirect();

    $audit = CmsAuditLog::query()
        ->where('entity_type', 'enrollments')
        ->where('action', 'post')
        ->first();

    expect($audit)->not->toBeNull();
    expect($audit->user_id)->toBe($admin->id);
    expect($audit->new_values['enrollment_ids'])->toBe([$pending->id]);
});
