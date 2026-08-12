<?php

use App\Enums\UserRole;
use App\Models\User;
use Spatie\Permission\Models\Role;

test('student cannot access content routes by url', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $this->actingAs($user)->get('/dashboard/faqs/list')->assertForbidden();
    $this->actingAs($user)->get('/dashboard/blog-posts/list')->assertForbidden();
    $this->actingAs($user)->get('/dashboard/certificates/list')->assertForbidden();
});

test('student cannot access settings or crm routes by url', function () {
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);

    $this->actingAs($user)->get('/dashboard/users/list')->assertForbidden();
    $this->actingAs($user)->get('/dashboard/site-settings')->assertForbidden();
    $this->actingAs($user)->get('/dashboard/newsletter/list')->assertForbidden();
});

test('content editor cannot access cms or settings routes by url', function () {
    Role::firstOrCreate(['name' => UserRole::ContentEditor->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::ContentEditor->value);

    $this->actingAs($user)->get('/cms/departments')->assertForbidden();
    $this->actingAs($user)->get('/dashboard/users/list')->assertForbidden();
    $this->actingAs($user)->get('/dashboard/faqs/list')->assertOk();
});

test('support cannot access content routes but can access crm routes', function () {
    Role::firstOrCreate(['name' => UserRole::Support->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Support->value);

    $this->actingAs($user)->get('/dashboard/blog-posts/list')->assertForbidden();
    $this->actingAs($user)->get('/dashboard/newsletter/list')->assertOk();
});

test('teacher cannot access cms admin routes by url', function () {
    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Teacher->value);

    $this->actingAs($user)->get('/cms/departments')->assertForbidden();
    $this->actingAs($user)->get('/cms/grades')->assertOk();
    $this->actingAs($user)->get('/cms/audit-logs')->assertForbidden();
    $this->actingAs($user)->get('/cms/settings')->assertForbidden();
});

test('manager cannot access admin settings routes by url', function () {
    Role::firstOrCreate(['name' => UserRole::Manager->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Manager->value);

    $this->actingAs($user)->get('/cms/departments')->assertOk();
    $this->actingAs($user)->get('/dashboard/users/list')->assertForbidden();
    $this->actingAs($user)->get('/dashboard/site-settings')->assertForbidden();
});
