<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            [
                'image' => '/banner.webp',
                'title' => 'Develop your professional skills',
                'title_ar' => 'طوّر مهاراتك المهنية',
                'subtitle' => 'Join the best training courses in Libya with accredited expert instructors',
                'subtitle_ar' => 'انضم لأفضل الدورات التدريبية في ليبيا مع نخبة من المدربين المعتمدين',
                'cta_text' => 'Explore courses',
                'cta_text_ar' => 'استعرض الدورات',
                'cta_link' => '/courses',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'image' => '/banner.webp',
                'title' => 'Tailored corporate training',
                'title_ar' => 'تدريب مخصص للشركات',
                'subtitle' => 'Integrated training solutions for institutions and companies using modern curricula',
                'subtitle_ar' => 'نقدم حلول تدريبية متكاملة للمؤسسات والشركات بأحدث المناهج',
                'cta_text' => 'Contact us',
                'cta_text_ar' => 'تواصل معنا',
                'cta_link' => '/contact',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'image' => '/banner.webp',
                'title' => 'Accredited certificates',
                'title_ar' => 'شهادات معتمدة',
                'subtitle' => 'Earn an accredited certificate after successfully completing each course',
                'subtitle_ar' => 'احصل على شهادة معتمدة بعد إتمام كل دورة تدريبية بنجاح',
                'cta_text' => 'Register now',
                'cta_text_ar' => 'سجّل الآن',
                'cta_link' => '/courses',
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $b) {
            Banner::create($b);
        }
    }
}
