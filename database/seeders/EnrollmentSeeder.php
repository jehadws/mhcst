<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Database\Seeder;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $statuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        $paymentStatuses = ['unpaid', 'partial', 'paid'];
        $sources = ['website', 'whatsapp', 'phone', 'walk_in'];

        $students = Student::all();

        for ($i = 1; $i <= 15; $i++) {
            $courseId = rand(1, 5);
            $student = $students->random();
            $price = [1200, 1000, 2500, 800, 600][$courseId - 1];
            $paid = $paymentStatuses[array_rand($paymentStatuses)];

            Enrollment::create([
                'course_id' => $courseId,
                'student_id' => $student->id,
                'full_name' => $student->full_name,
                'email' => $student->email,
                'phone' => $student->phone,
                'company_name' => $i % 3 === 0 ? 'شركة التقنية '.$i : null,
                'status' => $statuses[array_rand($statuses)],
                'payment_method' => ['cash', 'bank_transfer', 'other'][array_rand(['cash', 'bank_transfer', 'other'])],
                'payment_status' => $paid,
                'amount_due' => $price,
                'amount_paid' => $paid === 'paid' ? $price : ($paid === 'partial' ? $price * 0.5 : 0),
                'source' => $sources[array_rand($sources)],
                'notes' => $i % 2 === 0 ? 'ملاحظة تجريبية رقم '.$i : null,
            ]);
        }
    }
}
