<?php

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;

test('student portal page can be rendered', function () {
    $response = $this->get(route('student.portal'));

    $response->assertSuccessful();
});

test('student can lookup enrollments by email or phone via API', function () {
    $student = Student::factory()->create([
        'email' => 'student.portal.test@mhcst.edu.ly',
        'phone' => '+218919998877',
    ]);
    $course = Course::factory()->create(['status' => 'published']);
    $enrollment = Enrollment::factory()->create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'email' => 'student.portal.test@mhcst.edu.ly',
        'phone' => '+218919998877',
        'status' => 'confirmed',
    ]);

    $response = $this->getJson(route('student.portal.search', ['query' => 'student.portal.test@mhcst.edu.ly']));

    $response->assertSuccessful()
        ->assertJsonCount(1, 'enrollments')
        ->assertJsonPath('enrollments.0.email', 'student.portal.test@mhcst.edu.ly');
});
