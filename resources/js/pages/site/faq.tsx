import { SeoHead } from '@/components/seo-head';
import { CtaBanner } from '@/components/site/cta-banner';
import { Faq } from '@/components/site/faq';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { PageHero } from '@/components/site/page-hero';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite } from '@/context/site-context';

interface FaqItem {
  question: string;
  answer: string;
}

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
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageHero title={t.faq.title} description={t.faq.subtitle} crumbs={[{ label: t.nav.faq, href: '/faq' }]} />
          <Faq items={faqs} />
          <CtaBanner />
        </main>
        <SiteFooter />
        <FloatingButtons />
      </div>
    </>
  );
}
