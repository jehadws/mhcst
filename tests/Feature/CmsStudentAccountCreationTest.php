<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

function createLevelForStudents(): CmsLevel
{
    $department = CmsDepartment::create(['name' => 'CS', 'description' => 'CS Dept']);

    return CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
}

function studentStorePayload(CmsLevel $level, string $email): array
{
    return [
        'student_no' => '2026-0100',
        'name' => 'Student One',
        'email' => $email,
        'level_id' => $level->id,
        'enrollment_date' => now()->format('Y-m-d'),
        'status' => 'active',
        'create_user_account' => true,
        'password' => 'secret1234',
    ];
}

test('duplicate user email is rejected with a validation error, not a 500', function () {
    $admin = createAdminUser();
    $level = createLevelForStudents();

    User::factory()->create(['email' => 'taken@example.com']);

    $response = $this->actingAs($admin)
        ->post('/cms/students', studentStorePayload($level, 'taken@example.com'));

    $response->assertInvalid('email');
    expect(CmsStudent::where('student_no', '2026-0100')->exists())->toBeFalse();
});

test('student account creation links a user with the student role', function () {
    $admin = createAdminUser();
    $level = createLevelForStudents();

    $response = $this->actingAs($admin)
        ->post('/cms/students', studentStorePayload($level, 'new.student@example.com'));

    $response->assertRedirect(route('cms.students.index'));

    $user = User::where('email', 'new.student@example.com')->first();
    expect($user)->not->toBeNull()
        ->and($user->hasRole(UserRole::Student->value))->toBeTrue();

    $student = CmsStudent::where('student_no', '2026-0100')->first();
    expect($student)->not->toBeNull()
        ->and($student->user_id)->toBe($user->id);
});

test('failure after user creation rolls back cleanly leaving no orphan user', function () {
    $admin = createAdminUser();
    $level = createLevelForStudents();

    Role::firstOrCreate(['name' => UserRole::Student->value, 'guard_name' => 'web']);
    $roleAssignmentsBefore = DB::table('model_has_roles')->count();

    CmsStudent::creating(function () {
        throw new RuntimeException('Simulated failure after the user was created.');
    });

    $this->actingAs($admin)
        ->post('/cms/students', studentStorePayload($level, 'rolled.back@example.com'));

    expect(User::where('email', 'rolled.back@example.com')->exists())->toBeFalse()
        ->and(CmsStudent::where('student_no', '2026-0100')->exists())->toBeFalse()
        ->and(DB::table('model_has_roles')->count())->toBe($roleAssignmentsBefore);
});
