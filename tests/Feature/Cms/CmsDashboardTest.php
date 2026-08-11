<?php

use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\User;

test('cms department has students through levels', function () {
    $department = CmsDepartment::create([
        'name' => 'Computer Science',
        'description' => 'CS Department',
    ]);

    $level = CmsLevel::create([
        'department_id' => $department->id,
        'year' => 1,
        'section' => 'A',
        'capacity' => 30,
    ]);

    $student = CmsStudent::create([
        'student_no' => 'STD001',
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    expect($department->students)->toHaveCount(1)
        ->and($department->students->first()->id)->toBe($student->id);
});

test('cms dashboard redirects to the merged college dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)->get('/cms/dashboard')->assertRedirect('/dashboard');
});

test('authenticated user can view the merged dashboard with academic stats', function () {
    $user = User::factory()->create();

    $department = CmsDepartment::create([
        'name' => 'Engineering',
        'description' => 'Eng Dept',
    ]);

    $level = CmsLevel::create([
        'department_id' => $department->id,
        'year' => 1,
        'section' => 'A',
        'capacity' => 30,
    ]);

    CmsStudent::create([
        'student_no' => 'STD002',
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'level_id' => $level->id,
        'enrollment_date' => now(),
        'status' => 'active',
    ]);

    $response = $this->actingAs($user)->get('/dashboard');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('dashboard/index')
        ->has('studentsByDepartment')
        ->has('recentGrades')
        ->where('stats.departments_count', 1)
    );
});
