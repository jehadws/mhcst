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

test('deleting a teacher via controller soft-deletes their schedules', function () {
    $admin = actingScheduleAdmin();
    $fixtures = createScheduleFixtures();

    $schedule = CmsSchedule::create(array_merge(schedulePayload($fixtures), ['teacher_id' => $fixtures['teacher']->id]));
    $scheduleId = $schedule->id;

    // Delete via HTTP endpoint so the controller cascade runs.
    $this->actingAs($admin)
        ->delete(route('cms.teachers.destroy', $fixtures['teacher']))
        ->assertRedirect(route('cms.teachers.index'));

    // Schedule is soft-deleted (not just nullified) per S3 cascade semantics.
    expect(CmsSchedule::find($scheduleId))->toBeNull(
        'Schedule should be hidden from default queries after teacher cascade soft-delete'
    );
    expect(CmsSchedule::withTrashed()->find($scheduleId))->not->toBeNull(
        'Schedule should still exist via withTrashed — it was soft-deleted, not hard-deleted'
    );
    expect(CmsSchedule::withTrashed()->find($scheduleId)->trashed())->toBeTrue();
});

test('schedule pages render for a schedule without a teacher', function () {
    $admin = actingScheduleAdmin();
    $fixtures = createScheduleFixtures();

    $schedule = CmsSchedule::create(schedulePayload($fixtures));

    $this->actingAs($admin)->get('/cms/schedules')->assertOk();
    $this->actingAs($admin)->get("/cms/schedules/{$schedule->id}")->assertOk();
    $this->actingAs($admin)->get("/cms/schedules/{$schedule->id}/edit")->assertOk();
    $this->actingAs($admin)->get('/cms/reports/schedule')->assertOk();
});
