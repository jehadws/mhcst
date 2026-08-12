<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin@mhcst.ly',
            'password' => Hash::make('password'),
            'is_active' => true,
        ]);
        $admin->assignRole('Admin');

        User::create([
            'name' => 'Manager User',
            'email' => 'manager@mhcst.ly',
            'password' => Hash::make('password'),
            'is_active' => true,
        ])->assignRole('Manager');

        User::create([
            'name' => 'Editor User',
            'email' => 'editor@mhcst.ly',
            'password' => Hash::make('password'),
            'is_active' => true,
        ])->assignRole('Content Editor');

        User::create([
            'name' => 'Support User',
            'email' => 'support@mhcst.ly',
            'password' => Hash::make('password'),
            'is_active' => true,
        ])->assignRole('Support');
    }
}
