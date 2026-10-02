<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Welcome email to the newly registered student. Queued: sending must never
 * block (or roll back) the registration transaction, and on the shared host
 * the scheduled `queue:work --stop-when-empty` task processes it within a
 * minute of the cron running schedule:run.
 */
class StudentWelcomeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Attempts before the job lands in failed_jobs (logged via Queue::failing).
     */
    public int $tries = 3;

    public function __construct(
        public string $studentName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'تم استلام طلب التسجيل – مركز مهكست التدريبي',
        );
    }

    public function content(): Content
    {
        return new Content(
            text: 'mail.plain-text',
            with: [
                'body' => "مرحباً {$this->studentName}،\n\n"
                    ."تم استلام طلب تسجيلك بنجاح. سيقوم فريقنا بمراجعة طلبك والرد عليك في أقرب وقت.\n\n"
                    ."بمجرد الموافقة على طلبك، ستتمكن من اختيار المواد الدراسية الخاصة بك.\n\n"
                    .'شكراً لتسجيلك.',
            ],
        );
    }
}
