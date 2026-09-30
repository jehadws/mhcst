<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\User;
use Spatie\Permission\Models\Role;

function makeDestroyManager(): User
{
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    $user = User::factory()->create();
    $user->assignRole(UserRole::Admin->value);

    return $user;
}

test('department destroy executes only scalar pluck queries (no mass model hydration)', function () {
    $manager = makeDestroyManager();

    $dept = CmsDepartment::create(['name' => 'MemTest-'.uniqid()]);
    $level = CmsLevel::create(['department_id' => $dept->id, 'year' => 1, 'section' => 'A', 'capacity' => 40]);
    $subject = CmsSubject::create([
        'department_id' => $dept->id,
        'code' => 'MEM-'.uniqid(),
        'name' => 'Memory Test Subject',
        'credits' => 3,
        'has_lab' => false,
        'semester' => 'first',
    ]);

    // Create 40 students with enrollments (mimics a full section)
    collect(range(1, 40))->each(function ($i) use ($level, $subject) {
        $student = CmsStudent::create([
            'level_id' => $level->id,
            'student_no' => 'MEM-'.uniqid(),
            'name' => "Student {$i}",
            'enrollment_date' => now()->toDateString(),
            'status' => 'active',
        ]);
        CmsEnrollment::create([
            'student_id' => $student->id,
            'subject_id' => $subject->id,
            'academic_year' => '2026-2027',
            'semester' => 'first',
            'status' => 'active',
        ]);
    });

    expect(CmsStudent::where('level_id', $level->id)->count())->toBe(40);
    expect(CmsEnrollment::where('subject_id', $subject->id)->count())->toBe(40);

    $hydrationCount = 0;

    // Count how many times models are hydrated DURING the destroy call.
    // Listeners are registered after the setup phase so we don't accidentally
    // count hydrations triggered by the ->count() calls above.
    CmsStudent::retrieved(function () use (&$hydrationCount) {
        $hydrationCount++;
    });
    CmsEnrollment::retrieved(function () use (&$hydrationCount) {
        $hydrationCount++;
    });

    $this->actingAs($manager)
        ->delete(route('cms.departments.destroy', $dept))
        ->assertRedirect(route('cms.departments.index'));

    // With the pluck-query approach, no Student or Enrollment models should be
    // hydrated during destroy (only scalar IDs are fetched).
    expect($hydrationCount)->toBe(0, "Expected 0 hydrated Student/Enrollment models; got {$hydrationCount}. The old eager-load path is still running.");

    expect(CmsStudent::where('level_id', $level->id)->count())->toBe(0);
    expect(CmsEnrollment::where('subject_id', $subject->id)->count())->toBe(0);
    expect(CmsDepartment::find($dept->id))->toBeNull();
});
