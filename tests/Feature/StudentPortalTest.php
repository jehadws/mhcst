<?php

use App\Models\Certificate;
use App\Models\CmsAttendance;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Support\Facades\RateLimiter;

function createPortalCmsStudent(array $attributes = []): CmsStudent
{
    $department = CmsDepartment::create(['name' => 'Portal Dept', 'description' => 'Portal test department']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 2, 'section' => 'B', 'capacity' => 30]);

    return CmsStudent::create(array_merge([
        'student_no' => 'PD-2024-001',
        'name' => 'Portal Student',
        'email' => 'portal.student@test.com',
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ], $attributes));
}

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

test('student portal search prioritizes exact student number matches', function () {
    $student = createPortalCmsStudent([
        'student_no' => 'PD-2024-042',
        'name' => 'Target Student',
        'email' => 'target.student@test.com',
    ]);

    // Another student's *name* equals the queried student number — the old
    // combined OR match would have returned both, but an exact student_no
    // hit must win and return alone for the academic world.
    createPortalCmsStudent([
        'student_no' => 'PD-2024-043',
        'name' => 'PD-2024-042',
        'email' => 'other.student@test.com',
    ]);

    $response = $this->getJson(route('student.portal.search', ['query' => 'PD-2024-042']));

    $response->assertOk()
        ->assertJsonCount(1, 'academic_students')
        ->assertJsonPath('academic_students.0.id', $student->id)
        ->assertJsonPath('academic_students.0.student_no', 'PD-2024-042');
});

test('academic results include subjects department level and training certificates', function () {
    $student = createPortalCmsStudent([
        'student_no' => 'PD-2024-100',
        'email' => 'enriched.student@test.com',
    ]);

    $subject = CmsSubject::create([
        'department_id' => $student->level->department_id,
        'code' => 'CS101',
        'name' => 'Programming Basics',
        'credits' => 3,
        'semester' => 'first',
    ]);
    CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'status' => 'active',
    ]);

    $enrollment = Enrollment::factory()->create([
        'email' => 'enriched.student@test.com',
        'status' => 'completed',
    ]);
    $certificate = Certificate::factory()->create([
        'enrollment_id' => $enrollment->id,
        'student_id' => $enrollment->student_id,
        'course_id' => $enrollment->course_id,
    ]);

    $response = $this->getJson(route('student.portal.search', ['query' => 'enriched.student@test.com']));

    $response->assertOk()
        ->assertJsonCount(1, 'academic_students')
        ->assertJsonPath('academic_students.0.department', 'Portal Dept')
        ->assertJsonPath('academic_students.0.level', 'Year 2 · Section B')
        ->assertJsonCount(1, 'academic_students.0.subjects')
        ->assertJsonPath('academic_students.0.subjects.0.name', 'Programming Basics')
        ->assertJsonPath('academic_students.0.subjects.0.code', 'CS101')
        ->assertJsonPath('academic_students.0.subjects.0.credits', 3)
        ->assertJsonCount(1, 'academic_students.0.certificates')
        ->assertJsonPath('academic_students.0.certificates.0.certificate_number', $certificate->certificate_number);
});

test('student portal search never exposes grades gpa or attendance', function () {
    $student = createPortalCmsStudent([
        'student_no' => 'PD-2024-200',
        'email' => 'privacy.student@test.com',
    ]);

    $subject = CmsSubject::create([
        'department_id' => $student->level->department_id,
        'code' => 'PR101',
        'name' => 'Private Subject',
        'credits' => 2,
        'semester' => 'first',
    ]);
    $enrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2025-2026',
        'semester' => 'first',
        'status' => 'active',
    ]);

    // Grade and attendance rows exist — they must still never leak.
    CmsGrade::create([
        'enrollment_id' => $enrollment->id,
        'midterm' => 90,
        'final' => 85,
        'assignments' => 80,
        'projects' => 75,
        'participation' => 70,
        'entered_at' => now(),
    ]);
    CmsAttendance::create([
        'enrollment_id' => $enrollment->id,
        'date' => now(),
        'status' => 'absent',
    ]);

    Enrollment::factory()->create([
        'email' => 'privacy.student@test.com',
        'status' => 'completed',
    ]);

    $response = $this->getJson(route('student.portal.search', ['query' => 'privacy.student@test.com']));

    $response->assertOk();

    $json = $response->json();

    expect($json)->not->toHaveKey('grades')
        ->not->toHaveKey('gpa')
        ->not->toHaveKey('grade_letter')
        ->not->toHaveKey('attendance')
        ->and($json['academic_students'][0] ?? null)->toBeArray()
        ->not->toHaveKey('grades')
        ->not->toHaveKey('gpa')
        ->not->toHaveKey('grade_letter')
        ->not->toHaveKey('attendance')
        ->and($json['training_enrollments'][0] ?? null)->toBeArray()
        ->not->toHaveKey('grades')
        ->not->toHaveKey('gpa')
        ->not->toHaveKey('grade_letter')
        ->not->toHaveKey('attendance');
});

test('student portal search is rate limited', function () {
    RateLimiter::clear(sha1('localhost|127.0.0.1'));

    for ($i = 0; $i < 20; $i++) {
        $this->getJson(route('student.portal.search', ['query' => 'rate.limited@test.com']))
            ->assertOk();
    }

    $this->getJson(route('student.portal.search', ['query' => 'rate.limited@test.com']))
        ->assertStatus(429);
});
