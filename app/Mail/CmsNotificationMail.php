<?php

namespace App\Mail;

use App\Models\NotificationsLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * The single queued plain-text email for every CMS notification (application
 * status, registration decisions, drops, attendance alerts, deadline
 * reminders). Queued: sending must never block (or roll back) the action
 * that triggered it; after the last retry the framework calls failed() on
 * this instance, which flips the matching notifications_logs row to
 * `failed` so the outage is visible on the admin log page.
 */
class CmsNotificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Attempts before the job lands in failed_jobs (and failed() runs).
     */
    public int $tries = 3;

    /**
     * The email subject. Untyped on purpose: the base Mailable declares
     * `$subject` without a type, and the signature must stay compatible.
     *
     * @var string
     */
    public $subject;

    public function __construct(
        string $recipientName,
        string $subject,
        public string $body,
        public string $recipient,
        public string $triggerEvent,
        public ?int $logId = null,
    ) {
        $this->recipientName = $recipientName;
        $this->subject = $subject;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subject,
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'mail.plain-text',
            with: [
                'body' => $this->body,
            ],
        );
    }

    /**
     * Exhausted retries: mark the dispatched log row as failed so admins see
     * the delivery problem (and its cause) instead of a silent hole.
     */
    public function failed(Throwable $exception): void
    {
        Log::error('notification delivery failed permanently', [
            'trigger_event' => $this->triggerEvent,
            'recipient' => $this->recipient,
            'error' => $exception->getMessage(),
        ]);

        if ($this->logId === null) {
            return;
        }

        NotificationsLog::query()
            ->whereKey($this->logId)
            ->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
            ]);
    }
}
