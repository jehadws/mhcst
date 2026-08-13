<?php

test('registration is disabled by default', function () {
    config(['auth.registration_enabled' => false]);

    $this->get('/register')->assertNotFound();

    $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertNotFound();

    $this->assertGuest();
});

test('registration can be enabled via config', function () {
    config(['auth.registration_enabled' => true]);

    $response = $this->get('/register');

    $response->assertSuccessful();
});

test('new users can register when enabled', function () {
    config(['auth.registration_enabled' => true]);

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $this->get('/dashboard')->assertForbidden();
});
