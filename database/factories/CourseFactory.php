<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Course>
 */
class CourseFactory extends Factory
{
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'created_by' => User::factory(),
            'title_ar' => $this->faker->sentence(3),
            'title_en' => $this->faker->sentence(3),
            'slug' => $this->faker->slug(),
            'description_ar' => $this->faker->paragraph(),
            'description_en' => $this->faker->paragraph(),
            'level' => 'beginner',
            'duration_hours' => 20,
            'price' => 250.00,
            'status' => 'published',
        ];
    }
}
