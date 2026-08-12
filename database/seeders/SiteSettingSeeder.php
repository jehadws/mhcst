<?php

namespace Database\Seeders;

use App\Models\SiteSetting;
use Illuminate\Database\Seeder;

class SiteSettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'site_name', 'value' => 'Almaayir Alhaditha College for Science and Technology', 'type' => 'text'],
            ['key' => 'site_name_ar', 'value' => 'كلية المعايير الحديثة للعلوم والتقنية', 'type' => 'text'],
            ['key' => 'site_tagline', 'value' => 'Almaayir Alhaditha College for Science and Technology', 'type' => 'text'],
            ['key' => 'site_tagline_ar', 'value' => 'كلية المعايير الحديثة للعلوم والتقنية', 'type' => 'text'],
            ['key' => 'site_logo', 'value' => '', 'type' => 'image'],
            ['key' => 'contact_email', 'value' => 'info@mhcst.ly', 'type' => 'text'],
            ['key' => 'contact_phone', 'value' => '+218 91 234 5678', 'type' => 'text'],
            ['key' => 'whatsapp_number', 'value' => '+218912345678', 'type' => 'text'],
            ['key' => 'address', 'value' => 'طرابلس، ليبيا', 'type' => 'text'],
            ['key' => 'social_links', 'value' => json_encode([
                'facebook' => 'https://facebook.com/mhcst',
                'instagram' => 'https://instagram.com/mhcst',
                'linkedin' => 'https://linkedin.com/company/mhcst',
                'twitter' => 'https://twitter.com/mhcst',
            ]), 'type' => 'json'],
            ['key' => 'footer_text', 'value' => '© 2026 Almaayir Alhaditha College for Science and Technology. جميع الحقوق محفوظة.', 'type' => 'text'],
            ['key' => 'meta_description', 'value' => 'كلية المعايير الحديثة للعلوم والتقنية — Almaayir Alhaditha College for Science and Technology', 'type' => 'text'],
        ];

        foreach ($settings as $s) {
            SiteSetting::updateOrCreate(
                ['key' => $s['key']],
                ['value' => $s['value'], 'type' => $s['type']]
            );
        }
    }
}
