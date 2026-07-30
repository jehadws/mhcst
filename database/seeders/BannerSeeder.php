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
                'image' => 'https://picsum.photos/seed/banner1/1600/600',
                'title' => 'طوّر مهاراتك المهنية',
                'subtitle' => 'انضم لأفضل الدورات التدريبية في ليبيا مع نخبة من المدربين المعتمدين',
                'cta_text' => 'استعرض الدورات',
                'cta_link' => '/courses',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'image' => 'https://picsum.photos/seed/banner2/1600/600',
                'title' => 'تدريب مخصص للشركات',
                'subtitle' => 'نقدم حلول تدريبية متكاملة للمؤسسات والشركات بأحدث المناهج',
                'cta_text' => 'تواصل معنا',
                'cta_link' => '/contact',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'image' => 'https://picsum.photos/seed/banner3/1600/600',
                'title' => 'شهادات معتمدة',
                'subtitle' => 'احصل على شهادة معتمدة بعد إتمام كل دورة تدريبية بنجاح',
                'cta_text' => 'سجّل الآن',
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
