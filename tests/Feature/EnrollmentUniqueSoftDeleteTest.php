<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\User;
use Spatie\Permission\Models\Role;

function makeManagerForEnrollmentTest(): User
{
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole(UserRole::Admin->value);

    return $user;
}

function enrollmentTestTree(): array
{
    $dept = CmsDepartment::create(['name' => 'EUT-'.uniqid()]);
    $level = CmsLevel::create(['department_id' => $dept->id, 'year' => 1, 'section' => 'A', 'capacity' => 40]);
    $subject = CmsSubject::create([
        'department_id' => $dept->id,
        'code' => 'TST-'.uniqid(),
        'name' => 'Test Subject',
        'credits' => 3,
        'has_lab' => false,
        'semester' => 'first',
    ]);
    $student = CmsStudent::create([
        'level_id' => $level->id,
        'student_no' => 'SN-'.uniqid(),
        'name' => 'Test Student',
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);

    return compact('dept', 'level', 'subject', 'student');
}

test('soft-deleted enrollment can be recreated without QueryException', function () {
    $manager = makeManagerForEnrollmentTest();
    ['student' => $student, 'subject' => $subject] = enrollmentTestTree();

    // Create initial enrollment
    $originalId = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'status' => 'active',
    ])->id;

    // Soft-delete it via the controller
    $this->actingAs($manager)
        ->delete(route('cms.enrollments.destroy', $originalId))
        ->assertRedirect(route('cms.enrollments.index'));

    expect(CmsEnrollment::find($originalId))->toBeNull();
    expect(CmsEnrollment::withTrashed()->find($originalId)->trashed())->toBeTrue();

    // Re-create via bulkEnroll — should restore, not crash
    $response = $this->actingAs($manager)->post(route('cms.enrollments.bulk'), [
        'level_id' => $student->level_id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
    ]);

    $response->assertRedirect(route('cms.enrollments.index'));

    // Only one row in the table for this combo (restored)
    expect(
        CmsEnrollment::withTrashed()
            ->where('student_id', $student->id)
            ->where('subject_id', $subject->id)
            ->where('academic_year', '2026-2027')
            ->where('semester', 'first')
            ->count()
    )->toBe(1);

    $restored = CmsEnrollment::where('student_id', $student->id)
        ->where('subject_id', $subject->id)
        ->where('academic_year', '2026-2027')
        ->where('semester', 'first')
        ->first();

    expect($restored)->not->toBeNull();
    expect($restored->trashed())->toBeFalse();
    expect($restored->id)->toBe($originalId);
});

test('store enrollment for trashed-parent returns validation error not 500', function () {
    $manager = makeManagerForEnrollmentTest();
    ['student' => $student, 'subject' => $subject] = enrollmentTestTree();

    // Soft-delete the student
    $student->delete();

    $response = $this->actingAs($manager)->post(route('cms.enrollments.store'), [
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'status' => 'active',
    ]);

    // Should be a validation failure (422), not a 500
    $response->assertSessionHasErrors(['student_id']);
    expect(CmsEnrollment::count())->toBe(0);
});
