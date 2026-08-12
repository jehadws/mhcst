<?php

namespace Database\Seeders;

use App\Models\CmsPage;
use Illuminate\Database\Seeder;

class CmsPageSeeder extends Seeder
{
    public function run(): void
    {
        $pages = [
            [
                'key' => 'about-us',
                'title' => 'عن الشركة',
                'content' => '<p>كلية المعايير الحديثة للعلوم والتقنية (Almaayir Alhaditha College for Science and Technology) مؤسسة أكاديمية رائدة في ليبيا. نقدم برامج علمية وتقنية عالية الجودة بهدف إعداد كوادر مؤهلة للسوق المحلي والدولي.</p><p>رؤيتنا أن نكون وجهة التعليم العالي الحديث في المنطقة.</p>',
            ],
            [
                'key' => 'privacy-policy',
                'title' => 'سياسة الخصوصية',
                'content' => '<p>نحن نحترم خصوصيتك. يتم جمع البيانات الشخصية فقط لأغراض التسجيل والتواصل، ولا يتم مشاركتها مع أي طرف ثالث.</p>',
            ],
            [
                'key' => 'terms-of-use',
                'title' => 'شروط الاستخدام',
                'content' => '<p>باستخدامك لهذا الموقع، فإنك توافق على الالتزام بجميع الشروط والأحكام. يحق للإدارة تعديل هذه الشروط في أي وقت.</p>',
            ],
            [
                'key' => 'refund-policy',
                'title' => 'سياسة الاسترجاع',
                'content' => '<p>يمكن طلب استرجاع المبلغ خلال 48 ساعة من تاريخ التسجيل وقبل بدء الدورة بـ 24 ساعة على الأقل.</p>',
            ],
        ];

        foreach ($pages as $page) {
            CmsPage::create(array_merge($page, ['updated_by' => 1]));
        }
    }
}
