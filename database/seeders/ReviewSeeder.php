<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Review;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $reviews = [
            ['course_id' => 1, 'reviewer_name' => 'أحمد خالد', 'rating' => 5, 'comment' => 'أفضل دورة Laravel شاركت فيها!', 'is_published' => true],
            ['course_id' => 1, 'reviewer_name' => 'منى سالم', 'rating' => 4, 'comment' => 'محتوى قوي لكن أتمنى المزيد من التمارين العملية.', 'is_published' => true],
            ['course_id' => 2, 'reviewer_name' => 'يوسف النعاس', 'rating' => 5, 'comment' => 'React شرح ممتاز وواضح.', 'is_published' => true],
            ['course_id' => 3, 'reviewer_name' => 'هدى الفاخري', 'rating' => 5, 'comment' => 'PMP مع الأستاذ محمد كان تحولًا كبيرًا في مسيرتي.', 'is_published' => true],
            ['course_id' => 4, 'reviewer_name' => 'ريم البكباك', 'rating' => 4, 'comment' => 'التصميم الجرافيكي بدأت أشتغل فيه بعد الدورة مباشرة.', 'is_published' => true],
            ['course_id' => 5, 'reviewer_name' => 'سامي القروي', 'rating' => 3, 'comment' => 'جيدة بشكل عام.', 'is_published' => false],
        ];

        foreach ($reviews as $r) {
            Review::create($r);
        }
    }
}
