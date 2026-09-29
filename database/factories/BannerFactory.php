<?php

namespace Database\Factories;

use App\Models\Banner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Banner>
 */
class BannerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'image' => '/banner.webp',
            'title' => fake()->sentence(4),
            'title_ar' => 'طوّر مهاراتك المهنية',
            'subtitle' => fake()->sentence(10),
            'subtitle_ar' => 'انضم لأفضل الدورات التدريبية في ليبيا مع نخبة من المدربين المعتمدين',
            'cta_text' => 'Explore courses',
            'cta_text_ar' => 'استعرض الدورات',
            'cta_link' => '/courses',
            'sort_order' => fake()->numberBetween(1, 100),
            'is_active' => true,
        ];
    }
}
