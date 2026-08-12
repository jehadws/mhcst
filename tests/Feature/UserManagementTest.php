<?php

use App\Enums\UserRole;
use App\Models\User;
use Spatie\Permission\Models\Role;

test('non-admin cannot access user management routes', function () {
    Role::firstOrCreate(['name' => UserRole::Manager->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Manager->value);

    $this->actingAs($user)->get('/dashboard/users/list')->assertForbidden();
});

test('admin can list users with roles', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Manager->value, 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $manager = User::factory()->create(['email' => 'manager@test.com']);
    $manager->assignRole(UserRole::Manager->value);

    $this->actingAs($admin)->get('/dashboard/users/list')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard/users/list')
            ->has('users', 2)
        );
});

test('admin can create user with roles', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $this->actingAs($admin)->post('/dashboard/users', [
        'name' => 'New Teacher',
        'email' => 'teacher@test.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'roles' => [UserRole::Teacher->value],
    ])->assertRedirect(route('dashboard.users.list'));

    $created = User::where('email', 'teacher@test.com')->first();

    expect($created)->not->toBeNull()
        ->and($created->hasRole(UserRole::Teacher->value))->toBeTrue();
});

test('admin can update user roles', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $user = User::factory()->create(['email' => 'update@test.com']);
    $user->assignRole(UserRole::Student->value);

    $this->actingAs($admin)->put("/dashboard/users/{$user->id}", [
        'name' => $user->name,
        'email' => $user->email,
        'roles' => [UserRole::Teacher->value],
    ])->assertRedirect(route('dashboard.users.list'));

    expect($user->fresh()->hasRole(UserRole::Teacher->value))->toBeTrue()
        ->and($user->fresh()->hasRole(UserRole::Student->value))->toBeFalse();
});

test('admin cannot remove the last admin role', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Manager->value, 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $this->actingAs($admin)->put("/dashboard/users/{$admin->id}", [
        'name' => $admin->name,
        'email' => $admin->email,
        'roles' => [UserRole::Manager->value],
    ])->assertSessionHasErrors('roles');
});
