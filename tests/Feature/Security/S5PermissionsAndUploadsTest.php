<?php

use App\Enums\UserRole;
use App\Http\Middleware\EnsureCmsManage;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Services\CmsAuthorizationService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    // Ensure standard roles exist
    foreach (UserRole::cases() as $role) {
        Role::firstOrCreate(['name' => $role->value, 'guard_name' => 'web']);
    }
});

it('blocks a Teacher from direct calls to any cms.manage method', function ($method, $route, $routeParams, $payload) {
    $teacher = createUserWithRoles([UserRole::Teacher->value]);

    // Create dummy entities so route model binding doesn't 404
    $dept = CmsDepartment::firstOrCreate(['name' => 'Dept S5'], ['description' => 'Desc']);
    $level = CmsLevel::firstOrCreate(
        ['department_id' => $dept->id, 'year' => 1, 'section' => 'S5'],
        ['capacity' => 30]
    );
    $cmsTeacher = CmsTeacher::firstOrCreate(['name' => 'Teacher S5'], ['email' => 't_s5@example.com']);
    $subject = CmsSubject::firstOrCreate(
        ['code' => 'SUB-S5'],
        ['name' => 'Sub S5', 'department_id' => $dept->id, 'credits' => 3, 'semester' => 'first']
    );
    $student = CmsStudent::firstOrCreate(
        ['student_no' => 'S5-0001'],
        ['name' => 'Student S5', 'level_id' => $level->id, 'status' => 'active', 'enrollment_date' => '2026-09-01']
    );
    $enrollment = CmsEnrollment::firstOrCreate(
        ['student_id' => $student->id, 'subject_id' => $subject->id, 'academic_year' => '2026', 'semester' => 'first'],
        ['status' => 'active']
    );
    $schedule = CmsSchedule::firstOrCreate(
        ['teacher_id' => $cmsTeacher->id, 'subject_id' => $subject->id, 'level_id' => $level->id, 'day' => 'monday'],
        ['start_time' => '08:00', 'end_time' => '10:00', 'academic_year' => '2026', 'semester' => 'first']
    );

    // Replace dummy IDs with real model instances/IDs
    $resolvedParams = [];
    foreach ($routeParams as $key => $val) {
        $resolvedParams[$key] = match ($key) {
            'department' => $dept->id,
            'level' => $level->id,
            'teacher' => $cmsTeacher->id,
            'subject' => $subject->id,
            'student' => $student->id,
            'enrollment' => $enrollment->id,
            'schedule' => $schedule->id,
            default => $val,
        };
    }

    $response = $this->actingAs($teacher)->call($method, route($route, $resolvedParams), $payload);

    expect(in_array($response->status(), [403, 302], true))->toBeTrue();
})->with([
    ['POST', 'cms.departments.store', [], ['name' => 'Test Dept']],
    ['PUT', 'cms.departments.update', ['department' => 1], ['name' => 'X']],
    ['DELETE', 'cms.departments.destroy', ['department' => 1], []],
    ['POST', 'cms.levels.store', [], ['name' => 'Y']],
    ['PUT', 'cms.levels.update', ['level' => 1], ['name' => 'Y']],
    ['DELETE', 'cms.levels.destroy', ['level' => 1], []],
    ['POST', 'cms.teachers.store', [], ['name' => 'Dr X']],
    ['PUT', 'cms.teachers.update', ['teacher' => 1], ['name' => 'Dr X']],
    ['DELETE', 'cms.teachers.destroy', ['teacher' => 1], []],
    ['POST', 'cms.subjects.store', [], ['name' => 'Sub']],
    ['PUT', 'cms.subjects.update', ['subject' => 1], ['name' => 'Sub']],
    ['DELETE', 'cms.subjects.destroy', ['subject' => 1], []],
    ['POST', 'cms.students.store', [], ['name' => 'Student']],
    ['PUT', 'cms.students.update', ['student' => 1], ['name' => 'Student']],
    ['DELETE', 'cms.students.destroy', ['student' => 1], []],
    ['POST', 'cms.students.import', [], []],
    ['GET', 'cms.students.export', [], []],
    ['POST', 'cms.enrollments.store', [], []],
    ['PUT', 'cms.enrollments.update', ['enrollment' => 1], []],
    ['DELETE', 'cms.enrollments.destroy', ['enrollment' => 1], []],
    ['POST', 'cms.enrollments.bulk', [], []],
    ['POST', 'cms.enrollments.approve', [], []],
    ['POST', 'cms.enrollments.reject', ['enrollment' => 1], []],
    ['POST', 'cms.schedules.store', [], []],
    ['PUT', 'cms.schedules.update', ['schedule' => 1], []],
    ['DELETE', 'cms.schedules.destroy', ['schedule' => 1], []],
    ['POST', 'cms.grades.import', [], []],
]);

it('blocks teacher directly at the controller level when cms.manage route middleware is bypassed', function () {
    $teacher = createUserWithRoles([UserRole::Teacher->value]);

    $dept = CmsDepartment::create(['name' => 'Direct Dept Check']);

    // Simulate route middleware being dropped by using withoutMiddleware for EnsureCmsManage
    $response = $this->withoutMiddleware(EnsureCmsManage::class)
        ->actingAs($teacher)
        ->delete(route('cms.departments.destroy', $dept));

    expect($response->status())->toBe(403);
    expect(CmsDepartment::find($dept->id))->not->toBeNull();
});

it('rejects image upload with dangerous client extension and does not write php file', function () {
    Storage::fake('public');

    $admin = createAdminUser();

    // Create a valid image but with dangerous .php extension
    $file = UploadedFile::fake()->create('shell.php', 100, 'image/png');

    $response = $this->actingAs($admin)->postJson(route('uploads.image'), [
        'file' => $file,
    ]);

    $response->assertStatus(422);

    // Verify no file ending in .php was written to public storage
    $files = Storage::disk('public')->allFiles();
    foreach ($files as $storedFile) {
        expect(str_ends_with($storedFile, '.php'))->toBeFalse();
    }
});

it('prevents content editor from deleting from settings folder but allows admin', function () {
    Storage::fake('public');

    $editor = createUserWithRoles([UserRole::ContentEditor->value]);
    $admin = createAdminUser();

    // Put a logo in settings/
    Storage::disk('public')->put('settings/logo.png', 'test content');

    // Content editor attempts to delete from settings
    $editorResponse = $this->actingAs($editor)->deleteJson(route('uploads.destroy'), [
        'path' => 'settings/logo.png',
    ]);

    $editorResponse->assertStatus(403);
    expect(Storage::disk('public')->exists('settings/logo.png'))->toBeTrue();

    // Admin attempts to delete from settings
    $adminResponse = $this->actingAs($admin)->deleteJson(route('uploads.destroy'), [
        'path' => 'settings/logo.png',
    ]);

    $adminResponse->assertStatus(200);
    expect(Storage::disk('public')->exists('settings/logo.png'))->toBeFalse();
});

it('ensures student export respects scopeStudentsForUser and blocks teachers from export endpoint', function () {
    // Seed department A (Teacher A, 10 students) and department B (Teacher B, 5 students)
    $deptA = CmsDepartment::create(['name' => 'Computer Science Dept A']);
    $deptB = CmsDepartment::create(['name' => 'Engineering Dept B']);

    $levelA = CmsLevel::create(['department_id' => $deptA->id, 'year' => 1, 'section' => 'A', 'capacity' => 50]);
    $levelB = CmsLevel::create(['department_id' => $deptB->id, 'year' => 1, 'section' => 'B', 'capacity' => 50]);

    $userTeacherA = createUserWithRoles([UserRole::Teacher->value]);
    $teacherA = CmsTeacher::create([
        'user_id' => $userTeacherA->id,
        'name' => 'Dr. Teacher A',
        'email' => $userTeacherA->email,
        'status' => 'active',
    ]);

    $userTeacherB = createUserWithRoles([UserRole::Teacher->value]);
    $teacherB = CmsTeacher::create([
        'user_id' => $userTeacherB->id,
        'name' => 'Dr. Teacher B',
        'email' => $userTeacherB->email,
        'status' => 'active',
    ]);

    $subjectA = CmsSubject::create([
        'department_id' => $deptA->id,
        'name' => 'CS 101',
        'code' => 'CS101',
        'credits' => 3,
        'semester' => 'first',
    ]);

    $subjectB = CmsSubject::create([
        'department_id' => $deptB->id,
        'name' => 'ENG 101',
        'code' => 'ENG101',
        'credits' => 3,
        'semester' => 'first',
    ]);

    // Teacher A teaches Subject A; Teacher B teaches Subject B
    CmsSchedule::create([
        'teacher_id' => $teacherA->id,
        'subject_id' => $subjectA->id,
        'level_id' => $levelA->id,
        'day' => 'sunday',
        'start_time' => '08:00',
        'end_time' => '10:00',
        'academic_year' => '2026',
        'semester' => 'first',
    ]);

    CmsSchedule::create([
        'teacher_id' => $teacherB->id,
        'subject_id' => $subjectB->id,
        'level_id' => $levelB->id,
        'day' => 'monday',
        'start_time' => '10:00',
        'end_time' => '12:00',
        'academic_year' => '2026',
        'semester' => 'first',
    ]);

    // 10 students in Dept A enrolled in Subject A
    for ($i = 1; $i <= 10; $i++) {
        $student = CmsStudent::create([
            'student_no' => 'STU-A-'.str_pad((string) $i, 3, '0', STR_PAD_LEFT),
            'name' => "Student A {$i}",
            'level_id' => $levelA->id,
            'status' => 'active',
            'enrollment_date' => '2026-09-01',
        ]);
        CmsEnrollment::create([
            'student_id' => $student->id,
            'subject_id' => $subjectA->id,
            'academic_year' => '2026',
            'semester' => 'first',
            'status' => 'active',
        ]);
    }

    // 5 students in Dept B enrolled in Subject B
    for ($i = 1; $i <= 5; $i++) {
        $student = CmsStudent::create([
            'student_no' => 'STU-B-'.str_pad((string) $i, 3, '0', STR_PAD_LEFT),
            'name' => "Student B {$i}",
            'level_id' => $levelB->id,
            'status' => 'active',
            'enrollment_date' => '2026-09-01',
        ]);
        CmsEnrollment::create([
            'student_id' => $student->id,
            'subject_id' => $subjectB->id,
            'academic_year' => '2026',
            'semester' => 'first',
            'status' => 'active',
        ]);
    }

    // 1. Direct call to export endpoint by Teacher A is blocked (403/302)
    $teacherResponse = $this->actingAs($userTeacherA)->get(route('cms.students.export'));
    expect(in_array($teacherResponse->status(), [403, 302], true))->toBeTrue();

    // 2. Query scoped via scopeStudentsForUser for Teacher A returns exactly 10 students
    $authService = app(CmsAuthorizationService::class);
    $queryA = CmsStudent::query();
    $authService->scopeStudentsForUser($queryA, $userTeacherA);
    expect($queryA->count())->toBe(10);

    // 3. Query scoped for Teacher B returns exactly 5 students
    $queryB = CmsStudent::query();
    $authService->scopeStudentsForUser($queryB, $userTeacherB);
    expect($queryB->count())->toBe(5);

    // 4. Admin calling export endpoint succeeds with 200
    $admin = createAdminUser();
    $adminResponse = $this->actingAs($admin)->get(route('cms.students.export'));
    $adminResponse->assertStatus(200);
});
