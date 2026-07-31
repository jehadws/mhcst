<?php

namespace Database\Factories;

use App\Models\NewsletterCampaign;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<NewsletterCampaign>
 */
class NewsletterCampaignFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'subject' => fake()->sentence(6),
            'content' => '<h1>'.fake()->sentence().'</h1><p>'.fake()->paragraph().'</p>',
            'status' => 'draft',
            'sent_by' => User::factory(),
            'sent_at' => null,
            'recipient_count' => 0,
            'sent_count' => 0,
            'failed_count' => 0,
        ];
    }

    public function sent(): static
    {
        return $this->state(fn (): array => [
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }
}
