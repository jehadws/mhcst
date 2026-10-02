<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\CmsEnrollmentCapacityService;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

function capacityFixture(int $capacity): array
{
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);
    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);

    $admin = User::factory()->create();
    $admin->assignRole(UserRole::Admin->value);

    $department = CmsDepartment::create(['name' => 'Cap Dept', 'description' => 'Capacity test dept']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => $capacity]);
    $subject = CmsSubject::create([
        'department_id' => $department->id,
        'code' => 'CAP101',
        'name' => 'Capacity Subject',
        'credits' => 3,
        'semester' => 'first',
    ]);

    return [$admin, $department, $level, $subject];
}

function capacityStudent(CmsLevel $level, string $no, string $status = 'active'): CmsStudent
{
    return CmsStudent::create([
        'level_id' => $level->id,
        'student_no' => $no,
        'name' => "Student {$no}",
        'enrollment_date' => now()->toDateString(),
        'status' => $status,
    ]);
}

function capacityEnrollment(int $studentId, int $subjectId, string $status = 'active', string $source = 'admin'): CmsEnrollment
{
    return CmsEnrollment::create([
        'student_id' => $studentId,
        'subject_id' => $subjectId,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'enrollment_date' => now(),
        'status' => $status,
        'source' => $source,
    ]);
}

function setSelfRegistrationTermOpen(): void
{
    SiteSetting::updateOrCreate(['key' => 'cms.academic_year'], ['value' => '2026-2027', 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'cms.current_semester'], ['value' => 'first', 'type' => 'text']);
    SiteSetting::updateOrCreate(['key' => 'cms.subject_registration_open'], ['value' => '1', 'type' => 'text']);
}

test('admin store into a full section is rejected with a capacity error', function () {
    [$admin, , $level, $subject] = capacityFixture(1);
    $seated = capacityStudent($level, 'CAP-0001');
    $candidate = capacityStudent($level, 'CAP-0002');
    capacityEnrollment($seated->id, $subject->id);

    $this->actingAs($admin)->post(route('cms.enrollments.store'), [
        'student_id' => $candidate->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'status' => 'active',
    ])->assertSessionHasErrors('subject_id');

    expect(CmsEnrollment::where('student_id', $candidate->id)->count())->toBe(0);
});

test('assertSeatAvailable throws when the section is full and passes when a seat exists', function () {
    [, , $level, $subject] = capacityFixture(1);
    $student = capacityStudent($level, 'CAP-0100');
    $service = app(CmsEnrollmentCapacityService::class);

    DB::transaction(function () use ($service, $level, $subject): void {
        $service->assertSeatAvailable($level, $subject->id, '2026-2027', 'first');
    });

    capacityEnrollment($student->id, $subject->id);

    DB::transaction(function () use ($service, $level, $subject): void {
        try {
            $service->assertSeatAvailable($level, $subject->id, '2026-2027', 'first');
            $this->fail('Expected the full section to be rejected.');
        } catch (ValidationException $exception) {
            expect($exception->errors()['subject_id'][0])->toContain('مكتملة');
        }
    });
});

test('a committed active seat blocks the next candidate on a fresh transaction', function () {
    [, , $level, $subject] = capacityFixture(1);
    $student = capacityStudent($level, 'CAP-0031');
    $service = app(CmsEnrollmentCapacityService::class);

    DB::transaction(function () use ($service, $level, $subject, $student): void {
        $service->assertSeatAvailable($level, $subject->id, '2026-2027', 'first');
        capacityEnrollment($student->id, $subject->id);
    });

    expect(fn () => DB::transaction(function () use ($service, $level, $subject): void {
        $service->assertSeatAvailable($level, $subject->id, '2026-2027', 'first');
    }))->toThrow(ValidationException::class);
});

test('approval approves what fits, leaves the rest pending, and reports the skipped subjects', function () {
    [$admin, , $level, $subject] = capacityFixture(2);
    $seated = capacityStudent($level, 'CAP-0011');
    $first = capacityStudent($level, 'CAP-0012');
    $second = capacityStudent($level, 'CAP-0013');
    capacityEnrollment($seated->id, $subject->id);

    $pendingFirst = capacityEnrollment($first->id, $subject->id, 'pending', 'self');
    $pendingSecond = capacityEnrollment($second->id, $subject->id, 'pending', 'self');

    $this->actingAs($admin)
        ->post(route('cms.enrollments.approve'), ['enrollment_ids' => [$pendingFirst->id, $pendingSecond->id]])
        ->assertRedirect(route('cms.enrollments.index'))
        ->assertSessionHas('success', function (string $message) {
            return str_contains($message, 'Approved 1 registration successfully.')
                && str_contains($message, 'مكتملة العدد')
                && str_contains($message, 'CAP101');
        });

    expect($pendingFirst->refresh()->status)->toBe('active')
        ->and($pendingSecond->refresh()->status)->toBe('pending');
});

test('self-registration into a full section is rejected naming the subject', function () {
    [, $department, $level, $subject] = capacityFixture(1);
    $seated = capacityStudent($level, 'CAP-0021');
    capacityEnrollment($seated->id, $subject->id);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Student->value);
    $selfStudent = capacityStudent($level, 'CAP-0022');
    $selfStudent->update(['user_id' => $user->id]);

    setSelfRegistrationTermOpen();

    $this->actingAs($user)
        ->post(route('dashboard.subject-registration.store'), ['subject_ids' => [$subject->id]])
        ->assertSessionHasErrors('subject_ids');

    expect(CmsEnrollment::where('student_id', $selfStudent->id)->count())->toBe(0);
});

test('isDuplicateEnrollmentViolation recognises unique index errors from all drivers', function () {
    $mysql = new PDOException('SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry');
    $mysql->errorInfo = ['23000', 1062, "Duplicate entry '1' for key 'cms_enrollments_unique_term'"];

    $sqlite = new PDOException('SQLSTATE[23000]: Integrity constraint violation: 19 UNIQUE constraint failed: cms_enrollments.student_id');
    $sqlite->errorInfo = ['23000', 19, 'UNIQUE constraint failed: cms_enrollments.student_id'];

    $postgres = new PDOException('SQLSTATE[23505]: duplicate key value violates unique constraint');
    $postgres->errorInfo = ['23505', 7, 'duplicate key value violates unique constraint'];

    $other = new PDOException('SQLSTATE[42S22]: Column not found');
    $other->errorInfo = ['42S22', 1054, 'Unknown column'];

    expect(CmsEnrollmentCapacityService::isDuplicateEnrollmentViolation(new QueryException('sqlite', 'insert ...', [], $mysql)))->toBeTrue()
        ->and(CmsEnrollmentCapacityService::isDuplicateEnrollmentViolation(new QueryException('sqlite', 'insert ...', [], $sqlite)))->toBeTrue()
        ->and(CmsEnrollmentCapacityService::isDuplicateEnrollmentViolation(new QueryException('sqlite', 'insert ...', [], $postgres)))->toBeTrue()
        ->and(CmsEnrollmentCapacityService::isDuplicateEnrollmentViolation(new QueryException('sqlite', 'insert ...', [], $other)))->toBeFalse();
});

test('the level row lock serializes concurrent capacity writers', function () {
    if (DB::connection()->getDriverName() !== 'mysql') {
        $this->markTestSkipped('lockForUpdate is a no-op on SQLite — run this test against MySQL (the production database) to prove row locking.');
    }

    [, , $level] = capacityFixture(1);

    $lockQuery = 'select * from cms_levels where id = ? for update';

    DB::beginTransaction();
    DB::select($lockQuery, [$level->id]);

    config(['database.connections.mysql_lockcheck' => array_merge(
        config('database.connections.mysql'),
        ['name' => 'mysql_lockcheck'],
    )]);

    $second = DB::connection('mysql_lockcheck');
    $second->statement('set session innodb_lock_wait_timeout = 1');
    $second->beginTransaction();

    $blocked = false;
    try {
        $second->select($lockQuery, [$level->id]);
    } catch (QueryException) {
        // Expected: the second writer must wait on connection A's row lock.
        $blocked = true;
    } finally {
        $second->rollBack();
    }

    DB::rollBack();

    expect($blocked)->toBeTrue();
});
