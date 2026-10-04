<?php

use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function createPortalStudent(): CmsStudent
{
    $department = CmsDepartment::create(['name' => 'Portal Dept', 'description' => 'Test']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);

    return CmsStudent::create([
        'student_no' => '20260001',
        'name' => 'Enumerable Student',
        'email' => 'enumerable.student@example.com',
        'phone' => '0912345678',
        'level_id' => $level->id,
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);
}

test('a student number alone is rejected before any lookup', function () {
    createPortalStudent();

    $this->getJson('/student/portal/search?query=20260001')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['contact']);
});

test('an email or phone alone is rejected before any lookup', function () {
    createPortalStudent();

    $this->getJson('/student/portal/search?query=enumerable.student@example.com')
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['contact']);
});

test('a record is returned when the student number and contact both match', function () {
    createPortalStudent();

    $this->getJson('/student/portal/search?query=20260001&contact=enumerable.student@example.com')
        ->assertOk()
        ->assertJsonPath('academic_students.0.student_no', '20260001');

    $this->getJson('/student/portal/search?query=20260001&contact=0912345678')
        ->assertOk()
        ->assertJsonPath('academic_students.0.student_no', '20260001');
});

test('a wrong contact key returns no record even with a valid student number', function () {
    createPortalStudent();

    $this->getJson('/student/portal/search?query=20260001&contact=attacker@example.com')
        ->assertOk()
        ->assertJsonPath('academic_students', []);
});

test('iterating sequential student numbers with a foreign contact key yields nothing', function () {
    createPortalStudent();

    foreach (['20260001', '20260002', '20260003'] as $studentNo) {
        $this->getJson('/student/portal/search?query='.$studentNo.'&contact=attacker@example.com')
            ->assertOk()
            ->assertJsonPath('academic_students', []);
    }
});
