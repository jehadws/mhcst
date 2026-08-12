<?php

namespace App\Services;

use App\Models\CmsEnrollment;
use App\Models\NotificationsLog;
use App\Models\NotificationTemplate;
use Illuminate\Support\Facades\Mail;

class AttendanceAlertNotifier
{
    public function __construct(
        private AttendanceAlertService $alertService,
    ) {}

    public function notifyIfNeeded(CmsEnrollment $enrollment): void
    {
        $alertInfo = $this->alertService->checkEnrollmentAlerts($enrollment);

        if (! $alertInfo['has_alert']) {
            return;
        }

        $enrollment->loadMissing(['student', 'subject']);

        $recipient = $enrollment->student?->email;

        if (! $recipient) {
            return;
        }

        $recentlySent = NotificationsLog::query()
            ->where('recipient', $recipient)
            ->where('channel', 'email')
            ->where('sent_at', '>=', now()->subDays(7))
            ->whereHas('template', fn ($query) => $query->where('trigger_event', 'attendance.alert'))
            ->exists();

        if ($recentlySent) {
            return;
        }

        $template = NotificationTemplate::query()
            ->where('trigger_event', 'attendance.alert')
            ->where('channel', 'email')
            ->first();

        if (! $template) {
            return;
        }

        $body = str_replace(
            ['{student_name}', '{subject_name}', '{reasons}'],
            [
                $enrollment->student?->name ?? '',
                $enrollment->subject?->name ?? '',
                implode(' ', $alertInfo['alert_reasons']),
            ],
            $template->body
        );

        $subject = str_replace(
            ['{student_name}', '{subject_name}'],
            [
                $enrollment->student?->name ?? '',
                $enrollment->subject?->name ?? '',
            ],
            $template->subject
        );

        Mail::raw($body, function ($message) use ($recipient, $subject, $enrollment) {
            $message->to($recipient, $enrollment->student?->name ?? '')
                ->subject($subject);
        });

        NotificationsLog::create([
            'recipient' => $recipient,
            'channel' => 'email',
            'template_id' => $template->id,
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    /**
     * @param  list<int>  $enrollmentIds
     */
    public function notifyEnrollments(array $enrollmentIds): void
    {
        if ($enrollmentIds === []) {
            return;
        }

        CmsEnrollment::query()
            ->whereIn('id', $enrollmentIds)
            ->with(['student', 'subject'])
            ->get()
            ->each(fn (CmsEnrollment $enrollment) => $this->notifyIfNeeded($enrollment));
    }
}
