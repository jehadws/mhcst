<?php

namespace App\Console\Commands;

use App\Models\CmsEnrollment;
use App\Models\CmsStudent;
use App\Models\CmsTeacher;
use App\Models\CmsTerm;
use App\Services\CmsAcademicSettingsService;
use App\Services\CmsNotificationDispatcher;
use App\Services\GradeLockService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

/**
 * Daily deadline reminders (Phase 6): while each relevant deadline is within
 * reach — deduplicated per recipient by the notifications log — students and
 * teachers are emailed so a closing window is never silent. Every send is
 * best-effort: a mail outage must not fail the schedule run.
 */
class SendDeadlineReminders extends Command
{
    /**
     * Reminders fire while the deadline is this many days away (inclusive).
     */
    private const ADVANCE_DAYS = 3;

    protected $signature = 'cms:send-deadline-reminders';

    protected $description = 'Email students and teachers about registration, add/drop and grade-entry deadlines closing within 3 days.';

    public function handle(
        CmsAcademicSettingsService $academicSettings,
        GradeLockService $gradeLock,
        CmsNotificationDispatcher $dispatcher,
    ): int {
        $sent = 0;

        $term = $academicSettings->activeTerm();

        if ($term !== null) {
            $sent += $this->remindUnregisteredStudents($term, $dispatcher);
            $sent += $this->remindAddDropDeadline($term, $dispatcher);
        }

        $sent += $this->remindTeachersOfGradeDeadline($gradeLock, $dispatcher);

        $this->info("Deadline reminders sent: {$sent}.");

        return self::SUCCESS;
    }

    /**
     * Students who have not picked any subject for the active term yet, while
     * the registration window closes soon.
     */
    private function remindUnregisteredStudents(CmsTerm $term, CmsNotificationDispatcher $dispatcher): int
    {
        if ($term->registration_ends_at === null || ! $this->closingSoon($term->registration_ends_at)) {
            return 0;
        }

        $deadline = $term->registration_ends_at->toDateString();
        $trigger = 'term.registration_deadline';

        $students = CmsStudent::query()
            ->where('status', 'active')
            ->whereNotNull('user_id')
            ->whereHas('user', fn ($query) => $query->whereNotNull('email')->where('email', '!=', ''))
            ->whereNotExists(function ($query) use ($term) {
                $query->selectRaw(1)
                    ->from('cms_enrollments')
                    ->whereColumn('cms_enrollments.student_id', 'cms_students.id')
                    ->whereNull('cms_enrollments.deleted_at')
                    ->whereIn('cms_enrollments.status', ['pending', 'active'])
                    ->where('cms_enrollments.academic_year', $term->academic_year)
                    ->where('cms_enrollments.semester', $term->semester);
            })
            ->with('user:id,email')
            ->get();

        $sent = 0;

        foreach ($students as $student) {
            $email = (string) ($student->user?->email ?? '');

            if ($email === '' || $dispatcher->recentlySent($trigger, $email)) {
                continue;
            }

            $dispatcher->email(
                $trigger,
                $email,
                (string) $student->name,
                ['{student_name}' => (string) $student->name, '{deadline}' => $deadline],
                'تذكير: تسجيل المواد يُغلق قريباً',
                "مرحباً {student_name}،\n\nنُذكّرك بأن موعد تسجيل المواد للفصل الحالي يُغلق بتاريخ {deadline} ولم تقم بأي اختيار للمواد حتى الآن.\n"
                ."يُرجى الدخول إلى صفحة «تسجيل المواد» في حسابك واختيار موادك قبل انتهاء الموعد.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            );
            $sent++;
        }

        return $sent;
    }

    /**
     * Students holding pending or active picks for the active term while the
     * add/drop deadline closes soon: after it, only administration can
     * withdraw a pick.
     */
    private function remindAddDropDeadline(CmsTerm $term, CmsNotificationDispatcher $dispatcher): int
    {
        if ($term->add_drop_deadline === null || ! $this->closingSoon($term->add_drop_deadline)) {
            return 0;
        }

        $deadline = $term->add_drop_deadline->toDateString();
        $trigger = 'term.add_drop_deadline';

        $students = CmsEnrollment::query()
            ->where('academic_year', $term->academic_year)
            ->where('semester', $term->semester)
            ->whereIn('status', ['pending', 'active'])
            ->whereNull('deleted_at')
            ->whereHas('student', fn ($query) => $query->where('status', 'active')->whereNotNull('user_id'))
            ->with('student.user:id,email')
            ->get()
            ->pluck('student')
            ->unique('id');

        $sent = 0;

        foreach ($students as $student) {
            $email = (string) ($student->user?->email ?? '');

            if ($email === '' || $dispatcher->recentlySent($trigger, $email)) {
                continue;
            }

            $dispatcher->email(
                $trigger,
                $email,
                (string) $student->name,
                ['{student_name}' => (string) $student->name, '{deadline}' => $deadline],
                'تذكير: آخر أيام الإضافة والحذف',
                "مرحباً {student_name}،\n\nنُذكّرك بأن آخر موعد للإضافة والحذف بتاريخ {deadline}. بعد هذا التاريخ لا يمكنك حذف أي مادة بنفسك وتصبح كل التغييرات عبر إدارة الكلية.\n"
                ."إذا كان لديك أي اختيار معلّق بانتظار الاعتماد فسيتم مراجعته من الإدارة.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            );
            $sent++;
        }

        return $sent;
    }

    /**
     * Teachers with schedules on record, while the global grade-entry
     * deadline (GradeLockService) closes soon.
     */
    private function remindTeachersOfGradeDeadline(GradeLockService $gradeLock, CmsNotificationDispatcher $dispatcher): int
    {
        $deadline = $gradeLock->settings()['grade_entry_deadline'];

        if ($deadline === null || $deadline === '' || ! $this->closingSoon(Carbon::parse($deadline))) {
            return 0;
        }

        $deadline = Carbon::parse($deadline)->toDateString();
        $trigger = 'term.grade_entry_deadline';

        $teachers = CmsTeacher::query()
            ->where('status', 'active')
            ->whereNotNull('user_id')
            ->whereHas('user', fn ($query) => $query->whereNotNull('email')->where('email', '!=', ''))
            ->whereExists(function ($query) {
                $query->selectRaw(1)
                    ->from('cms_schedules')
                    ->whereColumn('cms_schedules.teacher_id', 'cms_teachers.id');
            })
            ->with('user:id,email')
            ->get();

        $sent = 0;

        foreach ($teachers as $teacher) {
            $email = (string) ($teacher->user?->email ?? '');

            if ($email === '' || $dispatcher->recentlySent($trigger, $email)) {
                continue;
            }

            $dispatcher->email(
                $trigger,
                $email,
                (string) $teacher->name,
                ['{teacher_name}' => (string) $teacher->name, '{deadline}' => $deadline],
                'تذكير: رصد الدرجات يُغلق قريباً',
                "مرحباً د. {teacher_name}،\n\nنُذكّرك بأن آخر موعد لرصد الدرجات بتاريخ {deadline}. بعد هذا التاريخ سيُغلق الرصد ولا يمكن تعديل الدرجات إلا عبر إدارة الكلية.\n"
                ."يُرجى التأكد من رصد درجات جميع شعبك قبل الموعد.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            );
            $sent++;
        }

        return $sent;
    }

    private function closingSoon(Carbon $deadline): bool
    {
        $days = (int) today()->diffInDays($deadline, false);

        return $days >= 0 && $days <= self::ADVANCE_DAYS;
    }
}
