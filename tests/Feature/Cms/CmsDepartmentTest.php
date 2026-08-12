<?php

use App\Models\CmsDepartment;
use App\Models\CmsTeacher;

test('authenticated user can view cms departments index', function () {
    $user = createAdminUser();

    $teacher = CmsTeacher::create([
        'name' => 'Dr. Ahmed',
        'email' => 'ahmed@example.com',
        'status' => 'active',
    ]);

    CmsDepartment::create([
        'name' => 'Computer Science',
        'head_id' => $teacher->id,
        'description' => 'CS Dept',
    ]);

    $response = $this->actingAs($user)->get('/cms/departments');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('cms/departments/index')
        ->has('departments.data', 1)
    );
});
