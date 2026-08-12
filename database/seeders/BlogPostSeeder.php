<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        $posts = [
            [
                'author_id' => 1,
                'title' => 'أهمية التدريب المهني في سوق العمل الليبي',
                'slug' => 'importance-of-vocational-training',
                'excerpt' => 'التدريب المهني ليس خيارًا بل ضرورة في عالم يتغير بسرعة. تعرف على أبرز المهارات المطلوبة.',
                'content' => '<p>في ظل التحولات الاقتصادية والتقنية التي يشهدها العالم، أصبح التدريب المهني ضرورة حتمية...</p><p>تشير الدراسات إلى أن الشركات تفضل توظيف الأفراد ذوي المهارات العملية...</p>',
                'cover_image' => 'https://picsum.photos/seed/blog1/800/400',
                'status' => 'published',
                'published_at' => now()->subDays(5),
                'seo_title' => 'أهمية التدريب المهني | MHCST',
                'seo_description' => 'اكتشف لماذا التدريب المهني مهم لمسيرتك في سوق العمل الليبي',
            ],
            [
                'author_id' => 2,
                'title' => '5 مهارات تقنية يجب على كل مطور معرفتها في 2026',
                'slug' => 'top-5-tech-skills-2026',
                'excerpt' => 'من الذكاء الاصطناعي إلى الأمن السيبراني، إليك أهم المهارات التقنية للعام الحالي.',
                'content' => '<p>عالم التقنية يتطور بسرعة فائقة، ومع دخولنا عام 2026 هناك مهارات لا غنى عنها...</p>',
                'cover_image' => 'https://picsum.photos/seed/blog2/800/400',
                'status' => 'published',
                'published_at' => now()->subDays(12),
                'seo_title' => 'أهم 5 مهارات تقنية 2026 | MHCST',
                'seo_description' => 'تعرف على أهم المهارات التقنية المطلوبة في سوق العمل هذا العام',
            ],
            [
                'author_id' => 1,
                'title' => 'دليلك الشامل لاجتياز امتحان PMP',
                'slug' => 'pmp-exam-guide',
                'excerpt' => 'نصائح عملية وخطة دراسية مجربة للنجاح في امتحان إدارة المشاريع الاحترافية.',
                'content' => '<p>امتحان PMP يُعتبر من أصعب الامتحانات المهنية، لكن مع الاستعداد الصحيح يمكنك النجاح من المحاولة الأولى...</p>',
                'cover_image' => 'https://picsum.photos/seed/blog3/800/400',
                'status' => 'draft',
                'published_at' => null,
                'seo_title' => 'دليل PMP الشامل | MHCST',
                'seo_description' => 'خطتك للنجاح في امتحان إدارة المشاريع الاحترافية PMP',
            ],
        ];

        foreach ($posts as $p) {
            BlogPost::create($p);
        }
    }
}
