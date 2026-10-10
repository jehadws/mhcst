import { Reveal } from '@/components/site/primitives/reveal';
import { SectionTag } from '@/components/site/primitives/section-tag';
import { TextLink } from '@/components/site/primitives/text-link';
import { useSite } from '@/context/site-context';

export function IntroStatement() {
    const { t } = useSite();

    return (
        <section aria-labelledby="intro-heading" className="bg-cream py-[80px] site-md:py-[120px]">
            <div className="site-container grid gap-[30px] site-lg:grid-cols-[0.8fr_1.2fr] site-lg:gap-[72px]">
                <Reveal>
                    <SectionTag index="01" label={t.nav.about} />
                </Reveal>
                <Reveal delay="delay">
                    <h2 id="intro-heading" className="text-site-h2 m-0 text-ink font-semibold tracking-[-0.06em]">
                        {t.about.title}
                    </h2>
                    <p className="mt-[26px] max-w-[620px] text-[15px] leading-[2] text-ink-muted site-md:text-[16px]">{t.about.body}</p>
                    <TextLink href={t.whyUs.moreHref} className="mt-[26px]">
                        {t.whyUs.moreLabel}
                    </TextLink>
                </Reveal>
            </div>
        </section>
    );
}
