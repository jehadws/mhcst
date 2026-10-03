<?php

use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;

function createStudentIndexLevel(): CmsLevel
{
    $department = CmsDepartment::create(['name' => 'Index CS', 'description' => 'CS Dept']);

    return CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
}

function createStudentRecord(CmsLevel $level, int $index, string $status = 'active'): CmsStudent
{
    return CmsStudent::create([
        'student_no' => sprintf('2026-%04d', $index),
        'name' => 'Student '.$index,
        'email' => 'student'.$index.'@example.com',
        'level_id' => $level->id,
        'enrollment_date' => now()->format('Y-m-d'),
        'status' => $status,
    ]);
}

test('students index paginates so every student is reachable across pages', function () {
    $admin = createAdminUser();
    $level = createStudentIndexLevel();

    for ($i = 1; $i <= 17; $i++) {
        createStudentRecord($level, $i);
    }

    $this->actingAs($admin)->get('/cms/students')->assertOk()->assertInertia(fn ($page) => $page
        ->component('cms/students/index')
        ->has('students.data', 15)
        ->where('students.total', 17)
        ->where('students.last_page', 2)
    );

    $this->actingAs($admin)->get('/cms/students?page=2')->assertOk()->assertInertia(fn ($page) => $page
        ->has('students.data', 2)
        ->where('students.total', 17)
    );
});

test('students index filters by search, status and level', function () {
    $admin = createAdminUser();
    $level = createStudentIndexLevel();

    createStudentRecord($level, 1);
    createStudentRecord($level, 2);
    createStudentRecord($level, 3, 'graduated');

    $this->actingAs($admin)->get('/cms/students?search=student2')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('students.data', 1)
            ->where('students.data.0.name', 'Student 2')
        );

    $this->actingAs($admin)->get('/cms/students?status=graduated')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('students.data', 1)
            ->where('students.data.0.status', 'graduated')
        );

    $this->actingAs($admin)->get('/cms/students?level_id='.$level->id)
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('students.data', 3));
});
