<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\UserUpload;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<UserUpload>
 */
class UserUploadFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'path' => 'uploads/'.Str::random(16).'_'.time().'.png',
        ];
    }
}
