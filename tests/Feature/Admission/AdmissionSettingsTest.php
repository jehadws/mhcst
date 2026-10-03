<?php

use App\Enums\UserRole;
use App\Models\CmsApplication;
use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\CmsAcademicSettingsService;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function settingsDeptAndLevel(string $suffix = ''): array
{
    $department = CmsDepartment::create(['name' => 'Settings Dept'.$suffix, 'description' => 'Settings testing']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);

    return [$department, $level];
}

function settingsPayload(int $departmentId, int $levelId, string $email = 'settings.applicant@test.com'): array
{
    return [
        'name' => 'Anas Settings',
        'email' => $email,
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
        'phone' => '0912345678',
        'gender' => 'male',
        'birth_date' => '2002-05-05',
        'city' => 'Tripoli',
        'department_id' => $departmentId,
        'level_id' => $levelId,
        'company' => '',
    ];
}

function settingsRegisterApplicant(TestCase $testCase, array $payload): User
{
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $testCase->post(route('student.register.store'), $payload)->assertRedirect(route('application.status'));

    return User::where('email', $payload['email'])->firstOrFail();
}

// ─── Window gating ────────────────────────────────────────────────────────────

test('closing admission hides the registration form and blocks new submissions', function () {
    [$department, $level] = settingsDeptAndLevel();

    SiteSetting::updateOrCreate(['key' => 'cms.admission_open'], ['value' => '0', 'type' => 'boolean']);

    $service = app(CmsAcademicSettingsService::class);
    expect($service->admissionOpen())->toBeFalse();

    $this->get(route('student.register'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/student/register', false)
            ->where('admission.open', false)
            ->has('admission.message')
            ->has('departments', 0)
        );

    $this->post(route('student.register.store'), settingsPayload($department->id, $level->id))
        ->assertInvalid('admission');

    expect(User::where('email', 'settings.applicant@test.com')->exists())->toBeFalse()
        ->and(CmsApplication::count())->toBe(0);
});

test('an expired close date closes admission and a future open date keeps it closed', function () {
    [$department, $level] = settingsDeptAndLevel();
    $service = app(CmsAcademicSettingsService::class);

    SiteSetting::updateOrCreate(['key' => 'cms.admission_closes_at'], ['value' => now()->subDay()->toDateString(), 'type' => 'text']);
    expect($service->admissionOpen())->toBeFalse();

    SiteSetting::updateOrCreate(['key' => 'cms.admission_closes_at'], ['value' => '', 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'cms.admission_opens_at'], ['value' => now()->addDay()->toDateString(), 'type' => 'text']);
    expect($service->admissionOpen())->toBeFalse();

    SiteSetting::updateOrCreate(['key' => 'cms.admission_opens_at'], ['value' => now()->subDay()->toDateString(), 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'cms.admission_closes_at'], ['value' => now()->addDay()->toDateString(), 'type' => 'text']);
    expect($service->admissionOpen())->toBeTrue();
});

test('outside the allowed levels list the submission is rejected with a specific message', function () {
    Mail::fake();
    [$departmentA, $levelA] = settingsDeptAndLevel(' A');
    [$departmentB, $levelB] = settingsDeptAndLevel(' B');

    SiteSetting::updateOrCreate(
        ['key' => 'cms.admission_department_ids'],
        ['value' => json_encode([$departmentA->id]), 'type' => 'json']
    );
    SiteSetting::updateOrCreate(
        ['key' => 'cms.admission_level_ids'],
        ['value' => json_encode([$levelA->id]), 'type' => 'json']
    );

    // Registration page shows only the allowed department.
    $this->get(route('student.register'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/student/register', false)
            ->has('departments', 1)
            ->where('departments.0.id', $departmentA->id)
        );

    // Submitting for another level is rejected server-side.
    $this->post(route('student.register.store'), settingsPayload($departmentB->id, $levelB->id))
        ->assertInvalid('level_id');

    expect(User::where('email', 'settings.applicant@test.com')->exists())->toBeFalse();

    // Submitting for an allowed level still works.
    settingsRegisterApplicant($this, settingsPayload($departmentA->id, $levelA->id, 'allowed.settings@test.com'));

    expect(CmsApplication::where('user_id', User::where('email', 'allowed.settings@test.com')->value('id'))->first()->status)
        ->toBe('submitted');
});

test('admission settings page persists the new admission fields', function () {
    [$departmentA] = settingsDeptAndLevel(' A');
    [$departmentB] = settingsDeptAndLevel(' B');
    $admin = createAdminUser();

    $opens = now()->addDays(2)->toDateString();
    $closes = now()->addDays(30)->toDateString();

    $this->actingAs($admin)->put(route('cms.settings.update'), [
        'admission_open' => false,
        'admission_opens_at' => $opens,
        'admission_closes_at' => $closes,
        'admission_department_ids' => [$departmentA->id, $departmentB->id],
        'admission_level_ids' => [],
    ])->assertRedirect(route('cms.settings.edit'));

    expect(SiteSetting::get('cms.admission_open'))->toBeFalse()
        ->and(SiteSetting::get('cms.admission_opens_at'))->toBe($opens)
        ->and(SiteSetting::get('cms.admission_closes_at'))->toBe($closes)
        ->and(SiteSetting::get('cms.admission_department_ids'))->toBe([$departmentA->id, $departmentB->id])
        ->and(SiteSetting::get('cms.admission_level_ids'))->toBe([])
        ->and(app(CmsAcademicSettingsService::class)->admissionOpen())->toBeFalse();

    // The settings page renders the persisted state back to the admin.
    $this->get(route('cms.settings.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/settings/index', false)
            ->where('settings.admission_open', false)
            ->where('settings.admission_is_open', false)
            ->has('departments', 2)
        );
});

test('the invalid admission date pair is rejected by validation', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)
        ->from(route('cms.settings.edit'))
        ->put(route('cms.settings.update'), [
            'admission_open' => true,
            'admission_opens_at' => '2026-10-10',
            'admission_closes_at' => '2026-10-01',
        ])
        ->assertSessionHasErrors('admission_closes_at');
});

test('admission is open by default with no settings configured', function () {
    expect(app(CmsAcademicSettingsService::class)->admissionOpen())->toBeTrue()
        ->and(app(CmsAcademicSettingsService::class)->allowedDepartmentIds())->toBeNull()
        ->and(app(CmsAcademicSettingsService::class)->allowedLevelIds())->toBeNull();
});

test('the settings page widens a department-only admission restriction into level ids', function () {
    [$departmentA, $levelA] = settingsDeptAndLevel(' A');
    [$departmentB, $levelB] = settingsDeptAndLevel(' B');

    // Legacy configuration: departments restricted, level list empty.
    SiteSetting::updateOrCreate(
        ['key' => 'cms.admission_department_ids'],
        ['value' => json_encode([$departmentA->id]), 'type' => 'json']
    );

    $admin = createAdminUser();

    $this->actingAs($admin)->get(route('cms.settings.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/settings/index', false)
            ->where('settings.admission_department_ids', [])
            ->where('settings.admission_level_ids', [$levelA->id])
            ->has('academicYearOptions')
        );

    expect($levelB->id)->not->toBe($levelA->id);
});

test('the settings page drops stale admission level ids so the next save passes validation', function () {
    [$department, $level] = settingsDeptAndLevel();
    $admin = createAdminUser();

    SiteSetting::updateOrCreate(
        ['key' => 'cms.admission_level_ids'],
        ['value' => json_encode([$level->id, $level->id + 99999]), 'type' => 'json']
    );

    $level->delete();

    $this->actingAs($admin)->get(route('cms.settings.edit'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('settings.admission_level_ids', []));
});
