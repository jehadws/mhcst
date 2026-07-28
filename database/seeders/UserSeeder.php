<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin@mset.ly',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);
        $admin->assignRole('Admin');

        User::create([
            'name' => 'Manager User',
            'email' => 'manager@mset.ly',
            'password' => Hash::make('password'),
            'is_active' => true,
        ])->assignRole('Manager');

        User::create([
            'name' => 'Editor User',
            'email' => 'editor@mset.ly',
            'password' => Hash::make('password'),
            'is_active' => true,
        ])->assignRole('Content Editor');
    }
}
