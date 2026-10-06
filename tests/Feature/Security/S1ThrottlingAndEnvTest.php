<?php

use App\Models\User;
use Database\Seeders\UserSeeder;

test('returns 429 after 6 rapid calls to deploy run', function () {
    for ($i = 0; $i < 6; $i++) {
        $this->get(route('deploy.run', ['token' => 'wrong']))
            ->assertStatus($i < 5 ? 403 : 429);
    }
});

test('returns 429 after 31 rapid POST locale calls', function () {
    for ($i = 0; $i < 32; $i++) {
        $this->postJson(route('locale.update'), ['locale' => 'en'])
            ->assertStatus($i < 30 ? 200 : 429);
    }
});

test('returns 429 after 6 POST forgot password calls', function () {
    for ($i = 0; $i < 6; $i++) {
        $this->post(route('password.email'), ['email' => 'nonexistent@example.com'])
            ->assertStatus($i < 5 ? 302 : 429);
    }
});

test('returns 429 after 6 POST reset password calls', function () {
    for ($i = 0; $i < 6; $i++) {
        $this->post(route('password.store'), [
            'token' => 'invalid',
            'email' => 'nonexistent@example.com',
            'password' => 'NewPass123!',
            'password_confirmation' => 'NewPass123!',
        ])->assertStatus($i < 5 ? 302 : 429);
    }
});

// This app does not expose a public POST /register endpoint —
// user accounts are created by admins only, so this route does not exist.
test('returns 429 after 6 POST register calls', function () {
})->skip('No public POST /register route in this application.');

test('pins bcrypt rounds to 12 via config', function () {
    $this->assertSame(12, (int) config('hashing.bcrypt.rounds'));
});

test('UserSeeder is idempotent two runs produce 4 accounts total', function () {
    $this->seed(UserSeeder::class);
    $this->seed(UserSeeder::class);
    $this->assertSame(4, User::whereIn('email', [
        'admin@mhcst.edu.ly', 'manager@mhcst.edu.ly', 'editor@mhcst.edu.ly', 'support@mhcst.edu.ly',
    ])->count());
});
