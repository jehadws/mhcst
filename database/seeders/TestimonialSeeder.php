<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            [
                'name' => 'عبدالله سالم',
                'role_title' => 'مطور ويب',
                'company' => 'شركة التقنية',
                'photo' => 'https://i.pravatar.cc/150?u=abdullah',
                'quote' => 'كانت تجربة رائعة! الدورة غيّرت مساري المهني بالكامل وأصبحت أقدر أبني مشاريع كاملة بثقة.',
                'is_published' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'فاطمة الزهراء',
                'role_title' => 'مصممة جرافيك',
                'company' => 'استوديو الإبداع',
                'photo' => 'https://i.pravatar.cc/150?u=fatima',
                'quote' => 'المحتوى التدريبي ممتاز والمدربون محترفون جدًا. أنصح كل مصمم بالانضمام.',
                'is_published' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'خالد العروسي',
                'role_title' => 'مدير مالي',
                'company' => 'مصرف التنمية',
                'photo' => 'https://i.pravatar.cc/150?u=khaled',
                'quote' => 'دورة المحاسبة كانت عملية جدًا وطبقت ما تعلمته مباشرة في عملي اليومي.',
                'is_published' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'نور الهدى',
                'role_title' => 'طالبة جامعية',
                'company' => 'جامعة طرابلس',
                'photo' => 'https://i.pravatar.cc/150?u=nour',
                'quote' => 'اللغة الإنجليزية للأعمال ساعدتني في مقابلات العمل. شكرًا فريق مستلي!',
                'is_published' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($testimonials as $t) {
            Testimonial::create($t);
        }
    }
}
