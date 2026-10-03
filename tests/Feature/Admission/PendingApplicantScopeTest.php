<?php

use App\Enums\UserRole;
use App\Models\CmsApplication;
use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scopeDeptAndLevel(): array
{
    $department = CmsDepartment::create(['name' => 'Scope Dept', 'description' => 'Scope testing']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);

    return [$department, $level];
}

function scopePayload(int $departmentId, int $levelId): array
{
    return [
        'name' => 'Nour Scope',
        'email' => 'nour.scope@test.com',
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
        'phone' => '0912345678',
        'gender' => 'female',
        'birth_date' => '2002-05-05',
        'city' => 'Tripoli',
        'department_id' => $departmentId,
        'level_id' => $levelId,
        'company' => '',
    ];
}

function scopeRegisterApplicant(TestCase $testCase, array $payload): User
{
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $testCase->post(route('student.register.store'), $payload)->assertRedirect(route('application.status'));

    return User::where('email', $payload['email'])->firstOrFail();
}

// ─── The route matrix ─────────────────────────────────────────────────────────

test('pending applicant sees the dashboard and طلبي, and nothing else', function () {
    Mail::fake();
    Event::fake([Registered::class]);
    [$department, $level] = scopeDeptAndLevel();

    $applicant = scopeRegisterApplicant($this, scopePayload($department->id, $level->id));

    expect(CmsApplication::where('user_id', $applicant->id)->first()->status)->toBe('submitted');

    // Dashboard and the application status page are reachable.
    $this->actingAs($applicant)->get(route('dashboard'))->assertOk();
    $this->get(route('application.status'))->assertOk();

    // Student features bounce to the status page.
    foreach (['dashboard.my-courses', 'dashboard.my-schedule', 'dashboard.my-grades', 'dashboard.my-transcript', 'dashboard.subject-registration.index'] as $routeName) {
        $this->get(route($routeName))->assertRedirect(route('application.status'));
    }

    // Writes are gated too, not just reads.
    $this->post(route('dashboard.subject-registration.store'), ['subject_id' => 1])
        ->assertRedirect(route('application.status'));
});

test('accepted student reaches the student features', function () {
    Mail::fake();
    [$department, $level] = scopeDeptAndLevel();
    $applicant = scopeRegisterApplicant($this, scopePayload($department->id, $level->id));
    $application = CmsApplication::where('user_id', $applicant->id)->firstOrFail();

    $this->actingAs(createAdminUser())->post(route('cms.applications.accept', $application))->assertRedirect();

    $this->actingAs($applicant->fresh())->get(route('dashboard.my-courses'))->assertOk();
    $this->get(route('dashboard.subject-registration.index'))->assertOk();
    $this->get(route('application.status'))->assertOk();
});

test('legacy pending student row is bounced from student features', function () {
    [$department, $level] = scopeDeptAndLevel();

    $user = User::factory()->create();
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    $user->assignRole(UserRole::Student->value);

    CmsStudent::create([
        'user_id' => $user->id,
        'student_no' => '2024-0007',
        'name' => 'Legacy Pending',
        'email' => $user->email,
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'pending',
    ]);

    $this->actingAs($user)->get(route('dashboard.my-courses'))
        ->assertRedirect(route('application.status'));

    // No application row exists, but the status page still renders with the
    // student profile state.
    $this->get(route('application.status'))->assertOk();
});

test('active legacy student keeps full access', function () {
    [$department, $level] = scopeDeptAndLevel();

    $user = User::factory()->create();
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    $user->assignRole(UserRole::Student->value);

    CmsStudent::create([
        'user_id' => $user->id,
        'student_no' => '2024-0008',
        'name' => 'Legacy Active',
        'email' => $user->email,
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    $this->actingAs($user)->get(route('dashboard.my-courses'))->assertOk();
});

test('users with neither an application nor a student profile are redirected from the status page', function () {
    $admin = createAdminUser();

    $this->actingAs($admin)->get(route('application.status'))
        ->assertRedirect(route('dashboard'));
});

test('non-student roles keep their existing dashboard.access:student behaviour', function () {
    $editor = createUserWithRoles([UserRole::ContentEditor->value]);

    $this->actingAs($editor)->get(route('dashboard.my-courses'))
        ->assertForbidden();
});

test('the applications queue is closed to non-managers', function () {
    [$department, $level] = scopeDeptAndLevel();

    $teacher = createUserWithRoles([UserRole::Teacher->value]);

    $this->actingAs($teacher)->get(route('cms.applications.index'))
        ->assertForbidden();
});
