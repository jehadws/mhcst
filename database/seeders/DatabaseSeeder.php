<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            SiteSettingSeeder::class,
            CmsPageSeeder::class,
            TestimonialSeeder::class,
            BannerSeeder::class,
            FaqSeeder::class,
            BlogPostSeeder::class,
            LeadSeeder::class,
            NewsletterSubscriberSeeder::class,
            CmsDemoDataSeeder::class,
            NotificationTemplateSeeder::class,
        ]);
    }
}
