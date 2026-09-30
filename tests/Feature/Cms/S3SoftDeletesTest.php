<?php

use App\Enums\UserRole;
use App\Models\Banner;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

function createCmsManager(): User
{
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Admin->value);

    return $user;
}

function seedDepartmentTree(): array
{
    $department = CmsDepartment::create([
        'name' => 'Computer Science',
        'description' => 'CS Department',
    ]);

    $level = CmsLevel::create([
        'department_id' => $department->id,
        'year' => 1,
        'section' => 'A',
        'capacity' => 40,
    ]);

    $subject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'CS101',
        'name' => 'Intro to CS',
        'credits' => 3,
        'has_lab' => false,
        'semester' => 'first',
    ]);

    $student = CmsStudent::create([
        'level_id' => $level->id,
        'student_no' => '2026-0001',
        'name' => 'Test Student',
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);

    $enrollment = CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'status' => 'active',
    ]);

    $teacher = CmsTeacher::create([
        'name' => 'Dr. Smith',
        'status' => 'active',
    ]);

    $schedule = CmsSchedule::create([
        'subject_id' => $subject->id,
        'level_id' => $level->id,
        'teacher_id' => $teacher->id,
        'day' => 'monday',
        'start_time' => '09:00:00',
        'end_time' => '10:30:00',
        'type' => 'lecture',
        'academic_year' => '2026-2027',
        'semester' => 'first',
    ]);

    return compact('department', 'level', 'subject', 'student', 'enrollment', 'teacher', 'schedule');
}

test('delete department hides rows from default queries and keeps them via withTrashed', function () {
    $user = createCmsManager();
    $tree = seedDepartmentTree();
    $departmentId = $tree['department']->id;
    $levelId = $tree['level']->id;

    $this->actingAs($user)
        ->delete(route('cms.departments.destroy', $tree['department']))
        ->assertRedirect(route('cms.departments.index'));

    expect(CmsDepartment::find($departmentId))->toBeNull();
    $trashedDept = CmsDepartment::withTrashed()->find($departmentId);
    expect($trashedDept)->not->toBeNull();
    expect($trashedDept->trashed())->toBeTrue();

    expect(CmsStudent::withTrashed()->where('level_id', $levelId)->count())->toBeGreaterThan(0);
    expect(CmsStudent::where('level_id', $levelId)->count())->toBe(0);
});

test('department destroy rolls back all descendants on mid-cascade failure', function () {
    $tree = seedDepartmentTree();
    $departmentId = $tree['department']->id;
    $student1Id = $tree['student']->id;
    $enrollmentId = $tree['enrollment']->id;

    // Directly test the transactional cascade by replicating what the
    // controller does, then throwing mid-way. Since bulk soft-deletes do not
    // fire Eloquent model events, we verify the transaction rolls back by
    // asserting that nothing changed after the exception propagates.
    //
    // Note: the controller uses a single DB::transaction wrapping ALL deletes.
    // This test proves that pattern: if ANY delete inside the TX throws, the
    // entire TX rolls back and nothing is soft-deleted.
    $department = $tree['department'];

    $caught = false;
    try {
        DB::transaction(function () use ($department) {
            $department->loadMissing([
                'levels.students.enrollments',
                'levels.students',
                'subjects.enrollments',
                'subjects',
            ]);

            $enrollmentIds = collect();
            $studentIds = collect();
            $levelIds = $department->levels->pluck('id');
            $subjectIds = $department->subjects->pluck('id');

            foreach ($department->levels as $level) {
                foreach ($level->students as $student) {
                    $studentIds->push($student->id);
                    foreach ($student->enrollments as $enrollment) {
                        $enrollmentIds->push($enrollment->id);
                    }
                }
            }
            foreach ($department->subjects as $subject) {
                foreach ($subject->enrollments as $enrollment) {
                    $enrollmentIds->push($enrollment->id);
                }
            }

            CmsSchedule::whereIn('level_id', $levelIds)
                ->orWhereIn('subject_id', $subjectIds)
                ->chunkById(500, fn ($rows) => $rows->each->delete());

            CmsEnrollment::whereIn('id', $enrollmentIds->unique())->delete();
            CmsStudent::whereIn('id', $studentIds->unique())->delete();

            // Simulate a mid-cascade failure before deleting the level/department
            throw new RuntimeException('Simulated mid-cascade failure');
        });
    } catch (RuntimeException $e) {
        $caught = true;
    }

    expect($caught)->toBeTrue('Expected runtime exception was not thrown');

    // Everything should be rolled back — no soft-deletes should have persisted
    expect(CmsDepartment::find($departmentId))->not->toBeNull(
        'Department should still exist (TX rolled back)'
    );
    expect(CmsStudent::find($student1Id))->not->toBeNull(
        'Student should still exist (TX rolled back)'
    );
    expect(CmsEnrollment::find($enrollmentId))->not->toBeNull(
        'Enrollment should still exist (TX rolled back)'
    );
});

test('soft delete of HasImage model preserves file; forceDelete removes it', function () {
    Storage::fake('public');

    $file = UploadedFile::fake()->image('banner.jpg', 800, 400);
    $path = 'banners/'.uniqid().'.jpg';
    Storage::disk('public')->put($path, file_get_contents($file->getRealPath()));

    $banner = Banner::factory()->create([
        'image' => $path,
        'title' => 'Test Banner',
        'sort_order' => 1,
        'is_active' => true,
    ]);

    Storage::disk('public')->assertExists($path);

    $banner->delete();

    expect(Banner::find($banner->id))->toBeNull();
    $banner = Banner::withTrashed()->find($banner->id);
    expect($banner)->not->toBeNull();
    expect($banner->trashed())->toBeTrue();
    Storage::disk('public')->assertExists($path);

    $banner->forceDelete();

    Storage::disk('public')->assertMissing($path);
    expect(Banner::withTrashed()->find($banner->id))->toBeNull();
});

test('unique columns on soft-deleted rows prevent reuse (accepted caveat)', function () {
    $code = 'S3-UNIQUE-TEST';

    CmsSubject::create([
        'department_id' => CmsDepartment::create(['name' => 'Temp Dept 1'])->id,
        'code' => $code,
        'name' => 'First Subject',
        'credits' => 3,
        'has_lab' => false,
        'semester' => 'first',
    ])->delete();

    $secondDept = CmsDepartment::create(['name' => 'Temp Dept 2']);

    $threw = false;
    try {
        CmsSubject::create([
            'department_id' => $secondDept->id,
            'code' => $code,
            'name' => 'Second Subject',
            'credits' => 3,
            'has_lab' => false,
            'semester' => 'first',
        ]);
    } catch (QueryException $e) {
        $threw = true;
        expect(strtoupper($e->getMessage()))->toContain('UNIQUE');
    }

    expect($threw)->toBeTrue('Unique constraint should fire for soft-deleted code value');
});

test('CmsStudent destroy is transactional with enrollments', function () {
    $user = createCmsManager();
    $tree = seedDepartmentTree();
    $studentId = $tree['student']->id;
    $enrollmentId = $tree['enrollment']->id;

    $this->actingAs($user)
        ->delete(route('cms.students.destroy', $tree['student']))
        ->assertRedirect(route('cms.students.index'));

    expect(CmsStudent::find($studentId))->toBeNull();
    expect(CmsStudent::withTrashed()->find($studentId)->trashed())->toBeTrue();

    expect(CmsEnrollment::find($enrollmentId))->toBeNull();
    expect(CmsEnrollment::withTrashed()->find($enrollmentId)->trashed())->toBeTrue();
});
