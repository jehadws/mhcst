<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $courses = [
            [
                'category_id' => 1,
                'title_ar' => 'دورة Laravel المتقدمة',
                'title_en' => 'Advanced Laravel Course',
                'slug' => 'advanced-laravel',
                'description_ar' => 'تعلم بناء تطبيقات ويب احترافية باستخدام Laravel مع أفضل الممارسات.',
                'description_en' => 'Learn to build professional web apps with Laravel.',
                'level' => 'advanced',
                'duration_hours' => 40,
                'location_type' => 'onsite',
                'venue' => 'قاعة التدريب الرئيسية - طرابلس',
                'start_date' => now()->addDays(10),
                'end_date' => now()->addDays(30),
                'capacity' => 20,
                'price' => 1200.00,
                'cover_image' => 'https://picsum.photos/seed/laravel/800/500',
                'status' => 'published',
                'created_by' => 1,
            ],
            [
                'category_id' => 1,
                'title_ar' => 'تطوير الواجهات الأمامية React',
                'title_en' => 'React Frontend Development',
                'slug' => 'react-frontend',
                'description_ar' => 'من الصفر للاحتراف في بناء واجهات المستخدم باستخدام React و Tailwind.',
                'description_en' => 'From zero to hero in React and Tailwind.',
                'level' => 'intermediate',
                'duration_hours' => 35,
                'location_type' => 'hybrid',
                'venue' => 'قاعة 2 - طرابلس + Zoom',
                'start_date' => now()->addDays(15),
                'end_date' => now()->addDays(35),
                'capacity' => 25,
                'price' => 1000.00,
                'cover_image' => 'https://picsum.photos/seed/react/800/500',
                'status' => 'published',
                'created_by' => 1,
            ],
            [
                'category_id' => 2,
                'title_ar' => 'إدارة المشاريع الاحترافية PMP',
                'title_en' => 'PMP Project Management',
                'slug' => 'pmp-project-management',
                'description_ar' => 'تحضير شامل لامتحان PMP مع دراسة حالة عملية.',
                'description_en' => 'Complete PMP exam prep with case studies.',
                'level' => 'advanced',
                'duration_hours' => 50,
                'location_type' => 'onsite',
                'venue' => 'قاعة VIP - طرابلس',
                'start_date' => now()->addDays(5),
                'end_date' => now()->addDays(40),
                'capacity' => 15,
                'price' => 2500.00,
                'cover_image' => 'https://picsum.photos/seed/pmp/800/500',
                'status' => 'published',
                'created_by' => 1,
            ],
            [
                'category_id' => 3,
                'title_ar' => 'تصميم الهوية البصرية',
                'title_en' => 'Brand Identity Design',
                'slug' => 'brand-identity',
                'description_ar' => 'تعلم أساسيات تصميم الشعارات والهوية البصرية للشركات.',
                'description_en' => 'Learn logo design and brand identity basics.',
                'level' => 'beginner',
                'duration_hours' => 25,
                'location_type' => 'onsite',
                'venue' => 'استوديو التصميم',
                'start_date' => now()->addDays(20),
                'end_date' => now()->addDays(35),
                'capacity' => 12,
                'price' => 800.00,
                'cover_image' => 'https://picsum.photos/seed/design/800/500',
                'status' => 'published',
                'created_by' => 1,
            ],
            [
                'category_id' => 4,
                'title_ar' => 'الإنجليزية للأعمال',
                'title_en' => 'Business English',
                'slug' => 'business-english',
                'description_ar' => 'تطوير مهارات اللغة الإنجليزية في بيئة العمل.',
                'description_en' => 'Develop English skills for the workplace.',
                'level' => 'intermediate',
                'duration_hours' => 30,
                'location_type' => 'hybrid',
                'venue' => 'قاعة اللغات',
                'start_date' => now()->addDays(7),
                'end_date' => now()->addDays(37),
                'capacity' => 18,
                'price' => 600.00,
                'cover_image' => 'https://picsum.photos/seed/english/800/500',
                'status' => 'published',
                'created_by' => 1,
            ],
            [
                'category_id' => 5,
                'title_ar' => 'محاسبة الشركات الصغيرة',
                'title_en' => 'Small Business Accounting',
                'slug' => 'small-business-accounting',
                'description_ar' => 'أساسيات المحاسبة للشركات الناشئة والصغيرة.',
                'description_en' => 'Accounting basics for startups and SMEs.',
                'level' => 'beginner',
                'duration_hours' => 20,
                'location_type' => 'onsite',
                'venue' => 'قاعة المحاسبة',
                'start_date' => now()->addDays(12),
                'end_date' => now()->addDays(27),
                'capacity' => 22,
                'price' => 500.00,
                'cover_image' => 'https://picsum.photos/seed/accounting/800/500',
                'status' => 'draft',
                'created_by' => 1,
            ],
        ];

        foreach ($courses as $course) {
            $c = Course::create($course);
            // ربط المدربين
            $c->instructors()->attach([1, 2], ['is_lead' => true]);
        }
    }
}
