<?php

use App\Enums\UserRole;
use App\Models\User;

test('guests are redirected from system guide', function () {
    $this->get(route('dashboard.guide'))->assertRedirect(route('login'));
});

test('admins can view system guide', function () {
    $user = createAdminUser();

    $this->actingAs($user)
        ->get(route('dashboard.guide'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/guide/index'));
});

test('non-admin roles are forbidden from system guide', function () {
    foreach ([UserRole::Manager, UserRole::ContentEditor, UserRole::Support, UserRole::Teacher, UserRole::Student] as $role) {
        $user = createUserWithRoles([$role]);

        $this->actingAs($user)
            ->get(route('dashboard.guide'))
            ->assertForbidden();
    }
});

test('users without roles cannot view system guide', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard.guide'))
        ->assertForbidden();
});
