<?php

use App\Models\Course;
use App\Models\CourseAttachment;
use App\Models\CourseCurriculum;
use App\Models\User;

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

test('public course page renders curriculum sections and attachments', function () {
    $course = Course::factory()->create(['status' => 'published']);

    CourseCurriculum::create([
        'course_id' => $course->id,
        'section_title_ar' => 'الوحدة الأولى',
        'section_title_en' => 'Module One',
        'lessons' => [
            ['title_ar' => 'مقدمة', 'duration_minutes' => 30],
        ],
        'sort_order' => 0,
    ]);

    CourseAttachment::create([
        'course_id' => $course->id,
        'title_ar' => 'دليل الطالب PDF',
        'title_en' => 'Student Guide PDF',
        'file_path' => 'course-attachments/guide.pdf',
        'file_type' => 'pdf',
        'file_size_bytes' => 1024,
    ]);

    $response = $this->get(route('courses.show', $course->slug));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('site/courses/show')
        ->has('course.curriculums', 1)
        ->has('course.attachments', 1)
    );
});

test('attachments can be attached and deleted from a course', function () {
    $user = User::factory()->create();
    $course = Course::factory()->create();

    $attachment = CourseAttachment::create([
        'course_id' => $course->id,
        'title_ar' => 'دليل الطالب PDF',
        'title_en' => 'Student Guide PDF',
        'file_path' => 'course-attachments/test.pdf',
        'file_type' => 'pdf',
        'file_size_bytes' => 1024,
    ]);

    expect($course->attachments)->toHaveCount(1);

    $response = $this->actingAs($user)->delete(route('dashboard.course-attachments.destroy', $attachment));

    $response->assertRedirect();
    $this->assertDatabaseMissing('course_attachments', ['id' => $attachment->id]);
});
