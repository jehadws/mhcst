<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;

test('student portal page can be rendered', function () {
    $response = $this->get(route('student.portal'));

    $response->assertSuccessful();
});

test('student can lookup enrollments by exact email match', function () {
    $student = Student::factory()->create([
        'email' => 'student.portal.test@mhcst.edu.ly',
        'phone' => '+218919998877',
    ]);
    $course = Course::factory()->create(['status' => 'published']);
    Enrollment::factory()->create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'email' => 'student.portal.test@mhcst.edu.ly',
        'phone' => '+218919998877',
        'full_name' => 'Portal Student',
        'status' => 'confirmed',
    ]);

    $response = $this->getJson(route('student.portal.search', ['query' => 'student.portal.test@mhcst.edu.ly']));

    $response->assertSuccessful()
        ->assertJsonCount(1, 'training_enrollments')
        ->assertJsonPath('training_enrollments.0.full_name', 'Portal Student')
        ->assertJsonMissingPath('training_enrollments.0.email');
});

test('student portal search rejects partial matches', function () {
    Student::factory()->create([
        'email' => 'student.portal.test@mhcst.edu.ly',
    ]);

    $this->getJson(route('student.portal.search', ['query' => 'portal.test']))
        ->assertSuccessful()
        ->assertJsonCount(0, 'training_enrollments');
});

test('student portal search requires minimum query length', function () {
    $this->getJson(route('student.portal.search', ['query' => 'abc']))
        ->assertUnprocessable();
});
