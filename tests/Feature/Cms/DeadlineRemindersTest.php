<?php

use App\Mail\CmsNotificationMail;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use App\Models\CmsTerm;
use App\Models\NotificationsLog;
use App\Models\SiteSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function reminder_seedWorld(): array
{
    $department = CmsDepartment::create(['name' => 'Reminder Dept', 'description' => 'testing']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
    $subject = CmsSubject::create(['department_id' => $department->id, 'code' => 'RM-101', 'name' => 'Reminder Subject', 'credits' => 3, 'semester' => 'first']);

    $studentUser = User::factory()->create(['email' => 'remind-student@example.test']);
    $registeredUser = User::factory()->create(['email' => 'remind-registered@example.test']);

    $idleStudent = CmsStudent::create([
        'user_id' => $studentUser->id,
        'student_no' => 'RM-0001',
        'name' => 'Idle Student',
        'email' => $studentUser->email,
        'level_id' => $level->id,
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);

    $registeredStudent = CmsStudent::create([
        'user_id' => $registeredUser->id,
        'student_no' => 'RM-0002',
        'name' => 'Registered Student',
        'email' => $registeredUser->email,
        'level_id' => $level->id,
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);

    $teacherUser = User::factory()->create(['email' => 'remind-teacher@example.test']);
    $teacher = CmsTeacher::create(['user_id' => $teacherUser->id, 'name' => 'Dr. Reminder', 'email' => $teacherUser->email, 'status' => 'active']);

    // A second teacher without any schedule must not be reminded.
    $scheduleLessTeacherUser = User::factory()->create(['email' => 'remind-idle-teacher@example.test']);
    CmsTeacher::create(['user_id' => $scheduleLessTeacherUser->id, 'name' => 'Dr. Idle', 'email' => $scheduleLessTeacherUser->email, 'status' => 'active']);

    return [$level, $subject, $idleStudent, $registeredStudent, $teacher, $teacherUser];
}

function reminder_activateTerm(array $dates): CmsTerm
{
    return CmsTerm::create([
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'registration_starts_at' => $dates['registration_starts_at'] ?? null,
        'registration_ends_at' => $dates['registration_ends_at'] ?? null,
        'add_drop_deadline' => $dates['add_drop_deadline'] ?? null,
        'is_active' => true,
    ]);
}

// ---------------------------------------------------------------------------
// Registration deadline reminders
// ---------------------------------------------------------------------------

it('reminds students who have not picked any subject before the registration deadline', function () {
    Mail::fake();
    [, $subject, $idleStudent, $registeredStudent] = reminder_seedWorld();
    reminder_activateTerm(['registration_ends_at' => today()->addDays(2)]);

    // The registered student already holds an active pick for the term.
    CmsEnrollment::create([
        'student_id' => $registeredStudent->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'status' => 'active',
        'source' => 'admin',
    ]);

    $this->artisan('cms:send-deadline-reminders')->assertSuccessful();

    Mail::assertQueued(CmsNotificationMail::class, function (CmsNotificationMail $mail) {
        return $mail->triggerEvent === 'term.registration_deadline'
            && $mail->recipient === 'remind-student@example.test'
            && str_contains($mail->body, today()->addDays(2)->toDateString());
    });

    // Only the idle student is reminded; the registered one is not.
    expect(NotificationsLog::query()->where('recipient', 'remind-registered@example.test')->count())->toBe(0);
});

it('reminds students with pending picks before the add/drop deadline and dedupes on re-run', function () {
    Mail::fake();
    [$level, $subject] = reminder_seedWorld();

    $pendingUser = User::factory()->create(['email' => 'remind-pending@example.test']);
    $pendingStudent = CmsStudent::create([
        'user_id' => $pendingUser->id,
        'student_no' => 'RM-0003',
        'name' => 'Pending Student',
        'email' => $pendingUser->email,
        'level_id' => $level->id,
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);

    CmsEnrollment::create([
        'student_id' => $pendingStudent->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'status' => 'pending',
        'source' => 'self',
    ]);

    // No add/drop deadline inside the term yet — registration reminder only.
    reminder_activateTerm(['registration_ends_at' => today()->addDays(1)]);
    $this->artisan('cms:send-deadline-reminders')->assertSuccessful();
    Mail::assertQueued(CmsNotificationMail::class, fn (CmsNotificationMail $mail) => $mail->triggerEvent === 'term.registration_deadline');

    // Setting the add/drop deadline fires that reminder too (new trigger).
    CmsTerm::query()->update(['add_drop_deadline' => today()->addDays(3)->toDateString()]);
    $this->artisan('cms:send-deadline-reminders')->assertSuccessful();

    Mail::assertQueued(CmsNotificationMail::class, fn (CmsNotificationMail $mail) => $mail->triggerEvent === 'term.add_drop_deadline');
    expect(NotificationsLog::query()->where('trigger_event', 'term.add_drop_deadline')->count())->toBe(1);

    // Re-running immediately dedupes: no new add/drop reminder is logged.
    $this->artisan('cms:send-deadline-reminders')->assertSuccessful();
    expect(NotificationsLog::query()->where('trigger_event', 'term.add_drop_deadline')->count())->toBe(1);
});

it('reminds teachers with schedules before the grade entry deadline', function () {
    Mail::fake();
    [$level, $subject, , , $teacher] = reminder_seedWorld();

    CmsSchedule::create(['teacher_id' => $teacher->id, 'subject_id' => $subject->id, 'level_id' => $level->id, 'academic_year' => '2026-2027', 'semester' => 'first', 'day' => 'monday', 'start_time' => '10:00', 'end_time' => '12:00', 'room' => 'B2']);

    SiteSetting::updateOrCreate(['key' => 'cms.grade_entry_deadline'], ['value' => today()->addDays(2)->toDateString(), 'type' => 'text']);

    $this->artisan('cms:send-deadline-reminders')->assertSuccessful();

    Mail::assertQueued(CmsNotificationMail::class, function (CmsNotificationMail $mail) {
        return $mail->triggerEvent === 'term.grade_entry_deadline'
            && $mail->recipient === 'remind-teacher@example.test';
    });

    // The schedule-less teacher is never reminded.
    expect(NotificationsLog::query()->where('recipient', 'remind-idle-teacher@example.test')->count())->toBe(0);
});

it('sends nothing when all deadlines are far away', function () {
    Mail::fake();
    reminder_seedWorld();
    reminder_activateTerm(['registration_ends_at' => today()->addDays(30), 'add_drop_deadline' => today()->addDays(40)]);
    SiteSetting::updateOrCreate(['key' => 'cms.grade_entry_deadline'], ['value' => today()->addDays(30)->toDateString(), 'type' => 'text']);

    $this->artisan('cms:send-deadline-reminders')->assertSuccessful();

    Mail::assertNothingQueued();
    expect(NotificationsLog::query()->count())->toBe(0);
});
