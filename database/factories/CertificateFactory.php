<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Certificate>
 */
class CertificateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $student = Student::create([
            'full_name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->numerify('09########'),
        ]);

        $course = Course::create([
            'created_by' => User::factory()->create()->id,
            'category_id' => Category::factory()->create()->id,
            'title_ar' => fake()->word(),
            'title_en' => fake()->word(),
            'slug' => fake()->unique()->slug(),
            'level' => fake()->randomElement(['beginner', 'intermediate', 'advanced']),
            'price' => fake()->randomFloat(2, 100, 1000),
            'status' => 'published',
        ]);

        $enrollment = Enrollment::create([
            'course_id' => $course->id,
            'student_id' => $student->id,
            'full_name' => $student->full_name,
            'email' => $student->email,
            'phone' => $student->phone,
            'status' => 'completed',
            'payment_status' => 'paid',
            'amount_due' => $course->price,
            'amount_paid' => $course->price,
            'source' => 'website',
        ]);

        return [
            'enrollment_id' => $enrollment->id,
            'student_id' => $student->id,
            'course_id' => $course->id,
            'certificate_number' => 'MHCST-'.fake()->year().'-'.str_pad((string) fake()->unique()->numberBetween(1, 99999), 5, '0', STR_PAD_LEFT),
            'file_path' => 'certificates/'.fake()->slug().'.pdf',
            'issued_at' => now(),
            'issued_by' => User::factory(),
        ];
    }
}
