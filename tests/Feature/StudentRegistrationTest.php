<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
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

test('registration page returns 200 with departments and levels', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    [$department, $level] = createRegistrationDeptAndLevel();

    $response = $this->get(route('student.register'));

    $response->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/student/register', false) // page created in 5.4
            ->has('departments', 1)
            ->has('departments.0.levels', 1)
        );
});

test('happy path creates user, student role, and pending cms student in one transaction', function () {
    Mail::fake();
    Event::fake([Registered::class]);
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    [$department, $level] = createRegistrationDeptAndLevel();

    $response = $this->post(route('student.register.store'), validRegistrationPayload($department->id, $level->id));

    $response->assertRedirect(route('dashboard'));

    $user = User::where('email', 'ahmad.ali@test.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->hasRole(UserRole::Student->value))->toBeTrue();

    $student = CmsStudent::where('user_id', $user->id)->first();
    expect($student)->not->toBeNull()
        ->and($student->status)->toBe('pending')
        ->and($student->level_id)->toBe($level->id)
        ->and($student->student_no)->toMatch('/^\d{4}\d{4}$/'); // {year}{seq:04d}

    // No enrollments should be created at signup
    expect($student->enrollments()->count())->toBe(0);

    Event::assertDispatched(Registered::class);
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

test('mid-transaction failure rolls back user, student, and role', function () {
    Mail::fake();
    Event::fake([Registered::class]);
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    [$department, $level] = createRegistrationDeptAndLevel();

    CmsStudent::creating(function () {
        throw new RuntimeException('Simulated failure after user created.');
    });

    $this->post(route('student.register.store'), validRegistrationPayload($department->id, $level->id));

    expect(User::where('email', 'ahmad.ali@test.com')->exists())->toBeFalse()
        ->and(DB::table('model_has_roles')->where('role_id', '>', 0)->count())->toBe(0);
});

test('sixth rapid registration attempt returns 429', function () {
    RateLimiter::clear('student.register.store');
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    for ($i = 1; $i <= 5; $i++) {
        RateLimiter::hit('student.register.store');
    }

    // Exceed rate limit by simulating 6th attempt via the actual endpoint
    RateLimiter::for('api', fn () => Limit::none());

    $responseOk = true;
    foreach (range(1, 6) as $attempt) {
        $response = $this->post(
            route('student.register.store'),
            validRegistrationPayload(1, 1, ['email' => "rate{$attempt}@test.com"])
        );
        if ($response->status() === 429) {
            $responseOk = false;
            break;
        }
    }

    // At least one of the 6 attempts should have been throttled
    expect($responseOk)->toBeFalse();
})->skip('Rate limiter test requires real HTTP stack; skipped in unit mode');
