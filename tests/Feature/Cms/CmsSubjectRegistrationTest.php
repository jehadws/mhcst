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
use App\Services\CmsAcademicSettingsService;
use App\Services\CmsSubjectRegistrationService;
use Spatie\Permission\Models\Role;

function createRegistrationStudent(string $status = 'active'): array
{
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $department = CmsDepartment::create(['name' => 'Registration Dept', 'description' => 'Registration']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 2, 'section' => 'A', 'capacity' => 30]);

    $student = CmsStudent::create([
        'user_id' => $user->id,
        'student_no' => 'REG-0001',
        'name' => 'Registration Student',
        'email' => 'registration-student@test.com',
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => $status,
    ]);

    return [$user, $student, $level, $department];
}

function createRegistrationSubject(int $departmentId, string $code, string $semester = 'first', int $credits = 3): CmsSubject
{
    return CmsSubject::create([
        'department_id' => $departmentId,
        'code' => $code,
        'name' => "Subject {$code}",
        'credits' => $credits,
        'semester' => $semester,
    ]);
}

function setRegistrationTerm(string $year = '2026-2027', string $semester = 'first'): void
{
    SiteSetting::updateOrCreate(['key' => 'cms.academic_year'], ['value' => $year, 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'cms.current_semester'], ['value' => $semester, 'type' => 'text']);
}

test('active student registers subjects and they land as pending', function () {
    [$user, $student, , $department] = createRegistrationStudent();
    setRegistrationTerm();
    $subjectA = createRegistrationSubject($department->id, 'R101');
    $subjectB = createRegistrationSubject($department->id, 'R102');

    $response = $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subjectA->id, $subjectB->id]]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $enrollments = CmsEnrollment::query()->where('student_id', $student->id)->get();
    expect($enrollments)->toHaveCount(2);
    expect($enrollments->every(fn ($enrollment) => $enrollment->status === 'pending'))->toBeTrue();
    expect($enrollments->every(fn ($enrollment) => $enrollment->source === 'self'))->toBeTrue();
    expect($enrollments->every(fn ($enrollment) => $enrollment->academic_year === '2026-2027'))->toBeTrue();
    expect($enrollments->every(fn ($enrollment) => $enrollment->semester === 'first'))->toBeTrue();
    expect($enrollments->every(fn ($enrollment) => $enrollment->enrollment_date->isToday()))->toBeTrue();
});

test('subject from another department is rejected', function () {
    [$user] = createRegistrationStudent();
    setRegistrationTerm();
    $otherDepartment = CmsDepartment::create(['name' => 'Other Dept', 'description' => 'Other']);
    $foreignSubject = createRegistrationSubject($otherDepartment->id, 'X999');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$foreignSubject->id]])
        ->assertSessionHasErrors('subject_ids');

    expect(CmsEnrollment::count())->toBe(0);
});

test('subject offered in another semester is rejected', function () {
    [$user, , , $department] = createRegistrationStudent();
    setRegistrationTerm('2026-2027', 'first');
    $subject = createRegistrationSubject($department->id, 'S201', 'second');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertSessionHasErrors('subject_ids');

    expect(CmsEnrollment::count())->toBe(0);
});

test('already enrolled subject is rejected and nothing is created', function () {
    [$user, $student, , $department] = createRegistrationStudent();
    setRegistrationTerm();
    $subject = createRegistrationSubject($department->id, 'R301');

    $existing = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertSessionHasErrors('subject_ids');

    expect(CmsEnrollment::count())->toBe(1);
    expect($existing->refresh()->status)->toBe('active');
});

test('suspended student cannot register subjects', function () {
    [$user, , , $department] = createRegistrationStudent('suspended');
    setRegistrationTerm();
    $subject = createRegistrationSubject($department->id, 'R801');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertForbidden();

    expect(CmsEnrollment::count())->toBe(0);
});

test('teacher role is blocked by the student gate', function () {
    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);

    $teacher = User::factory()->create();
    $teacher->assignRole(UserRole::Teacher->value);

    $this->actingAs($teacher)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [1]])
        ->assertForbidden();
});

test('subject registration requires authentication', function () {
    $this->post(route('dashboard.subject-registration.store'), ['subject_ids' => [1]])
        ->assertRedirect('/login');
});

test('missing or duplicated subject ids fail validation', function () {
    [$user, , , $department] = createRegistrationStudent();
    setRegistrationTerm();
    $subject = createRegistrationSubject($department->id, 'R401');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => []])
        ->assertSessionHasErrors('subject_ids');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id, $subject->id]])
        ->assertSessionHasErrors();

    expect(CmsEnrollment::count())->toBe(0);
});

test('closed registration window rejects submissions', function () {
    [$user, , , $department] = createRegistrationStudent();
    setRegistrationTerm();
    SiteSetting::updateOrCreate(['key' => 'cms.subject_registration_open'], ['value' => '0', 'type' => 'boolean']);
    $subject = createRegistrationSubject($department->id, 'R901');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertSessionHasErrors('subject_ids');

    expect(CmsEnrollment::count())->toBe(0);
});

test('registration without configured academic term is rejected', function () {
    [$user, , , $department] = createRegistrationStudent();
    $subject = createRegistrationSubject($department->id, 'R501');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertSessionHasErrors('subject_ids');

    expect(CmsEnrollment::count())->toBe(0);
});

test('a withdrawn pick for the same term is re-opened instead of duplicated', function () {
    [$user, $student, , $department] = createRegistrationStudent();
    setRegistrationTerm();
    $subject = createRegistrationSubject($department->id, 'R601');

    $rejected = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'withdrawn',
        'source' => 'admin',
    ]);

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertRedirect();

    expect(CmsEnrollment::count())->toBe(1);
    expect($rejected->refresh()->status)->toBe('pending');
    expect($rejected->source)->toBe('self');
});

test('successful registration writes an audit log entry', function () {
    [$user] = createRegistrationStudent();
    setRegistrationTerm();
    $subjectA = createRegistrationSubject(1, 'R701');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subjectA->id]])
        ->assertRedirect();

    $audit = CmsAuditLog::query()->where('entity_type', 'enrollments')->first();

    expect($audit)->not->toBeNull();
    expect($audit->user_id)->toBe($user->id);
    expect($audit->action)->toBe('post');
    expect($audit->new_values['subject_ids'])->toBe([$subjectA->id]);
    expect($audit->new_values['academic_year'])->toBe('2026-2027');
});

test('available subjects exclude blocked enrollments and keep withdrawn picks', function () {
    [$user, $student, , $department] = createRegistrationStudent();
    setRegistrationTerm();

    $activeSubject = createRegistrationSubject($department->id, 'A100');
    $withdrawnSubject = createRegistrationSubject($department->id, 'A200');
    $otherSemesterSubject = createRegistrationSubject($department->id, 'A300', 'second');

    CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $activeSubject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $withdrawnSubject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'withdrawn',
        'source' => 'admin',
    ]);

    $available = app(CmsSubjectRegistrationService::class)->availableFor($student);

    expect($available->pluck('code')->all())->toBe(['A200']);
});

test('enrollments from a previous term do not block current-term registration', function () {
    [$user, $student, , $department] = createRegistrationStudent();
    setRegistrationTerm('2026-2027', 'second');
    $subject = createRegistrationSubject($department->id, 'T101', 'second');

    CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    expect(app(CmsSubjectRegistrationService::class)->availableFor($student)->pluck('code')->all())->toBe(['T101']);

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertRedirect();

    expect(CmsEnrollment::query()
        ->where('student_id', $student->id)
        ->where('subject_id', $subject->id)
        ->where('academic_year', '2026-2027')
        ->where('semester', 'second')
        ->where('status', 'pending')
        ->count())->toBe(1);
});

test('a completed course from a previous term can be registered again for a retake', function () {
    [$user, $student, , $department] = createRegistrationStudent();
    setRegistrationTerm('2026-2027', 'second');
    $subject = createRegistrationSubject($department->id, 'T102', 'second');

    CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2025-2026',
        'semester' => 'second',
        'enrollment_date' => now(),
        'status' => 'completed',
    ]);

    expect(app(CmsSubjectRegistrationService::class)->availableFor($student)->pluck('code')->all())->toBe(['T102']);

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertRedirect();

    expect(CmsEnrollment::query()->where('student_id', $student->id)->count())->toBe(2);
});

test('subjects stay hidden when the current term is only partially configured', function () {
    [$user, $student, , $department] = createRegistrationStudent();
    setRegistrationTerm('', 'second');
    createRegistrationSubject($department->id, 'T103', 'second');

    expect(app(CmsSubjectRegistrationService::class)->availableFor($student))->toBeEmpty();
});

test('academic settings page controls the registration window', function () {
    $admin = createAdminUser();
    [$user, $student, , $department] = createRegistrationStudent();
    $subject = createRegistrationSubject($department->id, 'R851');

    $this->actingAs($admin)->put('/cms/settings', [
        'grades_locked' => false,
        'academic_year' => '2026-2027',
        'current_semester' => 'first',
        'subject_registration_open' => true,
        'consecutive_absence_threshold' => 3,
        'absence_rate_threshold' => 20,
    ])->assertRedirect('/cms/settings');

    expect(SiteSetting::get('cms.current_semester'))->toBe('first');
    expect(app(CmsAcademicSettingsService::class)->subjectRegistrationOpen())->toBeTrue();

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertRedirect();

    expect(CmsEnrollment::where('student_id', $student->id)->count())->toBe(1);

    $this->actingAs($admin)->put('/cms/settings', [
        'grades_locked' => false,
        'academic_year' => '2026-2027',
        'current_semester' => 'first',
        'subject_registration_open' => false,
        'consecutive_absence_threshold' => 3,
        'absence_rate_threshold' => 20,
    ])->assertRedirect('/cms/settings');

    expect(app(CmsAcademicSettingsService::class)->subjectRegistrationOpen())->toBeFalse();

    $freshSubject = createRegistrationSubject($department->id, 'R852');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$freshSubject->id]])
        ->assertSessionHasErrors('subject_ids');

    expect(CmsEnrollment::where('subject_id', $freshSubject->id)->count())->toBe(0);
});

test('subject registration page shows available subjects and term for the student', function () {
    [$user, , , $department] = createRegistrationStudent();
    setRegistrationTerm('2026-2027', 'first');
    createRegistrationSubject($department->id, 'P101');
    createRegistrationSubject($department->id, 'P102', 'first', 4);

    $otherDepartment = CmsDepartment::create(['name' => 'Other Registration Dept', 'description' => 'Other']);
    createRegistrationSubject($otherDepartment->id, 'X100');

    $this->actingAs($user)->get(route('dashboard.subject-registration.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/subject-registration')
            ->has('subjects', 2)
            ->where('subjects.0.code', 'P101')
            ->where('subjects.1.code', 'P102')
            ->where('subjects.1.credits', 4)
            ->where('term.academic_year', '2026-2027')
            ->where('term.semester', 'first')
            ->where('registration_window.open', true)
            ->where('registration_window.student_active', true)
        );
});

test('subject registration page lists current term registrations with status', function () {
    [$user, $student, , $department] = createRegistrationStudent();
    setRegistrationTerm();
    $subject = createRegistrationSubject($department->id, 'P201');

    $enrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'pending',
        'source' => 'self',
    ]);

    $this->actingAs($user)->get(route('dashboard.subject-registration.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('registrations.0.id', $enrollment->id)
            ->where('registrations.0.status', 'pending')
            ->where('registrations.0.subject.code', 'P201')
            ->has('subjects', 0)
        );
});

test('non-active student sees blocked registration window flag', function () {
    [$user] = createRegistrationStudent('suspended');
    setRegistrationTerm();

    $this->actingAs($user)->get(route('dashboard.subject-registration.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('registration_window.student_active', false)
        );
});

test('closed registration window flag is exposed on the page', function () {
    [$user, , , $department] = createRegistrationStudent();
    setRegistrationTerm();
    SiteSetting::updateOrCreate(['key' => 'cms.subject_registration_open'], ['value' => '0', 'type' => 'text']);

    $this->actingAs($user)->get(route('dashboard.subject-registration.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('registration_window.open', false)
        );
});

test('teacher cannot open the subject registration page', function () {
    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);

    $teacher = User::factory()->create();
    $teacher->assignRole(UserRole::Teacher->value);

    $this->actingAs($teacher)->get(route('dashboard.subject-registration.index'))->assertForbidden();
});

test('subject registration page requires authentication', function () {
    $this->get(route('dashboard.subject-registration.index'))->assertRedirect('/login');
});

test('open window stays blocked until the academic year is configured', function () {
    [$user, $student, , $department] = createRegistrationStudent();
    setRegistrationTerm('', 'first');
    $subject = createRegistrationSubject($department->id, 'Y101');

    $this->actingAs($user)->get(route('dashboard.subject-registration.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/subject-registration')
            ->where('registration_window.open', true)
            ->where('registration_window.student_active', true)
            ->where('term.academic_year', null)
            ->where('term.semester', 'first')
        );

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertSessionHasErrors('subject_ids');
    expect(CmsEnrollment::count())->toBe(0);

    setRegistrationTerm('2025-2026', 'first');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertRedirect();

    $this->assertDatabaseHas('cms_enrollments', [
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'status' => 'pending',
        'source' => 'self',
    ]);
});
