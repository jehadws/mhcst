import { InnerSection } from '@/components/site/primitives/inner-section';
import { Reveal } from '@/components/site/primitives/reveal';
import { useSite } from '@/context/site-context';
import { testimonials as defaultTestimonials, type Locale } from '@/data/i18n';

export interface TestimonialItem {
    name: string | Record<Locale, string>;
    quote: string | Record<Locale, string>;
    role?: Record<Locale, string>;
    role_title?: string;
    company?: string;
}

export function TestimonialsBand({ items }: { items?: TestimonialItem[] }) {
    const { t, tr } = useSite();
    const list: TestimonialItem[] = items && items.length > 0 ? items : defaultTestimonials;

    if (list.length === 0) return null;

    return (
        <InnerSection
            tone="paper"
            kicker={t.testimonials.title}
            title={t.testimonials.title}
            accent={t.testimonials.titleAccent}
            lead={t.testimonials.subtitle}
        >
            <div className="mt-2 grid gap-4 site-md:grid-cols-2">
                {list.slice(0, 4).map((item, index) => {
                    const name = typeof item.name === 'string' ? item.name : tr(item.name);
                    const role = item.role_title || item.company || (item.role ? tr(item.role) : '');
                    const quote = typeof item.quote === 'string' ? item.quote : tr(item.quote);

                    return (
                        <Reveal key={index} delay={index % 2 === 1 ? 'delay' : 'none'}>
                            <figure className="flex h-full flex-col border-t border-line pt-[22px]">
                                <span className="font-site-latin text-[46px] leading-[0.6] font-extrabold text-coral" aria-hidden="true">
                                    &ldquo;
                                </span>
                                <blockquote className="m-0 mt-5 text-[16px] leading-[1.9] font-semibold text-ink">{quote}</blockquote>
                                <figcaption className="mt-auto flex items-center gap-3 pt-7">
                                    <span className="bg-ink grid size-[38px] shrink-0 place-items-center rounded-full text-[13px] font-bold text-white">
                                        {name.trim().charAt(0)}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-[13px] font-bold">{name}</span>
                                        {role ? <span className="mt-0.5 block text-[11px] text-ink-muted">{role}</span> : null}
                                    </span>
                                </figcaption>
                            </figure>
                        </Reveal>
                    );
                })}
            </div>
        </InnerSection>
    );
}
