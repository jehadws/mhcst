<?php

use App\Enums\UserRole;
use App\Models\Certificate;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\URL;

test('authenticated user can download certificate pdf view', function () {
    $user = createUserWithRoles([UserRole::ContentEditor->value]);
    $student = Student::factory()->create();
    $course = Course::factory()->create(['status' => 'published']);
    $enrollment = Enrollment::factory()->create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'completed',
    ]);
    $certificate = Certificate::create([
        'enrollment_id' => $enrollment->id,
        'student_id' => $student->id,
        'course_id' => $course->id,
        'certificate_number' => 'MHCST-TEST-001',
        'file_path' => 'certificates/test.pdf',
        'issued_at' => now(),
        'issued_by' => $user->id,
    ]);

    $response = $this->actingAs($user)->get(route('dashboard.certificates.download', $certificate));

    $response->assertSuccessful();
    $response->assertSee('MHCST-TEST-001');
    $response->assertSee($student->full_name);
});

test('public user can download printable certificate with signed url', function () {
    $user = User::factory()->create();
    $student = Student::factory()->create();
    $course = Course::factory()->create(['status' => 'published']);
    $enrollment = Enrollment::factory()->create([
        'student_id' => $student->id,
        'course_id' => $course->id,
        'status' => 'completed',
    ]);
    Certificate::create([
        'enrollment_id' => $enrollment->id,
        'student_id' => $student->id,
        'course_id' => $course->id,
        'certificate_number' => 'MHCST-PUBLIC-999',
        'file_path' => 'certificates/public.pdf',
        'issued_at' => now(),
        'issued_by' => $user->id,
    ]);

    $url = URL::temporarySignedRoute(
        'certificates.public-download',
        now()->addMinutes(30),
        ['number' => 'MHCST-PUBLIC-999']
    );

    $response = $this->get($url);

    $response->assertSuccessful();
    $response->assertSee('MHCST-PUBLIC-999');
});
