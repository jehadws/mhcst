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
            'full_name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->numerify('09########'),
        ]);

        $course = Course::create([
            'created_by' => User::factory()->create()->id,
            'category_id' => Category::factory()->create()->id,
            'title_ar' => $this->faker->word(),
            'title_en' => $this->faker->word(),
            'slug' => $this->faker->unique()->slug(),
            'level' => $this->faker->randomElement(['beginner', 'intermediate', 'advanced']),
            'price' => $this->faker->randomFloat(2, 100, 1000),
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
            'certificate_number' => 'MHCST-'.$this->faker->year().'-'.str_pad((string) $this->faker->unique()->numberBetween(1, 99999), 5, '0', STR_PAD_LEFT),
            'file_path' => 'certificates/'.$this->faker->slug().'.pdf',
            'issued_at' => now(),
            'issued_by' => User::factory(),
        ];
    }
}
