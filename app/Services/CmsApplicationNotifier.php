<?php

namespace App\Services;

use App\Models\CmsApplication;
use App\Support\WhatsAppLink;

/**
 * Applicant notifications for the admission lifecycle (طلبي). Every status
 * change emails the applicant (queued, logged) and produces a ready-made
 * Arabic WhatsApp message the admin can send with one tap via a wa.me deep
 * link — no gateway, no dependency.
 */
class CmsApplicationNotifier
{
    public function __construct(
        private CmsNotificationDispatcher $dispatcher,
    ) {}

    public function notifyUnderReview(CmsApplication $application): void
    {
        $this->email($application, 'application.under_review', 'تحديث حالة الطلب – قيد المراجعة',
            "مرحباً {$this->applicantName($application)}،\n\n"
            ."طلبك قيد المراجعة الآن من قبل إدارة الكلية. لا تحتاج لأي خطوة إضافية حالياً، وسنخبرك فور صدور القرار.\n\n"
            .'يمكنك متابعة حالة طلبك في أي وقت من صفحة «طلبي» في حسابك.'
        );
    }

    public function notifyAccepted(CmsApplication $application): void
    {
        $studentNo = $application->user?->student?->student_no;

        $this->email($application, 'application.accepted', 'تم قبول طلبك – مبروك',
            "مرحباً {$this->applicantName($application)}،\n\n"
            ."يسرّنا إبلاغك بأنه تم اعتماد طلبك والموافقة على تسجيلك في الكلية. 🎉\n\n"
            .($studentNo ? "رقمك القيد: {$studentNo}\n" : '')
            .'يمكنك الآن الدخول إلى حسابك واختيار موادك الدراسية من صفحة «تسجيل المواد».'
        );
    }

    public function notifyRejected(CmsApplication $application): void
    {
        $reason = trim((string) $application->rejected_reason);

        $this->email($application, 'application.rejected', 'بخصوص طلبك – نتيجة المراجعة',
            "مرحباً {$this->applicantName($application)}،\n\n"
            ."نأسف لإبلاغك بأنه لم يتم اعتماد طلبك هذه المرة.\n\n"
            .($reason !== '' ? "السبب: {$reason}\n\n" : "\n")
            .'يمكنك التواصل مع إدارة الكلية لمزيد من التفاصيل أو إعادة التقديم لاحقاً.'
        );
    }

    /**
     * Ready-made Arabic WhatsApp message for the admin, describing the
     * current application state and the applicant's exact next action.
     *
     * @return array{link: ?string, message: string}
     */
    public function waPayload(CmsApplication $application): array
    {
        $name = $this->applicantName($application);
        $studentNo = $application->user?->student?->student_no;

        $message = match ($application->status) {
            CmsApplication::STATUS_SUBMITTED,
            CmsApplication::STATUS_UNDER_REVIEW, => "مرحباً {$name}،\n\nطلبك للتسجيل في الكلية قيد المراجعة من قبل الإدارة. سنوافيك بالنتيجة قريباً إن شاء الله.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            CmsApplication::STATUS_ACCEPTED => "مرحباً {$name}،\n\nنحيطكم علماً بأنه تم قبول طلبكم والانضمام للكلية."
                    .($studentNo ? "\nرقم القيد: {$studentNo}" : '')
                    ."\nيمكنكم الآن تسجيل الدخول واختيار المواد الدراسية من لوحة الطالب.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            CmsApplication::STATUS_REJECTED => "مرحباً {$name}،\n\nنأسف لإبلاغكم بأنه لم يتم اعتماد طلبكم هذه المرة."
                    .(trim((string) $application->rejected_reason) !== '' ? "\nالسبب: ".trim((string) $application->rejected_reason) : '')
                    ."\nللاستفسار يرجى التواصل مع إدارة الكلية.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            default => '',
        };

        if ($message === '') {
            return ['link' => null, 'message' => ''];
        }

        return [
            'link' => $this->waLink($application, $message),
            'message' => $message,
        ];
    }

    private function waLink(CmsApplication $application, string $message): ?string
    {
        $phone = $application->form_data['phone'] ?? null;

        if ($phone === null || (string) $phone === '') {
            $phone = $application->user?->student?->phone;
        }

        return WhatsAppLink::build($phone, $message);
    }

    private function applicantName(CmsApplication $application): string
    {
        return $application->form_data['name']
            ?? $application->user?->student?->name
            ?? $application->user?->name
            ?? '';
    }

    /**
     * Queue the status email, preferring an admin-edited template when one
     * exists, and log the dispatch. Failures are logged, never thrown:
     * a mail outage must not roll back the status change.
     */
    private function email(CmsApplication $application, string $triggerEvent, string $fallbackSubject, string $fallbackBody): void
    {
        $recipient = $application->user?->email
            ?? $application->form_data['email']
            ?? '';

        $this->dispatcher->email(
            $triggerEvent,
            (string) $recipient,
            $this->applicantName($application),
            [
                '{applicant_name}' => $this->applicantName($application),
            ],
            $fallbackSubject,
            $fallbackBody,
        );
    }
}
