import { SeoHead } from '@/components/seo-head';
import { CtaBand } from '@/components/site/sections/cta-band';
import { TestimonialsBand, type TestimonialItem } from '@/components/site/sections/testimonials-band';
import { InnerHero } from '@/components/site/primitives/inner-hero';
import { InnerSection } from '@/components/site/primitives/inner-section';
import { Reveal } from '@/components/site/primitives/reveal';
import { SiteLayout } from '@/components/site/site-layout';
import { useSite } from '@/context/site-context';
import { aboutIcon } from '@/lib/about-icons';
import type { AboutItemContent, AboutMilestoneContent, AboutPageContent } from '@/types';
import { useMemo } from 'react';

interface Props {
    testimonials?: TestimonialItem[];
    aboutContent?: AboutPageContent | null;
}

const resolveImage = (image: string) => (image.startsWith('http') || image.startsWith('/') ? image : `/storage/${image}`);

export default function PublicAboutPage({ testimonials, aboutContent }: Props) {
    const { t, locale, tr } = useSite();
    const isAr = locale === 'ar';

    const fallback = useMemo(
        () => ({
            pillars: [
                {
                    icon: 'target',
                    title: 'Deliver accredited professional training that empowers individuals and organisations.',
                    title_ar: 'تقديم برامج تدريبية احترافية معتمدة تُمكّن الأفراد والمؤسسات من تطوير مهاراتهم.',
                    body: 'Our programs combine accredited curricula with applied practice so that graduates are ready for the labour market.',
                    body_ar: 'جمع مناهجنا بين الاعتماد والتطبيق العملي ليخرج المتدرب جاهزاً لسوق العمل.',
                },
                {
                    icon: 'eye',
                    title: 'To be the premier reference for accredited professional training in Libya and the region.',
                    title_ar: 'أن نكون المرجع الأول في التدريب المهني المعتمد في ليبيا والمنطقة.',
                    body: 'We measure that ambition by the quality of our instructors, our facilities, and the outcomes of our graduates.',
                    body_ar: 'نقيس هذا الطموح بجودة المدربين والمنشآت ومخرجات المتخرجين.',
                },
                {
                    icon: 'lightbulb',
                    title: 'A message from the college leadership',
                    title_ar: 'رسالة من إدارة الكلية',
                    body: 'We believe every learner deserves training they can trust — and a certificate that changes their career path.',
                    body_ar: 'نؤمن بأن كل متعلم يستحق تدريباً يثق به وشهادة تُغيّر مساره المهني.',
                },
            ] as AboutItemContent[],
            values: [
                { icon: 'shield-check', title: 'Accredited & recognized', title_ar: 'الاعتماد والجودة', body: 'Certificates recognized by employers and professional bodies.', body_ar: 'شهادات معتمدة ومعترف بها إقليمياً ودولياً.' },
                { icon: 'users', title: 'Expert instructors', title_ar: 'مدربون من الخبراء', body: 'Practitioners with real-world expertise.', body_ar: 'نخبة من الممارسين الحقيقيين في مجالاتهم.' },
                { icon: 'graduation-cap', title: 'Flexible learning', title_ar: 'مرونة التعلم', body: 'Onsite, online, and blended options.', body_ar: 'حضوري وعبر الإنترنت ومدمج.' },
                { icon: 'award', title: 'Practical application', title_ar: 'التطبيق العملي', body: 'Real projects for your portfolio.', body_ar: 'مشاريع حقيقية لمعرض أعمالك.' },
            ] as AboutItemContent[],
            milestones: [
                { year: '2010', label: 'Founded', label_ar: 'التأسيس' },
                { year: '2016', label: 'First Accreditation', label_ar: 'أول اعتماد' },
                { year: '2019', label: '5,000+ Graduates', label_ar: '٥٠٠+ خريج' },
                { year: '2023', label: 'Digital Expansion', label_ar: 'توسّع رقمي' },
                { year: '2025', label: '20,000+ Learners', label_ar: '٢٠٠٠+ متدرب' },
            ] as AboutMilestoneContent[],
        }),
        [],
    );

    const pillars = aboutContent?.pillars?.length ? aboutContent.pillars : fallback.pillars;
    const values = aboutContent?.values?.length ? aboutContent.values : fallback.values;
    const milestones = aboutContent?.milestones?.length ? aboutContent.milestones : fallback.milestones;

    const hero = aboutContent?.hero;
    const heroTitle = tr({ en: hero?.title || t.about.title, ar: hero?.title_ar || t.about.title });
    const heroIntro = tr({ en: hero?.description || t.about.body, ar: hero?.description_ar || hero?.description || t.about.body });
    const campusImage = resolveImage(hero?.image || '/images/research.webp');

    return (
        <>
            <SeoHead title={isAr ? 'من نحن' : 'About Us'} description={heroIntro} />
            <SiteLayout headerVariant="solid">
                <InnerHero index="01" eyebrow={t.nav.about} title={heroTitle} intro={heroIntro} />

                <InnerSection tone="cream" kicker={t.nav.about}>
                    <div className="mt-2 grid gap-x-4 site-md:grid-cols-3">
                        {pillars.map((pillar, index) => (
                            <article key={index} className="border-t border-line pt-[22px]">
                                <span className="font-site-latin text-[11px] font-bold text-coral" dir="ltr">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <h3 className="m-[22px_0_8px] text-[20px] font-semibold leading-snug tracking-[-0.03em]">
                                    {tr({ en: pillar.title, ar: pillar.title_ar })}
                                </h3>
                                <p className="m-0 text-[13px] leading-[1.95] text-ink-muted">{tr({ en: pillar.body, ar: pillar.body_ar })}</p>
                            </article>
                        ))}
                    </div>
                </InnerSection>

                <section className="bg-ink text-white">
                    <div className="site-container grid items-center site-lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="relative h-[320px] overflow-hidden site-md:h-[460px] site-lg:h-[560px]">
                            <img src={campusImage} alt={t.campus.title} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                        </div>
                        <Reveal className="p-[35px] site-md:p-[60px]">
                            <span className="font-site-latin text-[10px] font-bold tracking-[0.13em] text-kicker-light">{t.campus.label}</span>
                            <h2 className="m-[18px_0_25px] text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.24] font-semibold tracking-[-0.06em]">
                                {t.campus.title} <span className="text-coral">{t.campus.titleAccent}</span>
                            </h2>
                            <p className="m-0 max-w-[470px] text-[15px] leading-[2.05] text-white/[0.64]">{t.campus.description}</p>

                            <div className="mt-9 grid gap-7 site-md:grid-cols-2">
                                {t.campus.cards.map((card, index) => (
                                    <article key={card.name} className="border-t border-white/15 pt-[18px]">
                                        <b className="font-site-latin text-[11px] font-bold text-coral" dir="ltr">
                                            {String(index + 1).padStart(2, '0')}
                                        </b>
                                        <h3 className="m-[18px_0_8px] text-[17px] font-semibold">{card.name}</h3>
                                        <p className="m-0 text-[12px] leading-[1.95] text-white/[0.55]">{card.desc}</p>
                                    </article>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </section>

                <InnerSection tone="paper" kicker={t.whyUs.groupTitle} title={t.whyUs.titlePrefix} accent={t.whyUs.titleAccent} lead={t.whyUs.description}>
                    <ul className="m-0 grid list-none gap-0 p-0 site-md:grid-cols-2">
                        {values.map((value, index) => {
                            const Icon = aboutIcon(value.icon);
                            return (
                                <li key={index} className="flex items-start gap-4 border-b border-line py-[22px] site-md:odd:pe-8 site-md:even:border-s site-md:even:ps-8">
                                    <span className="bg-cream text-teal-dark grid size-[38px] shrink-0 place-items-center rounded-[2px]">
                                        <Icon className="size-[17px]" aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0">
                                        <h3 className="m-0 text-[16px] font-semibold">{tr({ en: value.title, ar: value.title_ar })}</h3>
                                        <p className="m-0 mt-1.5 text-[13px] leading-[1.9] text-ink-muted">{tr({ en: value.body, ar: value.body_ar })}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </InnerSection>

                <InnerSection
                    tone="cream"
                    kicker={t.statsBar.founded}
                    title={isAr ? 'محطات مسيرتنا' : 'Our milestones'}
                    lead={isAr ? 'من التأسيس إلى اليوم — محطات صنعت الكلية.' : 'From founding day to today — the milestones that shaped the college.'}
                >
                    <div className="grid grid-cols-2 gap-x-6 gap-y-9 site-md:grid-cols-3 site-lg:grid-cols-5">
                        {milestones.map((milestone, index) => (
                            <article key={milestone.year} className={index > 0 ? 'site-lg:border-s site-lg:border-line site-lg:ps-7' : undefined}>
                                <p className="font-site-latin m-0 text-[34px] leading-none font-extrabold tracking-[-0.05em] text-teal-dark" dir="ltr">
                                    {milestone.year}
                                </p>
                                <p className="mt-2 text-[13px] font-semibold text-ink-muted">{tr({ en: milestone.label, ar: milestone.label_ar })}</p>
                            </article>
                        ))}
                    </div>
                </InnerSection>

                <TestimonialsBand items={testimonials} />
                <CtaBand />
            </SiteLayout>
        </>
    );
}
