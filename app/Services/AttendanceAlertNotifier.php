<?php

namespace App\Services;

use App\Models\CmsEnrollment;

class AttendanceAlertNotifier
{
    public function __construct(
        private AttendanceAlertService $alertService,
        private CmsNotificationDispatcher $dispatcher,
    ) {}

    public function notifyIfNeeded(CmsEnrollment $enrollment): void
    {
        $alertInfo = $this->alertService->checkEnrollmentAlerts($enrollment);

        if (! $alertInfo['has_alert']) {
            return;
        }

        $enrollment->loadMissing(['student', 'subject']);

        $recipient = (string) ($enrollment->student?->email ?? '');

        if ($recipient === '') {
            return;
        }

        // At most one alert per student per week, or the daily queue worker
        // would re-send the same warning every run.
        if ($this->dispatcher->recentlySent('attendance.alert', $recipient, 7)) {
            return;
        }

        $this->dispatcher->email(
            'attendance.alert',
            $recipient,
            (string) ($enrollment->student?->name ?? ''),
            [
                '{student_name}' => $enrollment->student?->name ?? '',
                '{subject_name}' => $enrollment->subject?->name ?? '',
                '{reasons}' => implode(' ', $alertInfo['alert_reasons']),
            ],
            'تنبيه غياب متكرر',
            "مرحباً {student_name}،\n\nنود إعلامك بوجود غيابات متكررة في مادة «{subject_name}».\n{reasons}\n\nيُرجى التواصل مع إدارة الكلية لمعالجة الوضع.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
        );
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
