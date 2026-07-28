<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Lead;

class LeadSeeder extends Seeder
{
    public function run(): void
    {
        $leads = [
            [
                'name' => 'عبدالرحمن الفيتوري',
                'email' => 'abdo@test.com',
                'phone' => '0911111122',
                'subject' => 'استفسار عن دورة Laravel',
                'message' => 'متى تبدأ الدورة القادمة؟ وهل يوجد خصم للمجموعات؟',
                'type' => 'quote_request',
                'status' => 'new',
            ],
            [
                'name' => 'سعاد البوسيفي',
                'email' => 'souad@test.com',
                'phone' => '0922222233',
                'subject' => 'شكوى',
                'message' => 'لم أتلقَ ردًا على استفساري السابق.',
                'type' => 'contact',
                'status' => 'in_progress',
            ],
            [
                'name' => 'كريم الزبيدي',
                'email' => 'karim@test.com',
                'phone' => '0933333344',
                'subject' => 'طلب تدريب للشركة',
                'message' => 'نريد تدريب 15 موظفًا على Excel المتقدم.',
                'type' => 'quote_request',
                'status' => 'new',
            ],
            [
                'name' => 'هبة الشريف',
                'email' => 'hiba@test.com',
                'phone' => '0944444455',
                'subject' => 'استفسار عام',
                'message' => 'هل تقدمون دورات أونلاين فقط؟',
                'type' => 'contact',
                'status' => 'closed',
            ],
        ];

        foreach ($leads as $l) {
            Lead::create($l);
        }
    }
}
