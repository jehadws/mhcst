<?php

use App\Models\CmsAuditLog;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;

function createListingLevel(): CmsLevel
{
    $department = CmsDepartment::create(['name' => 'Listing CS', 'description' => 'CS Dept']);

    return CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 60]);
}

test('teachers index paginates and filters by status', function () {
    $admin = createAdminUser();

    for ($i = 1; $i <= 17; $i++) {
        CmsTeacher::create([
            'name' => 'Teacher '.$i,
            'email' => 'teacher'.$i.'@example.com',
            'status' => $i === 1 ? 'resigned' : 'active',
        ]);
    }

    $this->actingAs($admin)->get('/cms/teachers')->assertOk()->assertInertia(fn ($page) => $page
        ->component('cms/teachers/index')
        ->has('teachers.data', 15)
        ->where('teachers.total', 17)
        ->where('teachers.last_page', 2)
    );

    $this->actingAs($admin)->get('/cms/teachers?page=2')->assertOk()->assertInertia(fn ($page) => $page
        ->has('teachers.data', 2)
    );

    $this->actingAs($admin)->get('/cms/teachers?status=resigned')->assertOk()->assertInertia(fn ($page) => $page
        ->has('teachers.data', 1)
        ->where('teachers.data.0.name', 'Teacher 1')
    );
});

test('subjects index paginates and filters by department and semester', function () {
    $admin = createAdminUser();
    $department = CmsDepartment::create(['name' => 'Subject CS', 'description' => 'CS Dept']);
    $other = CmsDepartment::create(['name' => 'Subject EE', 'description' => 'EE Dept']);

    for ($i = 1; $i <= 17; $i++) {
        CmsSubject::create([
            'department_id' => $i === 1 ? $other->id : $department->id,
            'code' => 'CS'.$i,
            'name' => 'Subject '.$i,
            'credits' => 3,
            'semester' => 'first',
        ]);
    }

    $this->actingAs($admin)->get('/cms/subjects')->assertOk()->assertInertia(fn ($page) => $page
        ->component('cms/subjects/index')
        ->has('subjects.data', 15)
        ->where('subjects.total', 17)
        ->where('subjects.last_page', 2)
    );

    $this->actingAs($admin)->get('/cms/subjects?department_id='.$other->id)->assertOk()->assertInertia(fn ($page) => $page
        ->has('subjects.data', 1)
        ->where('subjects.data.0.code', 'CS1')
    );
});

test('departments index paginates and filters by search', function () {
    $admin = createAdminUser();

    for ($i = 1; $i <= 17; $i++) {
        CmsDepartment::create(['name' => 'Department '.$i, 'description' => 'Dept '.$i]);
    }

    $this->actingAs($admin)->get('/cms/departments')->assertOk()->assertInertia(fn ($page) => $page
        ->component('cms/departments/index')
        ->has('departments.data', 15)
        ->where('departments.total', 17)
        ->where('departments.last_page', 2)
    );

    $this->actingAs($admin)->get('/cms/departments?search=Department 3')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('departments.data', 1));
});

test('levels index paginates and filters by department', function () {
    $admin = createAdminUser();
    $level = createListingLevel();
    $other = CmsDepartment::create(['name' => 'Level EE', 'description' => 'EE Dept']);

    for ($i = 1; $i <= 17; $i++) {
        CmsLevel::create([
            'department_id' => $level->department_id,
            'year' => 1,
            'section' => 'S'.$i,
            'capacity' => 30,
        ]);
    }

    $this->actingAs($admin)->get('/cms/levels')->assertOk()->assertInertia(fn ($page) => $page
        ->component('cms/levels/index')
        ->has('levels.data', 15)
        ->where('levels.total', 18)
        ->where('levels.last_page', 2)
    );

    $this->actingAs($admin)->get('/cms/levels?department_id='.$other->id)->assertOk()->assertInertia(fn ($page) => $page
        ->has('levels.data', 0)
    );
});

test('enrollments index paginates and filters by status', function () {
    $admin = createAdminUser();
    $level = createListingLevel();
    $student = CmsStudent::create([
        'student_no' => '2026-5000',
        'name' => 'Enrollment Student',
        'email' => 'enrollment.student@example.com',
        'level_id' => $level->id,
        'enrollment_date' => now()->format('Y-m-d'),
        'status' => 'active',
    ]);
    for ($i = 1; $i <= 17; $i++) {
        $subject = CmsSubject::create([
            'department_id' => $level->department_id,
            'code' => 'ENR'.$i,
            'name' => 'Enrollment Subject '.$i,
            'credits' => 3,
            'semester' => 'first',
        ]);

        CmsEnrollment::create([
            'student_id' => $student->id,
            'subject_id' => $subject->id,
            'academic_year' => '2025/2026',
            'semester' => 'first',
            'status' => $i === 1 ? 'completed' : 'pending',
            'source' => 'admin',
        ]);
    }

    $this->actingAs($admin)->get('/cms/enrollments')->assertOk()->assertInertia(fn ($page) => $page
        ->component('cms/enrollments/index')
        ->has('enrollments.data', 15)
        ->where('enrollments.total', 17)
        ->where('enrollments.last_page', 2)
    );

    $this->actingAs($admin)->get('/cms/enrollments?status=completed')->assertOk()->assertInertia(fn ($page) => $page
        ->has('enrollments.data', 1)
    );
});

test('audit log index paginates at 20 per page and filters by action', function () {
    $admin = createAdminUser();
    $adminId = $admin->id;

    for ($i = 1; $i <= 25; $i++) {
        CmsAuditLog::create([
            'user_id' => $adminId,
            'action' => $i <= 2 ? 'put' : 'post',
            'entity_type' => 'students',
            'entity_id' => $i,
            'ip_address' => '127.0.0.1',
        ]);
    }

    $this->actingAs($admin)->get('/cms/audit-logs')->assertOk()->assertInertia(fn ($page) => $page
        ->component('cms/audit-logs/index')
        ->has('logs.data', 20)
        ->where('logs.total', 25)
        ->where('logs.last_page', 2)
    );

    $this->actingAs($admin)->get('/cms/audit-logs?page=2')->assertOk()->assertInertia(fn ($page) => $page
        ->has('logs.data', 5)
    );

    $this->actingAs($admin)->get('/cms/audit-logs?action=put')->assertOk()->assertInertia(fn ($page) => $page
        ->has('logs.data', 2)
    );
});
