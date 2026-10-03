<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createPendingStudentUser(): array
{
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create(['is_active' => true]);
    $user->assignRole(UserRole::Student->value);

    $department = CmsDepartment::create(['name' => 'Active Dept', 'description' => 'Active middleware test dept']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);

    $student = CmsStudent::create([
        'user_id' => $user->id,
        'student_no' => 'ACT-0001',
        'name' => 'Active Middleware Student',
        'level_id' => $level->id,
        'enrollment_date' => now()->toDateString(),
        'status' => 'pending',
    ]);

    return [$user, $student];
}

test('a pending student can still reach the dashboard', function () {
    [$user] = createPendingStudentUser();

    $this->actingAs($user)->get(route('dashboard'))->assertOk();
});

test('a pending student is bounced from subject registration to the application page (phase 2)', function () {
    [$user] = createPendingStudentUser();

    // Phase 2 scope: pending applicants see the dashboard and "طلبي" only;
    // student features open after the application is accepted.
    $this->actingAs($user)->get(route('dashboard.subject-registration.index'))
        ->assertRedirect(route('application.status'));
});

test('a deactivated user is logged out on the next request', function () {
    [$user] = createPendingStudentUser();

    $this->actingAs($user)->get(route('dashboard'))->assertOk();

    $user->update(['is_active' => false]);

    $response = $this->actingAs($user)->get(route('dashboard'));

    $response->assertRedirect(route('login'));
    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('an active user keeps working across requests', function () {
    [$user] = createPendingStudentUser();

    $this->actingAs($user)->get(route('dashboard'))->assertOk();
    $this->actingAs($user)->get(route('dashboard'))->assertOk();
});
