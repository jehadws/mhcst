<?php

namespace App\Services;

use App\Models\CmsEnrollment;
use App\Models\NotificationsLog;
use App\Models\NotificationTemplate;
use Illuminate\Support\Facades\Mail;

class RegistrationStatusNotifier
{
    /**
     * Human-readable semester labels for the {semester} placeholder.
     * Seeded templates are authored in Arabic, so the labels follow.
     *
     * @var array<string, string>
     */
    private const SEMESTER_LABELS = [
        'first' => 'الأول',
        'second' => 'الثاني',
        'summer' => 'الصيفي',
    ];

    public function notifyApproved(CmsEnrollment $enrollment): void
    {
        $this->send($enrollment, 'registration.approved');
    }

    public function notifyRejected(CmsEnrollment $enrollment): void
    {
        $this->send($enrollment, 'registration.rejected');
    }

    private function send(CmsEnrollment $enrollment, string $triggerEvent): void
    {
        $enrollment->loadMissing(['student', 'subject']);

        $recipient = $enrollment->student?->email;

        if ($recipient === null || $recipient === '') {
            return;
        }

        $template = NotificationTemplate::query()
            ->where('trigger_event', $triggerEvent)
            ->where('channel', 'email')
            ->first();

        if (! $template) {
            return;
        }

        $replacements = [
            '{student_name}' => $enrollment->student?->name ?? '',
            '{subject_name}' => $enrollment->subject?->name ?? '',
            '{academic_year}' => (string) $enrollment->academic_year,
            '{semester}' => self::SEMESTER_LABELS[$enrollment->semester] ?? (string) $enrollment->semester,
        ];

        $subject = str_replace(
            array_keys($replacements),
            array_values($replacements),
            (string) $template->subject
        );

        $body = str_replace(
            array_keys($replacements),
            array_values($replacements),
            $template->body
        );

        Mail::raw($body, function ($message) use ($recipient, $subject, $enrollment): void {
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
}
