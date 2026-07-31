<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Enrollment>
 */
class EnrollmentFactory extends Factory
{
    public function definition(): array
    {
        $fullName = $this->faker->name();

        return [
            'course_id' => Course::factory(),
            'student_id' => Student::factory(),
            'full_name' => $fullName,
            'email' => $this->faker->safeEmail(),
            'phone' => $this->faker->phoneNumber(),
            'company_name' => $this->faker->optional()->company(),
            'status' => $this->faker->randomElement(['pending', 'confirmed', 'completed', 'cancelled']),
            'payment_method' => 'cash',
            'payment_status' => 'unpaid',
            'amount_due' => 0,
            'amount_paid' => 0,
            'source' => 'website',
            'notes' => null,
        ];
    }
}
