<?php

use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\SiteSetting;

function setShowTeachersPage(bool $enabled): void
{
    SiteSetting::updateOrCreate(
        ['key' => 'show_teachers_page'],
        ['value' => $enabled ? '1' : '0', 'type' => 'boolean']
    );
}

function createPublicTeacherFixture(string $status = 'active'): array
{
    $department = CmsDepartment::create(['name' => 'Engineering', 'description' => 'Eng Dept']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
    $teacher = CmsTeacher::create([
        'name' => 'Dr. Ada Lovelace',
        'email' => 'ada-lovelace@example.com',
        'specialization' => 'Software Engineering',
        'qualification' => 'PhD',
        'status' => $status,
    ]);
    $subject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'CS101',
        'name' => 'Intro to CS',
        'credits' => 3,
        'semester' => 'first',
    ]);

    CmsSchedule::create([
        'subject_id' => $subject->id,
        'teacher_id' => $teacher->id,
        'level_id' => $level->id,
        'day' => 'sunday',
        'start_time' => '09:00',
        'end_time' => '10:30',
        'type' => 'lecture',
        'academic_year' => '2025-2026',
        'semester' => 'first',
    ]);

    return compact('teacher', 'department', 'subject', 'level');
}

test('teachers page returns 404 when the setting is disabled', function () {
    createPublicTeacherFixture();
    setShowTeachersPage(false);

    $this->get('/teachers')->assertStatus(404);
});

test('teachers page returns 404 by default', function () {
    createPublicTeacherFixture();

    $this->get('/teachers')->assertStatus(404);
});

test('teachers page lists active teachers with their departments when enabled', function () {
    ['teacher' => $teacher, 'department' => $department] = createPublicTeacherFixture();
    setShowTeachersPage(true);

    $this->get('/teachers')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/teachers')
            ->where('teachers.0.id', $teacher->id)
            ->where('teachers.0.name', 'Dr. Ada Lovelace')
            ->where('teachers.0.specialization', 'Software Engineering')
            ->where('teachers.0.qualification', 'PhD')
            ->where('teachers.0.departments.0.id', $department->id)
            ->where('teachers.0.departments.0.name', 'Engineering')
        );
});

test('teachers page returns 404 when instructor names are hidden', function () {
    createPublicTeacherFixture();
    setShowTeachersPage(true);
    SiteSetting::updateOrCreate(
        ['key' => 'hide_instructor_names'],
        ['value' => '1', 'type' => 'boolean']
    );

    $this->get('/teachers')->assertStatus(404);
});

test('teachers page excludes inactive teachers and teachers without schedules', function () {
    ['teacher' => $activeTeacher] = createPublicTeacherFixture();

    CmsTeacher::create([
        'name' => 'Dr. Suspended',
        'email' => 'suspended@example.com',
        'status' => 'suspended',
    ]);

    CmsTeacher::create([
        'name' => 'Dr. NoSchedule',
        'email' => 'no-schedule@example.com',
        'status' => 'active',
    ]);

    setShowTeachersPage(true);

    $this->get('/teachers')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('site/teachers')
            ->has('teachers', 1)
            ->where('teachers.0.id', $activeTeacher->id)
        );
});

test('sitemap lists the teachers page only when it is enabled and names are public', function () {
    createPublicTeacherFixture();

    expect($this->get('/sitemap.xml')->getContent())->not->toContain(route('teachers'));

    setShowTeachersPage(true);
    expect($this->get('/sitemap.xml')->getContent())->toContain(route('teachers'));

    SiteSetting::updateOrCreate(
        ['key' => 'hide_instructor_names'],
        ['value' => '1', 'type' => 'boolean']
    );
    expect($this->get('/sitemap.xml')->getContent())->not->toContain(route('teachers'));
});

test('show_teachers_page is shared with the frontend as a boolean', function () {
    setShowTeachersPage(true);

    $this->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('siteSettings.show_teachers_page', true)
            ->where('siteSettings.hide_instructor_names', false)
        );
});
