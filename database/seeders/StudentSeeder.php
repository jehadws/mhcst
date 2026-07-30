<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $students = [
            ['full_name' => 'عبدالله سالم', 'email' => 'abdullah@test.com', 'phone' => '0911000001', 'city' => 'طرابلس'],
            ['full_name' => 'فاطمة الزهراء', 'email' => 'fatima@test.com', 'phone' => '0911000002', 'city' => 'بنغازي'],
            ['full_name' => 'خالد العروسي', 'email' => 'khaled@test.com', 'phone' => '0911000003', 'city' => 'مصراتة'],
            ['full_name' => 'نور الهدى', 'email' => 'nour@test.com', 'phone' => '0911000004', 'city' => 'الزاوية'],
            ['full_name' => 'يوسف الشريف', 'email' => 'yousef@test.com', 'phone' => '0911000005', 'city' => 'طرابلس'],
            ['full_name' => 'مريم القاضي', 'email' => 'mariam@test.com', 'phone' => '0911000006', 'city' => 'سبها'],
            ['full_name' => 'عمر التومي', 'email' => 'omar@test.com', 'phone' => '0911000007', 'city' => 'بنغازي'],
            ['full_name' => 'هناء المصراتي', 'email' => 'hana@test.com', 'phone' => '0911000008', 'city' => 'مصراتة'],
        ];

        foreach ($students as $s) {
            Student::create($s);
        }
    }
}
