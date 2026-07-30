<?php

namespace Database\Seeders;

use App\Models\Instructor;
use Illuminate\Database\Seeder;

class InstructorSeeder extends Seeder
{
    public function run(): void
    {
        $instructors = [
            [
                'name' => 'أحمد الفيتوري',
                'bio_ar' => 'خبير في مجال البرمجة وتطوير الويب مع أكثر من 10 سنوات خبرة.',
                'bio_en' => 'Expert in web development with 10+ years of experience.',
                'email' => 'ahmed@mset.ly',
                'phone' => '0911111111',
                'specialization' => 'تطوير الويب',
                'years_experience' => 10,
                'social_links' => json_encode(['linkedin' => 'https://linkedin.com/in/ahmed', 'twitter' => 'https://twitter.com/ahmed']),
                'is_active' => true,
            ],
            [
                'name' => 'سارة العبيدي',
                'bio_ar' => 'مصممة جرافيك محترفة، حاصلة على جوائز عالمية في التصميم.',
                'bio_en' => 'Professional graphic designer with international awards.',
                'email' => 'sara@mset.ly',
                'phone' => '0922222222',
                'specialization' => 'التصميم الجرافيكي',
                'years_experience' => 7,
                'social_links' => json_encode(['linkedin' => 'https://linkedin.com/in/sara', 'behance' => 'https://behance.net/sara']),
                'is_active' => true,
            ],
            [
                'name' => 'محمد التركي',
                'bio_ar' => 'محاسب قانوني وخبير في الضرائب والتدقيق المالي.',
                'bio_en' => 'Certified accountant and tax expert.',
                'email' => 'mohamed@mset.ly',
                'phone' => '0933333333',
                'specialization' => 'المحاسبة والمالية',
                'years_experience' => 15,
                'social_links' => json_encode(['linkedin' => 'https://linkedin.com/in/mohamed']),
                'is_active' => true,
            ],
            [
                'name' => 'ليلى بن عمرو',
                'bio_ar' => 'مدربة لغة إنجليزية معتمدة من كامبريدج.',
                'bio_en' => 'Cambridge certified English trainer.',
                'email' => 'leila@mset.ly',
                'phone' => '0944444444',
                'specialization' => 'اللغة الإنجليزية',
                'years_experience' => 8,
                'social_links' => json_encode(['linkedin' => 'https://linkedin.com/in/leila']),
                'is_active' => true,
            ],
        ];

        foreach ($instructors as $inst) {
            Instructor::create($inst);
        }
    }
}
