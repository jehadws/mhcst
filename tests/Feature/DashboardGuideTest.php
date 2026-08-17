<?php

use App\Models\User;

test('guests are redirected from system guide', function () {
    $this->get(route('dashboard.guide'))->assertRedirect(route('login'));
});

test('authenticated users with roles can view system guide', function () {
    $user = createAdminUser();

    $this->actingAs($user)
        ->get(route('dashboard.guide'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('dashboard/guide/index'));
});

test('users without roles cannot view system guide', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard.guide'))
        ->assertForbidden();
});
