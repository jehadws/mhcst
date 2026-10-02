<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * "New pending registration" notice to the administration contact address.
 * Queued: sending must never block (or roll back) the registration
 * transaction; failures after retries are logged via Queue::failing.
 */
class StudentRegistrationPendingMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Attempts before the job lands in failed_jobs (logged via Queue::failing).
     */
    public int $tries = 3;

    public function __construct(
        public string $studentName,
        public string $studentEmail,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "New Student Registration Pending: {$this->studentName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'mail.plain-text',
            with: [
                'body' => "A new student registration is pending approval.\n\n"
                    ."Name:  {$this->studentName}\n"
                    ."Email: {$this->studentEmail}\n\n"
                    .'Please log in to the CMS to review and approve or reject this registration.',
            ],
        );
    }
}
