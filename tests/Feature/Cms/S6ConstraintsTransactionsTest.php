<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\CmsAcademicSettingsService;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

function s6CreateAdmin(): User
{
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Teacher->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Admin->value);

    return $user;
}

test('duplicate dept, year, section is rejected via validation and db constraint', function () {
    $admin = s6CreateAdmin();

    $department = CmsDepartment::create([
        'name' => 'Computer Science',
        'code' => 'CS',
        'description' => 'CS Dept',
    ]);

    CmsLevel::create([
        'department_id' => $department->id,
        'year' => 1,
        'section' => 'A',
        'capacity' => 40,
    ]);

    // Validation check via StoreLevelRequest
    $response = $this->actingAs($admin)->post(route('cms.levels.store'), [
        'department_id' => $department->id,
        'year' => 1,
        'section' => 'A',
        'capacity' => 30,
    ]);

    $response->assertSessionHasErrors('section');

    // DB constraint check directly
    expect(fn () => DB::table('cms_levels')->insert([
        'department_id' => $department->id,
        'year' => 1,
        'section' => 'A',
        'capacity' => 35,
        'created_at' => now(),
        'updated_at' => now(),
    ]))->toThrow(QueryException::class);
});

test('failed teacher creation leaves no orphan user or role assignment', function () {
    $admin = s6CreateAdmin();

    $department = CmsDepartment::create([
        'name' => 'Engineering',
        'code' => 'ENG',
    ]);

    // Hook model creating to simulate a database failure midway
    CmsTeacher::creating(function () {
        throw new Exception('Simulated database failure during teacher insertion');
    });

    try {
        $this->actingAs($admin)->post(route('cms.teachers.store'), [
            'name' => 'Dr. Rollback',
            'email' => 'dr.rollback@example.com',
            'phone' => '123456789',
            'department_id' => $department->id,
            'specialization' => 'Networks',
            'status' => 'active',
            'create_user_account' => true,
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);
    } catch (Throwable $e) {
        // Expected thrown exception
    }

    // Clear event listener to avoid side effects
    CmsTeacher::flushEventListeners();

    // Assert that User was NOT persisted
    expect(User::where('email', 'dr.rollback@example.com')->count())->toBe(0);
    expect(CmsTeacher::where('name', 'Dr. Rollback')->count())->toBe(0);
});

test('failure midway through bulkEnroll rolls back all created enrollments', function () {
    $admin = s6CreateAdmin();

    $department = CmsDepartment::create([
        'name' => 'Business',
        'code' => 'BUS',
    ]);

    $level = CmsLevel::create([
        'department_id' => $department->id,
        'year' => 1,
        'section' => 'B',
        'capacity' => 50,
    ]);

    $subject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'BUS101',
        'name' => 'Intro to Business',
        'credits' => 3,
        'semester' => 'first',
    ]);

    $students = [];
    for ($i = 1; $i <= 3; $i++) {
        $students[] = CmsStudent::create([
            'level_id' => $level->id,
            'student_no' => "BUS-00{$i}",
            'name' => "Student {$i}",
            'enrollment_date' => now()->toDateString(),
            'status' => 'active',
        ]);
    }

    $createdCounter = 0;
    CmsEnrollment::saving(function () use (&$createdCounter) {
        $createdCounter++;
        if ($createdCounter >= 2) {
            throw new Exception('Simulated failure during second student enrollment');
        }
    });

    try {
        $this->actingAs($admin)->post(route('cms.enrollments.bulk'), [
            'level_id' => $level->id,
            'subject_id' => $subject->id,
            'academic_year' => '2026-2027',
            'semester' => 'first',
        ]);
    } catch (Throwable $e) {
        // Expected
    }

    CmsEnrollment::flushEventListeners();

    // Assert that complete rollback occurred (0 enrollments, not 1)
    expect(CmsEnrollment::where('subject_id', $subject->id)->count())->toBe(0);
});

test('capacity is enforced even via bulkEnroll', function () {
    $admin = s6CreateAdmin();

    $department = CmsDepartment::create([
        'name' => 'Math',
        'code' => 'MATH',
    ]);

    // Level with capacity = 1
    $level = CmsLevel::create([
        'department_id' => $department->id,
        'year' => 2,
        'section' => 'M',
        'capacity' => 1,
    ]);

    $subject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'MATH201',
        'name' => 'Calculus II',
        'credits' => 3,
        'semester' => 'first',
    ]);

    for ($i = 1; $i <= 3; $i++) {
        CmsStudent::create([
            'level_id' => $level->id,
            'student_no' => "MATH-00{$i}",
            'name' => "Math Student {$i}",
            'enrollment_date' => now()->toDateString(),
            'status' => 'active',
        ]);
    }

    $response = $this->actingAs($admin)->post(route('cms.enrollments.bulk'), [
        'level_id' => $level->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
    ]);

    $response->assertRedirect(route('cms.enrollments.index'));

    // Capacity is 1, so only 1 student should be enrolled
    expect(CmsEnrollment::where('subject_id', $subject->id)->count())->toBe(1);
});

test('updateSettings rolls back all settings when a failure occurs midway', function () {
    // Initial known values
    SiteSetting::updateOrCreate(['key' => 'cms.academic_year'], ['value' => '2025-2026', 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'cms.semester_start'], ['value' => '2025-09-01', 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'cms.semester_end'], ['value' => '2026-01-31', 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'cms.consecutive_absence_threshold'], ['value' => '3', 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'cms.absence_rate_threshold'], ['value' => '20', 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'cms.current_semester'], ['value' => 'first', 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'cms.subject_registration_open'], ['value' => '1', 'type' => 'text']);

    $initialSettings = SiteSetting::where('key', 'like', 'cms.%')->pluck('value', 'key')->toArray();

    $service = app(CmsAcademicSettingsService::class);

    SiteSetting::saving(function ($model) {
        if ($model->key === 'cms.consecutive_absence_threshold') {
            throw new Exception('Simulated crash on saving consecutive_absence_threshold');
        }
    });

    try {
        $service->updateSettings([
            'grade_entry_deadline' => '2026-10-01',
            'grades_locked' => true,
            'academic_year' => '2026-2027',
            'semester_start' => '2026-09-15',
            'semester_end' => '2027-02-15',
            'consecutive_absence_threshold' => 5,
            'absence_rate_threshold' => 25,
            'current_semester' => 'second',
            'subject_registration_open' => false,
        ]);
    } catch (Throwable $e) {
        // Expected
    }

    SiteSetting::flushEventListeners();

    // Assert that settings are completely unchanged
    $currentSettings = SiteSetting::where('key', 'like', 'cms.%')->pluck('value', 'key')->toArray();
    expect($currentSettings)->toEqual($initialSettings);
});
