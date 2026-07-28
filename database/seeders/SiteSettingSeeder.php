<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SiteSetting;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'site_name', 'value' => 'Mset.ly', 'type' => 'text'],
            ['key' => 'site_tagline', 'value' => 'منصة التدريب المهني الأولى', 'type' => 'text'],
            ['key' => 'site_logo', 'value' => 'settings/logo.png', 'type' => 'image'],
            ['key' => 'contact_email', 'value' => 'info@mset.ly', 'type' => 'text'],
            ['key' => 'contact_phone', 'value' => '+218 91 234 5678', 'type' => 'text'],
            ['key' => 'whatsapp_number', 'value' => '+218912345678', 'type' => 'text'],
            ['key' => 'address', 'value' => 'طرابلس، ليبيا', 'type' => 'text'],
            ['key' => 'social_links', 'value' => json_encode([
                'facebook' => 'https://facebook.com/msetly',
                'instagram' => 'https://instagram.com/msetly',
                'linkedin' => 'https://linkedin.com/company/msetly',
                'twitter' => 'https://twitter.com/msetly',
            ]), 'type' => 'json'],
            ['key' => 'footer_text', 'value' => '© 2026 Mset.ly. جميع الحقوق محفوظة.', 'type' => 'text'],
            ['key' => 'meta_description', 'value' => 'أفضل منصة للتدريب المهني في ليبيا', 'type' => 'text'],
        ];

        foreach ($settings as $s) {
            SiteSetting::create($s);
        }
    }
}
