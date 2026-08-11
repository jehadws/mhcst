<?php

use App\Models\Course;
use App\Models\CourseCurriculum;

test('curriculum sections can be associated with a course', function () {
    $course = Course::factory()->create();

    $curriculum = CourseCurriculum::create([
        'course_id' => $course->id,
        'section_title_ar' => 'الوحدة الأولى: أساسيات البرمجة',
        'section_title_en' => 'Module 1: Programming Basics',
        'lessons' => [
            ['title_ar' => 'مقدمة في المحتوى', 'duration_minutes' => 30],
            ['title_ar' => 'إعداد بيئة العمل', 'duration_minutes' => 45],
        ],
        'sort_order' => 1,
    ]);

    expect($course->curriculums)->toHaveCount(1);
    expect($course->curriculums->first()->section_title_ar)->toBe('الوحدة الأولى: أساسيات البرمجة');
});
