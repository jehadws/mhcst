<?php

use App\Models\Category;
use App\Models\Course;
use App\Models\User;

function createPublishedCourse(array $overrides = [])
{
    $category = Category::create([
        'name_ar' => 'تقنية',
        'name_en' => 'IT',
        'slug' => 'it-'.uniqid(),
    ]);

    return Course::create(array_merge([
        'category_id' => $category->id,
        'created_by' => User::factory()->create()->id,
        'title_ar' => 'دورة البرمجة',
        'title_en' => 'Programming Course',
        'slug' => 'programming-course-'.uniqid(),
        'description_ar' => 'وصف',
        'description_en' => 'Description',
        'level' => 'beginner',
        'price' => 250,
        'status' => 'published',
    ], $overrides));
}

test('contact form creates a lead', function () {
    $response = $this->post('/contact', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'phone' => '0912345678',
        'subject' => 'Inquiry',
        'message' => 'I would like to know more about your courses.',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('leads', [
        'email' => 'test@example.com',
        'type' => 'contact',
        'status' => 'new',
    ]);
});

test('contact form validates required fields', function () {
    $this->post('/contact', ['message' => ''])
        ->assertSessionHasErrors(['name', 'message']);
});

test('enrollment form creates a pending enrollment and student', function () {
    $course = createPublishedCourse();

    $response = $this->post('/enroll', [
        'name' => 'Ali Mohammed',
        'email' => 'ali@example.com',
        'phone' => '0911112222',
        'course' => $course->slug,
        'message' => 'Please contact me.',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('students', ['email' => 'ali@example.com']);
    $this->assertDatabaseHas('enrollments', [
        'course_id' => $course->id,
        'email' => 'ali@example.com',
        'status' => 'pending',
        'source' => 'website',
    ]);
    $this->assertDatabaseHas('enrollment_status_histories', [
        'new_status' => 'pending',
    ]);
});

test('enrollment form rejects an invalid course', function () {
    $this->post('/enroll', [
        'name' => 'Ali Mohammed',
        'email' => 'ali@example.com',
        'phone' => '0911112222',
        'course' => 'does-not-exist',
    ])->assertSessionHasErrors(['course']);

    $this->assertDatabaseCount('enrollments', 0);
});

test('enrollment form validates required fields', function () {
    $this->post('/enroll', [])
        ->assertSessionHasErrors(['name', 'email', 'phone', 'course']);
});

test('review form creates an unpublished review', function () {
    $course = createPublishedCourse();

    $response = $this->post('/review', [
        'course_id' => $course->id,
        'reviewer_name' => 'Sara',
        'rating' => 5,
        'comment' => 'Great course!',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('reviews', [
        'course_id' => $course->id,
        'reviewer_name' => 'Sara',
        'rating' => 5,
        'is_published' => false,
    ]);
});

test('review form validates rating range', function () {
    $this->post('/review', [
        'course_id' => 1,
        'reviewer_name' => 'Sara',
        'rating' => 6,
    ])->assertSessionHasErrors(['rating']);
});
