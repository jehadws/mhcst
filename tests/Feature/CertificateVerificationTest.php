<?php

use App\Models\Category;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;

test('certificate verification page renders', function () {
    $this->get('/verify-certificate')->assertOk();
});

test('a valid certificate number returns the certificate', function () {
    $category = Category::create([
        'name_ar' => 'تقنية',
        'name_en' => 'IT',
        'slug' => 'it',
    ]);

    $course = Course::create([
        'created_by' => User::factory()->create()->id,
        'category_id' => $category->id,
        'title_ar' => 'دورة البرمجة',
        'title_en' => 'Programming Course',
        'slug' => 'programming-course',
        'level' => 'beginner',
        'price' => 250,
        'status' => 'published',
    ]);

    $student = Student::create([
        'full_name' => 'Mohammed Ali',
        'email' => 'mohammed@example.com',
        'phone' => '0913334444',
    ]);

    $enrollment = Enrollment::create([
        'course_id' => $course->id,
        'student_id' => $student->id,
        'full_name' => $student->full_name,
        'email' => $student->email,
        'phone' => $student->phone,
        'status' => 'completed',
        'payment_status' => 'paid',
        'amount_due' => 250,
        'amount_paid' => 250,
        'source' => 'website',
    ]);

    $certificate = Certificate::create([
        'enrollment_id' => $enrollment->id,
        'student_id' => $student->id,
        'course_id' => $course->id,
        'certificate_number' => 'MHCST-2026-00001',
        'file_path' => 'certificates/MHCST-2026-00001.pdf',
        'issued_at' => now(),
        'issued_by' => User::factory()->create()->id,
    ]);

    $this->get('/verify-certificate?number=MHCST-2026-00001')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/verify-certificate')
            ->where('certificate.certificate_number', 'MHCST-2026-00001')
            ->where('notFound', false));
});

test('an invalid certificate number returns not found', function () {
    $this->get('/verify-certificate?number=INVALID-123')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/verify-certificate')
            ->where('certificate', null)
            ->where('notFound', true));
});
