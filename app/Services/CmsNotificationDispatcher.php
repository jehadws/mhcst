<?php

namespace App\Services;

use App\Mail\CmsNotificationMail;
use App\Models\NotificationsLog;
use App\Models\NotificationTemplate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * The one send path for every CMS notification: resolve an (optional,
 * admin-editable) NotificationTemplate, fall back to the caller's Arabic
 * body, queue the email, and log the dispatch to notifications_logs plus
 * the log channel. Failures are recorded, never thrown — a mail outage
 * must not roll back the admission/registration decision that triggered it.
 */
class CmsNotificationDispatcher
{
    /**
     * Queue a template-backed Arabic notification email and log it.
     *
     * @param  string  $triggerEvent  Template lookup key, e.g. registration.approved
     * @param  string  $recipient  Email address; empty short-circuits (nothing queued or logged)
     * @param  array<string, string>  $replacements  Placeholder map applied to template and fallback
     * @param  string  $fallbackSubject  Arabic subject used when no template row exists
     * @param  string  $fallbackBody  Arabic body used when no template row exists
     */
    public function email(
        string $triggerEvent,
        string $recipient,
        string $recipientName,
        array $replacements,
        string $fallbackSubject,
        string $fallbackBody,
    ): void {
        if (trim($recipient) === '') {
            return;
        }

        $template = NotificationTemplate::query()
            ->where('trigger_event', $triggerEvent)
            ->where('channel', 'email')
            ->first();

        $subject = str_replace(
            array_keys($replacements),
            array_values($replacements),
            (string) ($template?->subject ?: $fallbackSubject),
        );

        $body = str_replace(
            array_keys($replacements),
            array_values($replacements),
            (string) ($template?->body ?: $fallbackBody),
        );

        $log = null;

        try {
            $log = NotificationsLog::query()->create([
                'recipient' => $recipient,
                'channel' => 'email',
                'template_id' => $template?->id,
                'trigger_event' => $triggerEvent,
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            Mail::to($recipient, $recipientName)->queue(new CmsNotificationMail(
                $recipientName,
                $subject,
                $body,
                $recipient,
                $triggerEvent,
                $log->id,
            ));

            Log::info('notification dispatched', [
                'trigger_event' => $triggerEvent,
                'recipient' => $recipient,
                'template_id' => $template?->id,
            ]);
        } catch (\Throwable $exception) {
            Log::warning('notification dispatch failed', [
                'trigger_event' => $triggerEvent,
                'recipient' => $recipient,
                'error' => $exception->getMessage(),
            ]);

            // One row per send attempt: the already-created dispatch row is
            // flipped to failed instead of recording a duplicate.
            $payload = [
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
            ];

            if ($log !== null) {
                $log->update($payload);
            } else {
                NotificationsLog::query()->create($payload + [
                    'recipient' => $recipient,
                    'channel' => 'email',
                    'template_id' => $template?->id,
                    'trigger_event' => $triggerEvent,
                    'sent_at' => now(),
                ]);
            }
        }
    }

    /**
     * Whether a notification of this event was already delivered to this
     * recipient recently — dedupe guard for daily reminder commands.
     */
    public function recentlySent(string $triggerEvent, string $recipient, int $days = 3): bool
    {
        if (trim($recipient) === '') {
            return false;
        }

        return NotificationsLog::query()
            ->where('recipient', $recipient)
            ->where('trigger_event', $triggerEvent)
            ->where('status', 'sent')
            ->where('sent_at', '>=', now()->subDays($days))
            ->exists();
    }
}
