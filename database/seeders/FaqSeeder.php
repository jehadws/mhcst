<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            [
                'question' => 'كيف يمكنني التسجيل في دورة تدريبية؟',
                'answer' => 'يمكنك التسجيل عبر الموقع مباشرة أو التواصل معنا عبر الواتساب أو الهاتف. بعد التسجيل، سيقوم فريقنا بالتواصل معك لإتمام إجراءات الدفع.',
                'sort_order' => 1,
                'is_published' => true,
            ],
            [
                'question' => 'هل الدورات حضورية أم عن بُعد؟',
                'answer' => 'نقدم دورات حضورية في قاعاتنا التدريبية، بالإضافة إلى دورات هجينة (Hybrid) تجمع بين الحضور والتعلم عن بُعد عبر Zoom.',
                'sort_order' => 2,
                'is_published' => true,
            ],
            [
                'question' => 'هل يوجد شهادات بعد إتمام الدورة؟',
                'answer' => 'نعم، يحصل كل متدرب على شهادة معتمدة بعد إتمام الدورة واجتياز متطلباتها بنجاح.',
                'sort_order' => 3,
                'is_published' => true,
            ],
            [
                'question' => 'ما هي طرق الدفع المتاحة؟',
                'answer' => 'نقبل الدفع النقدي، التحويل البنكي، والدفع عبر المحافظ الإلكترونية. يتم التحقق من الدفع يدويًا من قبل فريقنا.',
                'sort_order' => 4,
                'is_published' => true,
            ],
            [
                'question' => 'هل يمكنني استرجاع المبلغ إذا لم أتمكن من الحضور؟',
                'answer' => 'نعم، يمكنك طلب استرجاع المبلغ خلال 48 ساعة من التسجيل وقبل بدء الدورة بـ 24 ساعة على الأقل.',
                'sort_order' => 5,
                'is_published' => true,
            ],
        ];

        foreach ($faqs as $f) {
            Faq::create($f);
        }
    }
}
