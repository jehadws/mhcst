<?php

namespace Database\Factories;

use App\Models\NotificationTemplate;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NotificationTemplate>
 */
class NotificationTemplateFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'channel' => fake()->randomElement(['email', 'whatsapp']),
            'trigger_event' => 'enrollment.created',
            'subject' => fake()->sentence(),
            'body' => fake()->paragraph(),
        ];
    }
}
