<?php

use App\Enums\UserRole;
use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\User;
use Spatie\Permission\Models\Role;

function actingScheduleAdmin(): User
{
    Role::firstOrCreate(['name' => UserRole::Admin->value, 'guard_name' => 'web']);

    $user = User::factory()->create();
    $user->assignRole(UserRole::Admin->value);

    return $user;
}

function createScheduleFixtures(): array
{
    $department = CmsDepartment::create(['name' => 'Science', 'description' => 'Science Dept']);
    $levelA = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
    $levelB = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'B', 'capacity' => 30]);
    $teacher = CmsTeacher::create(['name' => 'Dr. Assigned', 'email' => 'assigned@example.com', 'status' => 'active']);
    $subject = CmsSubject::create(['department_id' => $department->id, 'code' => 'CS201', 'name' => 'Data Structures', 'credits' => 3, 'semester' => 'first']);

    return compact('levelA', 'levelB', 'teacher', 'subject');
}

function schedulePayload(array $fixtures, array $overrides = []): array
{
    return array_merge([
        'subject_id' => $fixtures['subject']->id,
        'level_id' => $fixtures['levelA']->id,
        'day' => 'saturday',
        'start_time' => '09:00',
        'end_time' => '10:00',
        'room' => 'A1',
        'type' => 'lecture',
        'academic_year' => '2025-2026',
        'semester' => 'first',
    ], $overrides);
}

test('schedule can be created without an assigned teacher', function () {
    $admin = actingScheduleAdmin();
    $fixtures = createScheduleFixtures();

    $response = $this->actingAs($admin)->post('/cms/schedules', schedulePayload($fixtures));

    $response->assertRedirect(route('cms.schedules.index'));

    $schedule = CmsSchedule::where('subject_id', $fixtures['subject']->id)->first();
    expect($schedule)->not->toBeNull()
        ->and($schedule->teacher_id)->toBeNull();
});

test('schedule teacher can be removed on update', function () {
    $admin = actingScheduleAdmin();
    $fixtures = createScheduleFixtures();

    $schedule = CmsSchedule::create(array_merge(schedulePayload($fixtures), ['teacher_id' => $fixtures['teacher']->id]));

    $this->actingAs($admin)
        ->put("/cms/schedules/{$schedule->id}", schedulePayload($fixtures, ['teacher_id' => null]))
        ->assertRedirect(route('cms.schedules.index'));

    expect($schedule->fresh()->teacher_id)->toBeNull();
});

test('two unassigned schedules in the same slot raise no teacher conflict', function () {
    $admin = actingScheduleAdmin();
    $fixtures = createScheduleFixtures();

    CmsSchedule::create(array_merge(schedulePayload($fixtures), ['level_id' => $fixtures['levelA']->id]));

    $this->actingAs($admin)
        ->post('/cms/schedules', schedulePayload($fixtures, ['level_id' => $fixtures['levelB']->id, 'room' => null]))
        ->assertRedirect(route('cms.schedules.index'))
        ->assertSessionMissing('errors');

    expect(CmsSchedule::whereNull('teacher_id')->count())->toBe(2);
});

test('deleting a teacher keeps their schedules and clears the assignment', function () {
    $admin = actingScheduleAdmin();
    $fixtures = createScheduleFixtures();

    $schedule = CmsSchedule::create(array_merge(schedulePayload($fixtures), ['teacher_id' => $fixtures['teacher']->id]));
    $fixtures['teacher']->delete();

    expect($schedule->fresh())->not->toBeNull()
        ->and($schedule->fresh()->teacher_id)->toBeNull();
});
