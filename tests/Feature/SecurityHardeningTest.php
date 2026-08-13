<?php

use App\Models\User;

test('users without roles cannot access dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/dashboard')->assertForbidden();
});

test('deactivated users cannot log in', function () {
    $user = User::factory()->create(['is_active' => false]);

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

test('certificate download requires a signed url', function () {
    $this->get('/verify-certificate/MHCST-2026-00001/download')->assertForbidden();
});
