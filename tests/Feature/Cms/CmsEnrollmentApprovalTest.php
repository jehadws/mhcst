<?php

use App\Enums\UserRole;
use App\Models\CmsAuditLog;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\NotificationsLog;
use App\Models\NotificationTemplate;
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

test('approving a registration emails the student and records the notification', function () {
    $admin = createAdminUser();
    [$user, $student, , $department] = createApprovalStudent();
    $subject = createApprovalSubject($department->id, 'AP301');
    $pending = createApprovalEnrollment($student->id, $subject->id);

    $template = NotificationTemplate::factory()->create([
        'trigger_event' => 'registration.approved',
        'channel' => 'email',
        'subject' => 'Approved {student_name} — {subject_name}',
        'body' => '{student_name} approved for {subject_name} during {academic_year}, {semester}',
    ]);

    $this->actingAs($admin)
        ->post(route('cms.enrollments.approve'), ['enrollment_ids' => [$pending->id]])
        ->assertRedirect(route('cms.enrollments.index'));

    expect($pending->refresh()->status)->toBe('active');

    $log = NotificationsLog::query()->sole();
    expect($log->recipient)->toBe('approval-student@test.com');
    expect($log->channel)->toBe('email');
    expect($log->template_id)->toBe($template->id);
    expect($log->status)->toBe('sent');
    expect($log->sent_at)->not->toBeNull();
});

test('rejecting a registration emails the student and records the notification', function () {
    $admin = createAdminUser();
    [$user, $student, , $department] = createApprovalStudent();
    $subject = createApprovalSubject($department->id, 'AP302');
    $pending = createApprovalEnrollment($student->id, $subject->id);

    NotificationTemplate::factory()->create([
        'trigger_event' => 'registration.rejected',
        'channel' => 'email',
        'subject' => 'Rejected {subject_name}',
        'body' => 'Sorry {student_name}, {subject_name} was not approved.',
    ]);

    $this->actingAs($admin)
        ->post(route('cms.enrollments.reject', $pending))
        ->assertRedirect(route('cms.enrollments.index'));

    expect($pending->refresh()->status)->toBe('withdrawn');
    expect(NotificationsLog::count())->toBe(1);
    expect(NotificationsLog::query()->sole()->recipient)->toBe('approval-student@test.com');
});

test('approval still succeeds when no notification template exists', function () {
    $admin = createAdminUser();
    [$user, $student, , $department] = createApprovalStudent();
    $subject = createApprovalSubject($department->id, 'AP303');
    $pending = createApprovalEnrollment($student->id, $subject->id);

    $this->actingAs($admin)
        ->post(route('cms.enrollments.approve'), ['enrollment_ids' => [$pending->id]])
        ->assertRedirect(route('cms.enrollments.index'));

    expect($pending->refresh()->status)->toBe('active');
    expect(NotificationsLog::count())->toBe(0);
});

test('bulk approval emails only the registrations that were actually flipped', function () {
    $admin = createAdminUser();
    [$user, $student, , $department] = createApprovalStudent();
    $subjectA = createApprovalSubject($department->id, 'AP304');
    $subjectB = createApprovalSubject($department->id, 'AP305');
    $pending = createApprovalEnrollment($student->id, $subjectA->id);
    $completed = createApprovalEnrollment($student->id, $subjectB->id, 'completed', 'admin');

    NotificationTemplate::factory()->create([
        'trigger_event' => 'registration.approved',
        'channel' => 'email',
        'subject' => 'Approved {student_name} — {subject_name}',
        'body' => '{student_name} approved for {subject_name}',
    ]);

    $this->actingAs($admin)
        ->post(route('cms.enrollments.approve'), ['enrollment_ids' => [$pending->id, $completed->id]])
        ->assertRedirect(route('cms.enrollments.index'));

    expect($completed->refresh()->status)->toBe('completed');
    expect(NotificationsLog::count())->toBe(1);
});

test('notification is skipped when the student has no email on file', function () {
    $admin = createAdminUser();
    [$user, $student, , $department] = createApprovalStudent();
    $subject = createApprovalSubject($department->id, 'AP306');
    $pending = createApprovalEnrollment($student->id, $subject->id);
    $student->update(['email' => null]);

    NotificationTemplate::factory()->create([
        'trigger_event' => 'registration.approved',
        'channel' => 'email',
        'subject' => 'Approved {student_name} — {subject_name}',
        'body' => '{student_name} approved for {subject_name}',
    ]);

    $this->actingAs($admin)
        ->post(route('cms.enrollments.approve'), ['enrollment_ids' => [$pending->id]])
        ->assertRedirect(route('cms.enrollments.index'));

    expect($pending->refresh()->status)->toBe('active');
    expect(NotificationsLog::count())->toBe(0);
});
