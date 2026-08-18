<?php

namespace Database\Factories;

use App\Models\Lead;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Lead>
 */
class LeadFactory extends Factory
{
    protected $model = Lead::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->safeEmail(),
            'phone' => $this->faker->optional()->numerify('09########'),
            'subject' => $this->faker->optional()->sentence(4),
            'message' => $this->faker->paragraph(),
            'type' => 'contact',
            'status' => 'new',
        ];
    }
}
