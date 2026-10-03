<?php

use App\Enums\UserRole;
use App\Models\CmsAttendance;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsGradeRevision;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

// Phase 6 cleanup (user-approved 2026-10-02): the schema and cascade
// decisions are pinned here so they cannot regress silently.
// Phase 7 reversal (user-approved): the enrollment-destroy cascade no longer
// hard-deletes recorded grades/attendance — the CmsDeletionGuard refuses it.

it('drops the legacy users.role_id column (spatie roles are authoritative)', function () {
    expect(Schema::hasColumn('users', 'role_id'))->toBeFalse();
});

it('refuses to destroy an enrollment that carries grades, attendance or revisions', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $department = CmsDepartment::create(['name' => 'Cleanup Dept', 'description' => 'testing']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
    $subject = CmsSubject::create(['department_id' => $department->id, 'code' => 'CL-101', 'name' => 'Cleanup Subject', 'credits' => 3, 'semester' => 'first']);
    $student = CmsStudent::create(['student_no' => 'CL-0001', 'name' => 'Cleanup Student', 'level_id' => $level->id, 'enrollment_date' => now()->toDateString(), 'status' => 'active']);

    $enrollment = CmsEnrollment::create(['student_id' => $student->id, 'subject_id' => $subject->id, 'academic_year' => '2026-2027', 'semester' => 'first', 'status' => 'active', 'source' => 'admin']);

    $grade = CmsGrade::create(['enrollment_id' => $enrollment->id, 'midterm' => 25, 'final' => 40, 'entered_by' => $admin->id, 'entered_at' => now()]);
    CmsAttendance::create(['enrollment_id' => $enrollment->id, 'date' => now(), 'status' => 'absent']);
    CmsGradeRevision::create(['grade_id' => $grade->id, 'enrollment_id' => $enrollment->id, 'changed_by' => $admin->id, 'old_values' => ['midterm' => 20], 'new_values' => ['midterm' => 25]]);

    $this->actingAs($admin)->delete(route('cms.enrollments.destroy', $enrollment))->assertSessionHasErrors('delete');

    // Nothing is erased and nothing is trashed: the pick must be withdrawn
    // instead of deleted.
    expect(CmsEnrollment::withTrashed()->find($enrollment->id)->trashed())->toBeFalse()
        ->and(CmsGrade::where('enrollment_id', $enrollment->id)->count())->toBe(1)
        ->and(CmsAttendance::where('enrollment_id', $enrollment->id)->count())->toBe(1)
        ->and(CmsGradeRevision::where('enrollment_id', $enrollment->id)->count())->toBe(1);
});

it('keeps other enrollments untouched when one enrollment is destroyed', function () {
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $department = CmsDepartment::create(['name' => 'Cleanup Dept 2', 'description' => 'testing']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'B', 'capacity' => 30]);
    $subject = CmsSubject::create(['department_id' => $department->id, 'code' => 'CL-201', 'name' => 'Cleanup Subject 2', 'credits' => 3, 'semester' => 'first']);
    $student = CmsStudent::create(['student_no' => 'CL-0002', 'name' => 'Cleanup Student 2', 'level_id' => $level->id, 'enrollment_date' => now()->toDateString(), 'status' => 'active']);

    $doomed = CmsEnrollment::create(['student_id' => $student->id, 'subject_id' => $subject->id, 'academic_year' => '2026-2027', 'semester' => 'first', 'status' => 'active', 'source' => 'admin']);
    $survivor = CmsEnrollment::create(['student_id' => $student->id, 'subject_id' => $subject->id, 'academic_year' => '2025-2026', 'semester' => 'first', 'status' => 'completed', 'source' => 'admin']);

    CmsGrade::create(['enrollment_id' => $survivor->id, 'midterm' => 25, 'final' => 40, 'entered_by' => $admin->id, 'entered_at' => now()]);

    $this->actingAs($admin)->delete(route('cms.enrollments.destroy', $doomed))->assertRedirect();

    expect($doomed->refresh()->trashed())->toBeTrue()
        ->and($survivor->refresh()->trashed())->toBeFalse()
        ->and(CmsGrade::where('enrollment_id', $survivor->id)->count())->toBe(1);
});
