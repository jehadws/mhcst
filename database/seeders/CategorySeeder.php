<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name_ar' => 'تقنية المعلومات', 'name_en' => 'IT', 'slug' => 'it', 'icon' => '💻', 'sort_order' => 1],
            ['name_ar' => 'إدارة الأعمال', 'name_en' => 'Business', 'slug' => 'business', 'icon' => '📊', 'sort_order' => 2],
            ['name_ar' => 'التصميم', 'name_en' => 'Design', 'slug' => 'design', 'icon' => '🎨', 'sort_order' => 3],
            ['name_ar' => 'اللغات', 'name_en' => 'Languages', 'slug' => 'languages', 'icon' => '🌐', 'sort_order' => 4],
            ['name_ar' => 'المحاسبة', 'name_en' => 'Accounting', 'slug' => 'accounting', 'icon' => '📒', 'sort_order' => 5],
            ['name_ar' => 'الهندسة', 'name_en' => 'Engineering', 'slug' => 'engineering', 'icon' => '⚙️', 'sort_order' => 6],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }
    }
}
