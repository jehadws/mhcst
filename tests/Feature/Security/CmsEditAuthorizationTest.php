<?php

use App\Enums\UserRole;
use App\Http\Middleware\EnsureCmsManage;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;

it('blocks a teacher from the student edit form at the controller level when middleware is bypassed', function () {
    $teacher = createUserWithRoles([UserRole::Teacher->value]);

    $department = CmsDepartment::create(['name' => 'Edit Auth Dept', 'description' => 'Edit auth']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
    $student = CmsStudent::create([
        'level_id' => $level->id,
        'student_no' => 'EDT-0001',
        'name' => 'Edit Auth Student',
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);

    $response = $this->withoutMiddleware(EnsureCmsManage::class)
        ->actingAs($teacher)
        ->get(route('cms.students.edit', $student));

    expect($response->status())->toBe(403);
});

it('blocks a teacher from the enrollment create form at the controller level when middleware is bypassed', function () {
    $teacher = createUserWithRoles([UserRole::Teacher->value]);

    $department = CmsDepartment::create(['name' => 'Edit Auth Dept 2', 'description' => 'Edit auth']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'B', 'capacity' => 30]);
    $subject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'EDT101',
        'name' => 'Edit Auth Subject',
        'credits' => 3,
        'semester' => 'first',
    ]);
    $student = CmsStudent::create([
        'level_id' => $level->id,
        'student_no' => 'EDT-0002',
        'name' => 'Edit Auth Student 2',
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);
    $enrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => 'active',
        'source' => 'admin',
    ]);

    $response = $this->withoutMiddleware(EnsureCmsManage::class)
        ->actingAs($teacher)
        ->get(route('cms.enrollments.edit', $enrollment));

    expect($response->status())->toBe(403);
});
