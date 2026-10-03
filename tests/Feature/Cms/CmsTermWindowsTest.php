<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTerm;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\CmsAcademicSettingsService;
use Spatie\Permission\Models\Role;

/**
 * Phase 3 — real terms and dated registration windows. Every test runs
 * against the legacy settings-only fallback too: without an active term
 * row the window behaves exactly as in phase 1.
 */
function activateTerm(string $year, string $semester, ?string $startsAt = null, ?string $endsAt = null, ?string $addDropDeadline = null): CmsTerm
{
    app(CmsAcademicSettingsService::class)->updateSettings([
        'grades_locked' => false,
        'academic_year' => $year,
        'current_semester' => $semester,
        'subject_registration_open' => true,
        'consecutive_absence_threshold' => 3,
        'absence_rate_threshold' => 20,
        'registration_starts_at' => $startsAt,
        'registration_ends_at' => $endsAt,
        'add_drop_deadline' => $addDropDeadline,
    ]);

    return CmsTerm::query()->where('is_active', true)->firstOrFail();
}

function windowTestStudent(): array
{
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $department = CmsDepartment::create(['name' => 'Term Dept', 'description' => 'Terms']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);

    $student = CmsStudent::create([
        'user_id' => $user->id,
        'student_no' => 'TERM-0001',
        'name' => 'Term Student',
        'email' => 'term-student@test.com',
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    return [$user, $student, $level, $department];
}

function windowTestSubject(int $departmentId, string $code): CmsSubject
{
    return CmsSubject::create([
        'department_id' => $departmentId,
        'code' => $code,
        'name' => "Subject {$code}",
        'credits' => 3,
        'semester' => 'first',
    ]);
}

test('saving academic settings upserts the matching term and activates it with its window', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)->put('/cms/settings', [
        'grades_locked' => false,
        'academic_year' => '2026-2027',
        'current_semester' => 'first',
        'subject_registration_open' => true,
        'consecutive_absence_threshold' => 3,
        'absence_rate_threshold' => 20,
        'registration_starts_at' => '2026-10-01',
        'registration_ends_at' => '2026-10-20',
        'add_drop_deadline' => '2026-10-10',
    ])->assertRedirect('/cms/settings');

    $term = CmsTerm::query()->where('academic_year', '2026-2027')->where('semester', 'first')->first();

    expect($term)->not->toBeNull();
    expect($term->is_active)->toBeTrue();
    expect($term->registration_starts_at->toDateString())->toBe('2026-10-01');
    expect($term->registration_ends_at->toDateString())->toBe('2026-10-20');
    expect($term->add_drop_deadline->toDateString())->toBe('2026-10-10');

    $settings = app(CmsAcademicSettingsService::class)->settings();

    expect($settings['registration_starts_at'])->toBe('2026-10-01');
    expect($settings['registration_ends_at'])->toBe('2026-10-20');
    expect($settings['add_drop_deadline'])->toBe('2026-10-10');
});

test('activating a second term deactivates the previous one — exactly one active', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)->put('/cms/settings', [
        'grades_locked' => false,
        'academic_year' => '2026-2027',
        'current_semester' => 'first',
        'subject_registration_open' => true,
        'consecutive_absence_threshold' => 3,
        'absence_rate_threshold' => 20,
    ])->assertRedirect('/cms/settings');

    expect(CmsTerm::query()->where('is_active', true)->count())->toBe(1);

    $this->actingAs($admin)->put('/cms/settings', [
        'grades_locked' => false,
        'academic_year' => '2026-2027',
        'current_semester' => 'second',
        'subject_registration_open' => true,
        'consecutive_absence_threshold' => 3,
        'absence_rate_threshold' => 20,
    ])->assertRedirect('/cms/settings');

    expect(CmsTerm::query()->where('is_active', true)->count())->toBe(1);

    $active = CmsTerm::query()->where('is_active', true)->first();

    expect($active->semester)->toBe('second');
    expect(CmsTerm::query()->count())->toBe(2);

    // Re-saving the same pair reuses its row instead of duplicating it.
    activateTerm('2026-2027', 'second');

    expect(CmsTerm::query()->where('academic_year', '2026-2027')->where('semester', 'second')->count())->toBe(1);
});

test('currentTerm prefers the active term row over the legacy settings pair', function () {
    activateTerm('2026-2027', 'second');

    $settings = app(CmsAcademicSettingsService::class);

    expect($settings->currentTerm())->toBe(['academic_year' => '2026-2027', 'semester' => 'second']);

    // Stale settings keys must not win once a real term is active.
    SiteSetting::updateOrCreate(['key' => 'cms.academic_year'], ['value' => '2020-2021', 'type' => 'text']);

    expect($settings->currentTerm())->toBe(['academic_year' => '2026-2027', 'semester' => 'second']);
});

test('registration is blocked before the term window starts and says when it opens', function () {
    [$user, , , $department] = windowTestStudent();
    activateTerm('2026-2027', 'first', now()->addDays(3)->toDateString(), now()->addDays(20)->toDateString());
    $subject = windowTestSubject($department->id, 'W101');

    $this->actingAs($user)->get(route('dashboard.subject-registration.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('registration_window.open', false)
            ->where('registration_window.reason', 'not_started')
            ->where('registration_window.starts_at', now()->addDays(3)->toDateString())
        );

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertSessionHasErrors('subject_ids');

    expect(CmsEnrollment::count())->toBe(0);
});

test('registration works inside the term window and stamps term_id', function () {
    [$user, $student, , $department] = windowTestStudent();
    $term = activateTerm('2026-2027', 'first', now()->subDays(2)->toDateString(), now()->addDays(20)->toDateString());
    $subject = windowTestSubject($department->id, 'W102');

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertRedirect();

    $enrollment = CmsEnrollment::query()->where('student_id', $student->id)->firstOrFail();

    expect($enrollment->term_id)->toBe($term->id);
    expect($enrollment->status)->toBe('pending');
});

test('registration is blocked after the term window ends', function () {
    [$user, , , $department] = windowTestStudent();
    activateTerm('2026-2027', 'first', now()->subDays(30)->toDateString(), now()->subDays(5)->toDateString());
    $subject = windowTestSubject($department->id, 'W103');

    $this->actingAs($user)->get(route('dashboard.subject-registration.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('registration_window.open', false)
            ->where('registration_window.reason', 'ended')
        );

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertSessionHasErrors('subject_ids');

    expect(CmsEnrollment::count())->toBe(0);
});

test('the emergency kill-switch closes the window even with valid dates', function () {
    [$user, , , $department] = windowTestStudent();
    activateTerm('2026-2027', 'first', now()->subDay()->toDateString(), now()->addDays(20)->toDateString());
    SiteSetting::updateOrCreate(['key' => 'cms.subject_registration_open'], ['value' => '0', 'type' => 'boolean']);
    $subject = windowTestSubject($department->id, 'W104');

    $this->actingAs($user)->get(route('dashboard.subject-registration.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('registration_window.open', false)
            ->where('registration_window.reason', 'closed_switch')
        );

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertSessionHasErrors('subject_ids');

    expect(CmsEnrollment::count())->toBe(0);
});

test('an active term without dates keeps the legacy always-open behaviour', function () {
    [$user, , , $department] = windowTestStudent();
    activateTerm('2026-2027', 'first');
    $subject = windowTestSubject($department->id, 'W105');

    $this->actingAs($user)->get(route('dashboard.subject-registration.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('registration_window.open', true)
            ->where('registration_window.reason', null)
            ->where('registration_window.starts_at', null)
        );

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertRedirect();

    expect(CmsEnrollment::count())->toBe(1);
});

test('approvals are refused outside the dated window but work inside it', function () {
    [$user, $student, , $department] = windowTestStudent();
    $subject = windowTestSubject($department->id, 'W106');

    $enrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'pending',
        'source' => 'self',
    ]);

    $admin = createAdminUser();

    // Ended window: the approval endpoint refuses and flips nothing.
    activateTerm('2026-2027', 'first', now()->subDays(10)->toDateString(), now()->subDays(2)->toDateString());

    $this->actingAs($admin)
        ->post(route('cms.enrollments.approve'), ['enrollment_ids' => [$enrollment->id]])
        ->assertRedirect()
        ->assertSessionHasErrors();

    expect($enrollment->refresh()->status)->toBe('pending');

    // Open window: the same pick is approved.
    activateTerm('2026-2027', 'first', now()->subDay()->toDateString(), now()->addDays(10)->toDateString());

    $this->actingAs($admin)
        ->post(route('cms.enrollments.approve'), ['enrollment_ids' => [$enrollment->id]])
        ->assertRedirect();

    expect($enrollment->refresh()->status)->toBe('active');
});

test('approvals still work without any active term (pre-terms rows)', function () {
    [$user, $student, , $department] = windowTestStudent();
    $subject = windowTestSubject($department->id, 'W107');

    $enrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'pending',
        'source' => 'self',
    ]);

    $admin = createAdminUser();

    $this->actingAs($admin)
        ->post(route('cms.enrollments.approve'), ['enrollment_ids' => [$enrollment->id]])
        ->assertRedirect();

    expect($enrollment->refresh()->status)->toBe('active');
});

test('settings validation rejects a malformed academic year', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)->put('/cms/settings', [
        'grades_locked' => false,
        'academic_year' => '2025/26',
        'subject_registration_open' => true,
        'consecutive_absence_threshold' => 3,
        'absence_rate_threshold' => 20,
    ])->assertSessionHasErrors('academic_year');
});

test('settings validation rejects an add/drop deadline outside the semester', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)->put('/cms/settings', [
        'grades_locked' => false,
        'academic_year' => '2026-2027',
        'current_semester' => 'first',
        'semester_start' => '2026-09-01',
        'semester_end' => '2027-01-15',
        'registration_starts_at' => '2026-09-01',
        'add_drop_deadline' => '2027-02-01',
        'subject_registration_open' => true,
        'consecutive_absence_threshold' => 3,
        'absence_rate_threshold' => 20,
    ])->assertSessionHasErrors('add_drop_deadline');
});

test('an add/drop deadline inside the semester saves and activates the term', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)->put('/cms/settings', [
        'grades_locked' => false,
        'academic_year' => '2026-2027',
        'current_semester' => 'first',
        'semester_start' => '2026-09-01',
        'semester_end' => '2027-01-15',
        'registration_starts_at' => '2026-09-01',
        'add_drop_deadline' => '2026-09-20',
        'subject_registration_open' => true,
        'consecutive_absence_threshold' => 3,
        'absence_rate_threshold' => 20,
    ])->assertRedirect('/cms/settings');

    $term = CmsTerm::query()->where('academic_year', '2026-2027')->where('semester', 'first')->firstOrFail();

    expect($term->is_active)->toBeTrue()
        ->and($term->add_drop_deadline->toDateString())->toBe('2026-09-20');
});
