import { SeoHead } from '@/components/seo-head';
import { InnerHero } from '@/components/site/primitives/inner-hero';
import { FaqList, type FaqItem } from '@/components/site/sections/faq-list';
import { SiteLayout } from '@/components/site/site-layout';
import { useSite } from '@/context/site-context';

interface Props {
    faqs?: FaqItem[];
}

export default function PublicFaqPage({ faqs }: Props) {
    const { t, locale } = useSite();

    return (
        <>
            <SeoHead
                title={t.nav.faq}
                description={
                    locale === 'ar'
                        ? 'الأسئلة الشائعة حول التسجيل والدفع والشهادات'
                        : 'Frequently asked questions about enrollment, payment, and certificates'
                }
            />
            <SiteLayout headerVariant="solid">
                <InnerHero index="04" eyebrow={t.nav.faq} title={t.faq.title} intro={t.faq.subtitle} />
                <FaqList items={faqs} />
            </SiteLayout>
        </>
    );
}
