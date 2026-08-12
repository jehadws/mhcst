<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\User;
use Spatie\Permission\Models\Role;

function createLinkedStudentUser(): array
{
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $department = CmsDepartment::create(['name' => 'CS', 'description' => 'CS']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);

    $student = CmsStudent::create([
        'user_id' => $user->id,
        'student_no' => '2026-0042',
        'name' => 'Test Student',
        'email' => 'student@test.com',
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    return [$user, $student];
}

test('student can download their own transcript', function () {
    [$user, $student] = createLinkedStudentUser();

    $response = $this->actingAs($user)->get(route('dashboard.my-transcript'));

    $response->assertOk();
    $response->assertViewIs('cms.transcript');
    $response->assertSee('كشف درجات رسمي');
    $response->assertSee($student->student_no);
});

test('student dashboard includes transcript url', function () {
    [$user] = createLinkedStudentUser();

    $this->actingAs($user)->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/index')
            ->where('dashboardRole', 'student')
            ->where('transcriptUrl', route('dashboard.my-transcript'))
        );
});

test('teacher cannot access my transcript route', function () {
    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Teacher->value);

    $this->actingAs($user)->get(route('dashboard.my-transcript'))->assertForbidden();
});

test('student without linked profile gets 404 on my transcript', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $this->actingAs($user)->get(route('dashboard.my-transcript'))->assertNotFound();
});

test('my transcript requires authentication', function () {
    $this->get(route('dashboard.my-transcript'))->assertRedirect('/login');
});

test('admin can view departments summary report page', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Admin->value);

    CmsDepartment::create(['name' => 'Engineering', 'description' => 'Eng dept']);

    $this->actingAs($user)->get('/cms/reports/departments')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cms/reports/departments')
            ->has('departments', 1)
            ->where('departments.0.name', 'Engineering')
        );
});

test('admin can export departments report as pdf', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Admin->value);

    CmsDepartment::create(['name' => 'Medicine', 'description' => 'Med dept']);

    $response = $this->actingAs($user)->get('/cms/reports/departments?format=pdf');

    $response->assertOk();
    $response->assertViewIs('cms.exports.departments');
    $response->assertSee('Medicine');
});
