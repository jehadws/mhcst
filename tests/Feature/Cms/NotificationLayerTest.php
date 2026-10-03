<?php

use App\Mail\CmsNotificationMail;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\NotificationsLog;
use App\Models\NotificationTemplate;
use App\Models\User;
use App\Services\CmsNotificationDispatcher;
use App\Services\CmsSubjectRegistrationService;
use App\Services\RegistrationStatusNotifier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Mail\MailManager;
use Illuminate\Support\Facades\Mail;

uses(RefreshDatabase::class);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function notif_seedEnrollment(string $email = 'notify-student@example.test'): CmsEnrollment
{
    $department = CmsDepartment::create(['name' => 'Notify Dept', 'description' => 'testing']);
    $level = CmsLevel::create(['department_id' => $department->id, 'year' => 1, 'section' => 'A', 'capacity' => 30]);
    $subject = CmsSubject::create(['department_id' => $department->id, 'code' => 'NT-101', 'name' => 'Notified Subject', 'credits' => 3, 'semester' => 'first']);

    $user = User::factory()->create(['email' => $email]);
    $student = CmsStudent::create([
        'user_id' => $user->id,
        'student_no' => 'NT-'.str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT),
        'name' => 'Notified Student',
        'email' => $email,
        'level_id' => $level->id,
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);

    return CmsEnrollment::create([
        'student_id' => $student->id,
        'subject_id' => $subject->id,
        'academic_year' => '2026-2027',
        'semester' => 'first',
        'status' => 'pending',
        'source' => 'self',
    ]);
}

// ---------------------------------------------------------------------------
// Registration decisions notify + log
// ---------------------------------------------------------------------------

it('queues and logs the approval email with the Arabic body', function () {
    Mail::fake();
    $enrollment = notif_seedEnrollment();

    app(RegistrationStatusNotifier::class)->notifyApproved($enrollment->refresh());

    Mail::assertQueued(CmsNotificationMail::class, function (CmsNotificationMail $mail) {
        return $mail->triggerEvent === 'registration.approved'
            && $mail->recipient === 'notify-student@example.test'
            && str_contains($mail->body, 'تم اعتماد تسجيلك');
    });

    $log = NotificationsLog::query()->firstOrFail();
    expect($log->recipient)->toBe('notify-student@example.test')
        ->and($log->trigger_event)->toBe('registration.approved')
        ->and($log->status)->toBe('sent');
});

it('queues and logs the rejection email including the withdrawal reason', function () {
    Mail::fake();
    $enrollment = notif_seedEnrollment();
    $enrollment->update(['withdrawn_reason' => 'الشعبة مكتملة']);

    app(RegistrationStatusNotifier::class)->notifyRejected($enrollment->refresh());

    Mail::assertQueued(CmsNotificationMail::class, function (CmsNotificationMail $mail) {
        return $mail->triggerEvent === 'registration.rejected'
            && str_contains($mail->body, 'الشعبة مكتملة');
    });
});

it('confirms a self-drop by email and logs it', function () {
    Mail::fake();
    $enrollment = notif_seedEnrollment();

    app(CmsSubjectRegistrationService::class)->dropRegistration($enrollment->student, $enrollment->refresh());

    expect($enrollment->refresh()->status)->toBe('dropped');

    Mail::assertQueued(CmsNotificationMail::class, function (CmsNotificationMail $mail) {
        return $mail->triggerEvent === 'registration.dropped';
    });

    expect(NotificationsLog::query()->where('trigger_event', 'registration.dropped')->count())->toBe(1);
});

it('sends nothing when the student has no email address', function () {
    Mail::fake();
    $enrollment = notif_seedEnrollment();
    $enrollment->student->update(['email' => null]);

    app(RegistrationStatusNotifier::class)->notifyApproved($enrollment->refresh());

    Mail::assertNothingQueued();
    expect(NotificationsLog::query()->count())->toBe(0);
});

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

it('prefers an admin-edited template over the inline fallback', function () {
    Mail::fake();
    NotificationTemplate::create([
        'name' => 'Custom approval',
        'channel' => 'email',
        'trigger_event' => 'registration.approved',
        'subject' => 'Custom subject {subject_name}',
        'body' => 'Hello {student_name}, custom body.',
    ]);
    $enrollment = notif_seedEnrollment();

    app(RegistrationStatusNotifier::class)->notifyApproved($enrollment->refresh());

    Mail::assertQueued(CmsNotificationMail::class, function (CmsNotificationMail $mail) {
        return $mail->subject === 'Custom subject Notified Subject'
            && str_contains($mail->body, 'Hello Notified Student, custom body.');
    });
});

// ---------------------------------------------------------------------------
// Failure paths
// ---------------------------------------------------------------------------

it('marks the log row as failed when the queued mailable exhausts its retries', function () {
    Mail::fake();
    $enrollment = notif_seedEnrollment();

    app(RegistrationStatusNotifier::class)->notifyApproved($enrollment->refresh());

    $log = NotificationsLog::query()->firstOrFail();
    $mail = new CmsNotificationMail('Notified Student', 'S', 'B', 'notify-student@example.test', 'registration.approved', $log->id);

    $mail->failed(new RuntimeException('smtp connection refused'));

    $log->refresh();
    expect($log->status)->toBe('failed')
        ->and($log->error_message)->toBe('smtp connection refused');
});

it('records a failed log row when dispatch throws, without breaking the caller', function () {
    Mail::swap(Mockery::mock(MailManager::class)->shouldReceive('to')->andThrow(new RuntimeException('queue down'))->getMock());

    $enrollment = notif_seedEnrollment();

    // The dispatcher must swallow the transport exception: a mail outage
    // must never roll back the decision that triggered the notification.
    app(RegistrationStatusNotifier::class)->notifyApproved($enrollment->refresh());

    expect(NotificationsLog::query()->count())->toBe(1);

    $log = NotificationsLog::query()->firstOrFail();
    expect($log->status)->toBe('failed')
        ->and($log->error_message)->toBe('queue down');
});

// ---------------------------------------------------------------------------
// Reminder dedupe
// ---------------------------------------------------------------------------

it('dedupes reminders by trigger event and recipient inside the window', function () {
    Mail::fake();
    $dispatcher = app(CmsNotificationDispatcher::class);

    $dispatcher->email('term.registration_deadline', 'once@example.test', 'Once', [], 'S', 'B');
    $dispatcher->email('term.registration_deadline', 'once@example.test', 'Once', [], 'S', 'B');

    // Both dispatches log (the guard is opt-in), but recentlySent() exposes
    // the dedupe decision the reminder command relies on.
    expect(NotificationsLog::query()->where('recipient', 'once@example.test')->count())->toBe(2)
        ->and($dispatcher->recentlySent('term.registration_deadline', 'once@example.test'))->toBeTrue()
        ->and($dispatcher->recentlySent('term.add_drop_deadline', 'once@example.test'))->toBeFalse()
        ->and($dispatcher->recentlySent('term.registration_deadline', 'other@example.test'))->toBeFalse();
});
