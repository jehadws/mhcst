<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;

// Regression: a student bounced to /login from a staff-only page (e.g. an
// expired session) used to be sent straight back to it after logging in,
// producing a 403 right after login.

test('student bounced from a staff-only page lands on the dashboard after login', function () {
    $user = createUserWithRoles([UserRole::Student->value]);

    $this->get('/dashboard/users/list')->assertRedirect(route('login'));

    $this->followingRedirects()->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertOk();
});

test('student bounced from a cms page lands on the dashboard after login', function () {
    $user = createUserWithRoles([UserRole::Student->value]);

    $this->get('/cms/grades')->assertRedirect(route('login'));

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect('/dashboard');
});

test('intended url the user may open is still honoured after login', function () {
    $user = createUserWithRoles([UserRole::Student->value]);

    $this->get('/student/application')->assertRedirect(route('login'));

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect('/student/application');
});

test('admitted student bounced from a student page returns there after login', function () {
    $user = createUserWithRoles([UserRole::Student->value]);

    $department = CmsDepartment::create(['name' => 'Redirect Dept']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
    CmsStudent::create([
        'user_id' => $user->id,
        'student_no' => '2099-5555',
        'name' => 'Redirect Student',
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    $this->get('/dashboard/my-grades')->assertRedirect(route('login'));

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect('/dashboard/my-grades');
});

test('staff member keeps the staff page they were bounced from', function () {
    $user = createUserWithRoles([UserRole::Support->value]);

    $this->get('/dashboard/newsletter/list')->assertRedirect(route('login'));

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect('/dashboard/newsletter/list');
});

test('plain login without an intended url goes to the dashboard', function () {
    $user = createUserWithRoles([UserRole::Student->value]);

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect('/dashboard');
});
