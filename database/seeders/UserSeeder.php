<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            ['email' => 'admin@mhcst.ly',   'name' => 'System Admin',  'role' => 'Admin'],
            ['email' => 'manager@mhcst.ly', 'name' => 'Manager User',  'role' => 'Manager'],
            ['email' => 'editor@mhcst.ly',  'name' => 'Editor User',   'role' => 'Content Editor'],
            ['email' => 'support@mhcst.ly', 'name' => 'Support User',  'role' => 'Support'],
        ];

        $defaultPassword = env('SEEDER_DEFAULT_PASSWORD', null);
        abort_if($defaultPassword === null && app()->environment('production'),
            500, 'Set SEEDER_DEFAULT_PASSWORD in production before running UserSeeder.');

        $password = Hash::make($defaultPassword ?? 'change-me-on-first-login');

        foreach ($accounts as $acc) {
            $user = User::firstOrCreate(
                ['email' => $acc['email']],
                ['name' => $acc['name'], 'password' => $password, 'is_active' => true]
            );
            if (! $user->hasRole($acc['role'])) {
                $user->assignRole($acc['role']);
            }
        }
    }
}
