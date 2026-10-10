import { InnerSection } from '@/components/site/primitives/inner-section';
import { TextLink } from '@/components/site/primitives/text-link';
import { useSite } from '@/context/site-context';
import { faqs as defaultFaqs, type Locale } from '@/data/i18n';

export interface FaqItem {
    question?: string;
    answer?: string;
    q?: Record<Locale, string>;
    a?: Record<Locale, string>;
}

export function FaqList({ items }: { items?: FaqItem[] }) {
    const { t, tr, locale } = useSite();
    const list: FaqItem[] = items && items.length > 0 ? items : defaultFaqs;

    return (
        <InnerSection
            tone="cream"
            kicker={t.nav.faq}
            title={t.faq.title}
            lead={t.faq.subtitle}
        >
            <div className="mt-2 border-t border-line">
                {list.map((item, idx) => {
                    const question = item.question || (item.q ? tr(item.q) : '');
                    const answer = item.answer || (item.a ? tr(item.a) : '');

                    return (
                        <details key={idx} className="group border-b border-line py-1">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-[16px] font-semibold text-ink marker:hidden site-md:text-[18px]">
                                <span>{question}</span>
                                <span
                                    className="font-site-latin shrink-0 text-[24px] leading-none font-normal text-coral transition-transform duration-200 group-open:rotate-45"
                                    aria-hidden="true"
                                >
                                    +
                                </span>
                            </summary>
                            <p className="m-0 max-w-[610px] pb-5 text-[14px] leading-[2] text-ink-muted">{answer}</p>
                        </details>
                    );
                })}
            </div>

            <p className="mt-9 text-[14px] text-ink-muted">
                {locale === 'ar' ? 'لم تجد إجابتك؟ ' : "Can't find your answer? "}
                <TextLink href="/contact" className="align-baseline">
                    {locale === 'ar' ? 'تواصل مع الفريق' : 'Talk to our team'}
                </TextLink>
            </p>
        </InnerSection>
    );
}
