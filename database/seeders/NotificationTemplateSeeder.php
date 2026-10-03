<?php

namespace Database\Seeders;

use App\Models\NotificationTemplate;
use Illuminate\Database\Seeder;

/**
 * Arabic email templates for every notification trigger the CMS sends
 * (Phase 6). firstOrCreate keeps this idempotent and never overwrites an
 * admin-edited template; the notifiers fall back to their inline Arabic
 * text when a row is missing, so seeding is an enhancement, not a
 * requirement.
 */
class NotificationTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'name' => 'طلب قيد المراجعة',
                'trigger_event' => 'application.under_review',
                'subject' => 'تحديث حالة الطلب – قيد المراجعة',
                'body' => "مرحباً {applicant_name}،\n\nطلبك قيد المراجعة الآن من قبل إدارة الكلية. لا تحتاج لأي خطوة إضافية حالياً، وسنخبرك فور صدور القرار.\n\nيمكنك متابعة حالة طلبك في أي وقت من صفحة «طلبي» في حسابك.",
            ],
            [
                'name' => 'قبول الطلب',
                'trigger_event' => 'application.accepted',
                'subject' => 'تم قبول طلبك – مبروك',
                'body' => "مرحباً {applicant_name}،\n\nيسرّنا إبلاغك بأنه تم اعتماد طلبك والموافقة على تسجيلك في الكلية. 🎉\n\nيمكنك الآن الدخول إلى حسابك واختيار موادك الدراسية من صفحة «تسجيل المواد».",
            ],
            [
                'name' => 'رفض الطلب',
                'trigger_event' => 'application.rejected',
                'subject' => 'بخصوص طلبك – نتيجة المراجعة',
                'body' => "مرحباً {applicant_name}،\n\nنأسف لإبلاغك بأنه لم يتم اعتماد طلبك هذه المرة.\n\nيمكنك التواصل مع إدارة الكلية لمزيد من التفاصيل أو إعادة التقديم لاحقاً.",
            ],
            [
                'name' => 'اعتماد تسجيل مادة',
                'trigger_event' => 'registration.approved',
                'subject' => 'تم اعتماد تسجيلك في المادة',
                'body' => "مرحباً {student_name}،\n\nتم اعتماد تسجيلك في مادة «{subject_name}» للفصل {semester} من العام {academic_year}. بالتوفيق.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            ],
            [
                'name' => 'رفض/إلغاء تسجيل مادة',
                'trigger_event' => 'registration.rejected',
                'subject' => 'بخصوص تسجيلك في المادة',
                'body' => "مرحباً {student_name}،\n\nتم رفض/إلغاء تسجيلك في مادة «{subject_name}» للفصل {semester} من العام {academic_year}.\nللاستفسار أو تعديل الاختيارات يُرجى التواصل مع إدارة الكلية.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            ],
            [
                'name' => 'تأكيد حذف مادة',
                'trigger_event' => 'registration.dropped',
                'subject' => 'تم حذف تسجيلك في المادة',
                'body' => "مرحباً {student_name}،\n\nتم حذف تسجيلك في مادة «{subject_name}» للفصل {semester} من العام {academic_year}.\nإذا كان هذا الحذف دون علمك يُرجى التواصل مع إدارة الكلية فوراً.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            ],
            [
                'name' => 'تنبيه غياب متكرر',
                'trigger_event' => 'attendance.alert',
                'subject' => 'تنبيه غياب متكرر',
                'body' => "مرحباً {student_name}،\n\nنود إعلامك بوجود غيابات متكررة في مادة «{subject_name}».\n{reasons}\n\nيُرجى التواصل مع إدارة الكلية لمعالجة الوضع.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            ],
            [
                'name' => 'تذكير بإغلاق تسجيل المواد',
                'trigger_event' => 'term.registration_deadline',
                'subject' => 'تذكير: تسجيل المواد يُغلق قريباً',
                'body' => "مرحباً {student_name}،\n\nنُذكّرك بأن موعد تسجيل المواد للفصل الحالي يُغلق بتاريخ {deadline} ولم تقم بأي اختيار للمواد حتى الآن.\nيُرجى الدخول إلى صفحة «تسجيل المواد» في حسابك واختيار موادك قبل انتهاء الموعد.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            ],
            [
                'name' => 'تذكير بانتهاء الإضافة والحذف',
                'trigger_event' => 'term.add_drop_deadline',
                'subject' => 'تذكير: آخر أيام الإضافة والحذف',
                'body' => "مرحباً {student_name}،\n\nنُذكّرك بأن آخر موعد للإضافة والحذف بتاريخ {deadline}. بعد هذا التاريخ لا يمكنك حذف أي مادة بنفسك وتصبح كل التغييرات عبر إدارة الكلية.\nإذا كان لديك أي اختيار معلّق بانتظار الاعتماد فسيتم مراجعته من الإدارة.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            ],
            [
                'name' => 'تذكير بإغلاق رصد الدرجات',
                'trigger_event' => 'term.grade_entry_deadline',
                'subject' => 'تذكير: رصد الدرجات يُغلق قريباً',
                'body' => "مرحباً د. {teacher_name}،\n\nنُذكّرك بأن آخر موعد لرصد الدرجات بتاريخ {deadline}. بعد هذا التاريخ سيُغلق الرصد ولا يمكن تعديل الدرجات إلا عبر إدارة الكلية.\nيُرجى التأكد من رصد درجات جميع شعبك قبل الموعد.\n\n– كلية المعايير الحديثة للعلوم والتقنية",
            ],
        ];

        foreach ($templates as $template) {
            NotificationTemplate::query()->firstOrCreate(
                ['trigger_event' => $template['trigger_event'], 'channel' => 'email'],
                [
                    'name' => $template['name'],
                    'subject' => $template['subject'],
                    'body' => $template['body'],
                ],
            );
        }
    }
}
