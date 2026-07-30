<?php

namespace Database\Seeders;

use App\Models\Certificate;
use App\Models\Enrollment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CertificateSeeder extends Seeder
{
    public function run(): void
    {
        $completed = Enrollment::query()->where('status', 'completed')->take(5)->get();

        foreach ($completed as $index => $enrollment) {
            Certificate::create([
                'enrollment_id' => $enrollment->id,
                'student_id' => $enrollment->student_id,
                'course_id' => $enrollment->course_id,
                'certificate_number' => 'MSET-'.strtoupper(Str::random(8)),
                'file_path' => 'certificates/sample-'.($index + 1).'.pdf',
                'issued_at' => now()->subDays(rand(1, 30)),
                'issued_by' => 1,
            ]);
        }
    }
}
