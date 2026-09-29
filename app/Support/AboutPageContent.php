<?php

namespace App\Support;

class AboutPageContent
{
    /**
     * Default About page content used to seed the `about_page` site setting.
     *
     * Mirrors the content originally hardcoded in
     * resources/js/pages/site/about.tsx so the seeded site renders
     * identically once the page becomes CMS-driven.
     *
     * @return array<string, mixed>
     */
    public static function default(): array
    {
        return [
            'hero' => [
                'title' => 'Our story & journey',
                'title_ar' => 'قصتنا ورحلتنا',
                'description' => 'Over a decade of experience building professional skills through accredited training.',
                'description_ar' => 'أكثر من عقد من الخبرة في بناء مهارات المهنيين عبر برامج تدريبية معتمدة.',
                'image' => '/banner.webp',
            ],
            'pillars' => [
                [
                    'icon' => 'target',
                    'title' => 'Our Mission',
                    'title_ar' => 'رسالتنا',
                    'body' => 'Deliver accredited professional training that empowers individuals and organisations to develop skills and elevate performance.',
                    'body_ar' => 'تقديم برامج تدريبية احترافية معتمدة تُمكّن الأفراد والمؤسسات من تطوير مهاراتهم والارتقاء بأدائهم المهني.',
                ],
                [
                    'icon' => 'eye',
                    'title' => 'Our Vision',
                    'title_ar' => 'رؤيتنا',
                    'body' => 'To be the premier reference for accredited professional training in Libya and the region.',
                    'body_ar' => 'أن نكون المرجع الأول في التدريب المهني المعتمد في ليبيا والمنطقة.',
                ],
                [
                    'icon' => 'lightbulb',
                    'title' => 'Leadership Message',
                    'title_ar' => 'رسالة الإدارة',
                    'body' => 'We believe every learner deserves training they can trust — and a certificate that changes their career path.',
                    'body_ar' => 'نحمل حلماً بأن يجد كل متعلم تدريباً احترافياً يثق به ويحصل من خلاله على شهادة تُغيّر مساره المهني.',
                ],
            ],
            'values' => [
                [
                    'icon' => 'shield-check',
                    'title' => 'Accreditation & Quality',
                    'title_ar' => 'الاعتماد والجودة',
                    'body' => 'Regionally and internationally recognized certificates',
                    'body_ar' => 'شهادات معتمدة ومعترف بها إقليمياً ودولياً',
                ],
                [
                    'icon' => 'users',
                    'title' => 'Expert Instructors',
                    'title_ar' => 'مدربون من الخبراء',
                    'body' => 'Practitioners with real-world expertise',
                    'body_ar' => 'نخبة من الممارسين الحقيقيين في مجالاتهم',
                ],
                [
                    'icon' => 'graduation-cap',
                    'title' => 'Flexible Learning',
                    'title_ar' => 'مرونة التعلم',
                    'body' => 'Onsite, online, and blended options',
                    'body_ar' => 'حضوري وعبر الإنترنت ومدمج',
                ],
                [
                    'icon' => 'award',
                    'title' => 'Practical Application',
                    'title_ar' => 'التطبيق العملي',
                    'body' => 'Real projects for your portfolio',
                    'body_ar' => 'مشاريع حقيقية لمعرض أعمالك',
                ],
            ],
            'milestones' => [
                ['year' => '2010', 'label' => 'Founded', 'label_ar' => 'التأسيس'],
                ['year' => '2016', 'label' => 'First Accreditation', 'label_ar' => 'أول اعتماد'],
                ['year' => '2019', 'label' => '5,000+ Graduates', 'label_ar' => '5000+ خريج'],
                ['year' => '2023', 'label' => 'Digital Expansion', 'label_ar' => 'توسّع رقمي'],
                ['year' => '2025', 'label' => '20,000+ Learners', 'label_ar' => '20,000+ متدرب'],
            ],
        ];
    }
}
