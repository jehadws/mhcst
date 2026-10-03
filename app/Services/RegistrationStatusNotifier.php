<?php

namespace App\Services;

use App\Models\CmsEnrollment;
use App\Support\WhatsAppLink;

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

    public function __construct(
        private CmsNotificationDispatcher $dispatcher,
    ) {}

    public function notifyApproved(CmsEnrollment $enrollment): void
    {
        $this->send($enrollment, 'registration.approved', 'تم اعتماد تسجيلك في المادة',
            "مرحباً {student_name}،\n\nتم اعتماد تسجيلك في مادة «{subject_name}» للفصل {semester} من العام {academic_year}. بالتوفيق.\n\n– كلية المعايير الحديثة للعلوم والتقنية");
    }

    public function notifyRejected(CmsEnrollment $enrollment): void
    {
        $reason = trim((string) ($enrollment->withdrawn_reason ?? ''));

        $this->send($enrollment, 'registration.rejected', 'بخصوص تسجيلك في المادة',
            "مرحباً {student_name}،\n\nتم رفض/إلغاء تسجيلك في مادة «{subject_name}» للفصل {semester} من العام {academic_year}."
            .($reason !== '' ? "\nالسبب: {$reason}" : '')
            ."\nللاستفسار أو تعديل الاختيارات يُرجى التواصل مع إدارة الكلية.\n\n– كلية المعايير الحديثة للعلوم والتقنية");
    }

    /**
     * Confirmation after the student (or an admin on their behalf) drops a
     * pick, so the drop is never silent on the student side.
     */
    public function notifyDropped(CmsEnrollment $enrollment): void
    {
        $this->send($enrollment, 'registration.dropped', 'تم حذف تسجيلك في المادة',
            "مرحباً {student_name}،\n\nتم حذف تسجيلك في مادة «{subject_name}» للفصل {semester} من العام {academic_year}.\n"
            ."إذا كان هذا الحذف دون علمك يُرجى التواصل مع إدارة الكلية فوراً.\n\n– كلية المعايير الحديثة للعلوم والتقنية");
    }

    /**
     * Ready-made Arabic WhatsApp message for the admin after an approval,
     * a rejection/withdrawal or a drop — one-tap personal follow-up, same
     * contract as CmsApplicationNotifier::waPayload.
     *
     * @return array{link: ?string, message: string}
     */
    public function waPayload(CmsEnrollment $enrollment, string $event, ?string $reason = null): array
    {
        $enrollment->loadMissing(['student', 'subject']);

        $name = $enrollment->student?->name ?? '';
        $subjectName = $enrollment->subject?->name ?? (string) $enrollment->subject_id;
        $semester = self::SEMESTER_LABELS[$enrollment->semester] ?? (string) $enrollment->semester;

        $message = match ($event) {
            'approved' => "مرحباً {$name}،\n\nتم اعتماد تسجيلك في مادة «{$subjectName}» للفصل {$semester} من العام {$enrollment->academic_year}. بالتوفيق.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            'dropped' => "مرحباً {$name}،\n\nتم حذف تسجيلك في مادة «{$subjectName}» للفصل {$semester} من العام {$enrollment->academic_year}. يمكنك إعادة اختيار مادة أخرى ما دام التسجيل مفتوحاً.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            default => "مرحباً {$name}،\n\nتم رفض تسجيلك في مادة «{$subjectName}» للفصل {$semester} من العام {$enrollment->academic_year}."
                .(trim((string) $reason) !== '' ? "\nالسبب: ".trim((string) $reason) : '')
                ."\nللاستفسار أو تعديل الاختيارات يُرجى التواصل مع إدارة الكلية.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
        };

        return [
            'link' => WhatsAppLink::build($enrollment->student?->phone, $message),
            'message' => $message,
        ];
    }

    private function send(CmsEnrollment $enrollment, string $triggerEvent, string $fallbackSubject, string $fallbackBody): void
    {
        $enrollment->loadMissing(['student', 'subject']);

        $this->dispatcher->email(
            $triggerEvent,
            (string) ($enrollment->student?->email ?? ''),
            (string) ($enrollment->student?->name ?? ''),
            $this->replacements($enrollment),
            $fallbackSubject,
            $fallbackBody,
        );
    }

    /**
     * @return array<string, string>
     */
    private function replacements(CmsEnrollment $enrollment): array
    {
        return [
            '{student_name}' => $enrollment->student?->name ?? '',
            '{subject_name}' => $enrollment->subject?->name ?? '',
            '{academic_year}' => (string) $enrollment->academic_year,
            '{semester}' => self::SEMESTER_LABELS[$enrollment->semester] ?? (string) $enrollment->semester,
        ];
    }
}
