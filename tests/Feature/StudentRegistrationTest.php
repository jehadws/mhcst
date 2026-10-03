<?php

use App\Enums\UserRole;
use App\Mail\StudentRegistrationPendingMail;
use App\Mail\StudentWelcomeMail;
use App\Models\CmsApplication;
use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createRegistrationDeptAndLevel(): array
{
    $department = CmsDepartment::create(['name' => 'Reg Dept', 'description' => 'Registration test department']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);

    return [$department, $level];
}

function validRegistrationPayload(int $departmentId, int $levelId, array $overrides = []): array
{
    return array_merge([
        'name' => 'Ahmad Ali',
        'email' => 'ahmad.ali@test.com',
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
        'phone' => '0912345678',
        'gender' => 'male',
        'birth_date' => '2000-01-01',
        'city' => 'Tripoli',
        'address' => null,
        'department_id' => $departmentId,
        'level_id' => $levelId,
        'company' => '', // honeypot
    ], $overrides);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

test('registration page returns 200 with departments, levels, and admission state', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    [$department, $level] = createRegistrationDeptAndLevel();

    $response = $this->get(route('student.register'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/student/register', false) // page created in 5.4
            ->has('departments', 1)
            ->has('departments.0.levels', 1)
            ->has('admission')
            ->where('admission.open', true)
        );
});

test('happy path creates user, role, and submitted application — no student profile yet', function () {
    Mail::fake();
    Event::fake([Registered::class]);
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    [$department, $level] = createRegistrationDeptAndLevel();

    $response = $this->post(route('student.register.store'), validRegistrationPayload($department->id, $level->id));

    // Applicant lands on the "طلبي" status page right after registering.
    $response->assertRedirect(route('application.status'));

    $user = User::where('email', 'ahmad.ali@test.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->hasRole(UserRole::Student->value))->toBeTrue();

    // Applicant ≠ student: cms_students is only created at acceptance.
    expect(CmsStudent::count())->toBe(0);

    $application = CmsApplication::where('user_id', $user->id)->first();
    expect($application)->not->toBeNull()
        ->and($application->status)->toBe('submitted')
        ->and($application->level_id)->toBe($level->id)
        ->and($application->department_id)->toBe($department->id)
        ->and($application->submitted_at)->not->toBeNull()
        ->and($application->form_data['name'])->toBe('Ahmad Ali')
        ->and($application->form_data['phone'])->toBe('0912345678');

    Event::assertDispatched(Registered::class);

    // Notification emails are queued after the transaction commits
    Mail::assertQueued(StudentWelcomeMail::class);
    Mail::assertQueued(StudentRegistrationPendingMail::class);
});

test('registration logs the user in after successful signup', function () {
    Mail::fake();
    Event::fake([Registered::class]);
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    [$department, $level] = createRegistrationDeptAndLevel();

    $this->post(route('student.register.store'), validRegistrationPayload($department->id, $level->id));

    $this->assertAuthenticated();
});

test('duplicate email returns a 422', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    [$department, $level] = createRegistrationDeptAndLevel();
    User::factory()->create(['email' => 'ahmad.ali@test.com']);

    $response = $this->post(
        route('student.register.store'),
        validRegistrationPayload($department->id, $level->id)
    );

    $response->assertInvalid('email');
});

test('level that does not belong to the selected department returns a 422', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    [$department, $level] = createRegistrationDeptAndLevel();

    $otherDepartment = CmsDepartment::create(['name' => 'Other Dept', 'description' => 'Another department']);
    $otherLevel = CmsLevel::create(['department_id' => $otherDepartment->id, 'year' => 1, 'section' => 'B', 'capacity' => 30]);

    // Pass the other department but the original level (wrong pairing)
    $response = $this->post(
        route('student.register.store'),
        validRegistrationPayload($otherDepartment->id, $level->id)
    );

    $response->assertInvalid('level_id');
});

test('honeypot filled returns a 422', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    [$department, $level] = createRegistrationDeptAndLevel();

    $response = $this->post(
        route('student.register.store'),
        validRegistrationPayload($department->id, $level->id, ['company' => 'Bot Ltd'])
    );

    $response->assertInvalid('company');
});

test('mid-transaction failure rolls back user, application, and role', function () {
    Mail::fake();
    Event::fake([Registered::class]);
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    [$department, $level] = createRegistrationDeptAndLevel();

    CmsApplication::creating(function () {
        throw new RuntimeException('Simulated failure after user created.');
    });

    $this->post(route('student.register.store'), validRegistrationPayload($department->id, $level->id));

    expect(User::where('email', 'ahmad.ali@test.com')->exists())->toBeFalse()
        ->and(DB::table('model_has_roles')->where('role_id', '>', 0)->count())->toBe(0);
});

test('sixth registration attempt returns 429', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    // Empty payloads fail validation (302 redirect) but still pass through
    // the route's throttle middleware, so they fill the bucket.
    for ($i = 0; $i < 5; $i++) {
        $this->post(route('student.register.store'), [])->assertRedirect();
    }

    $this->post(route('student.register.store'), [])->assertStatus(429);
});

test('exhausting other throttle:5,1 routes does not consume the registration bucket', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    for ($i = 0; $i < 5; $i++) {
        $this->post(route('password.email'), ['email' => 'nonexistent@example.com'])->assertRedirect();
    }
    $this->post(route('password.email'), ['email' => 'nonexistent@example.com'])->assertStatus(429);

    // The registration route has its own bucket, so the first attempt here
    // must not be throttled even though the password-reset bucket is full.
    $this->post(route('student.register.store'), [])->assertRedirect();
});
