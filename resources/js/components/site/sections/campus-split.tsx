import { buttonVariants } from '@/components/site/primitives/button';
import { Reveal } from '@/components/site/primitives/reveal';
import { SectionTag } from '@/components/site/primitives/section-tag';
import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

export function CampusSplit() {
    const { t } = useSite();

    return (
        <section aria-labelledby="campus-heading" className="bg-ink py-[80px] text-white site-md:py-[120px]">
            <div className="site-container grid items-center gap-[38px] site-lg:grid-cols-2 site-lg:gap-[72px]">
                <Reveal>
                    <SectionTag index="03" label={t.campus.label} light />
                    <h2 id="campus-heading" className="text-site-h2 m-0 mt-[18px] font-semibold tracking-[-0.06em]">
                        {t.campus.title} <span className="text-coral">{t.campus.titleAccent}</span>
                    </h2>
                    <p className="mt-[22px] max-w-[510px] text-[15px] leading-[2] text-white/[0.68] site-md:text-[16px]">{t.campus.description}</p>
                    <Link href="/about" className={cn(buttonVariants({ variant: 'outline-light' }), 'mt-[30px]')}>
                        {t.campus.discover}
                    </Link>
                </Reveal>

                <Reveal delay="delay">
                    <div className="relative">
                        <img
                            src="/images/campus-life.webp"
                            alt={t.campus.cards[2].name}
                            loading="lazy"
                            decoding="async"
                            className="h-[300px] w-full rounded-ss-[70px] object-cover site-md:h-[420px] site-lg:rounded-ss-[130px]"
                        />
                        <div className="absolute bottom-4 start-4 flex items-center gap-3 bg-black/45 px-4 py-2 backdrop-blur-sm">
                            <span className="font-site-latin text-[9px] font-bold tracking-[0.14em] text-mint">CAMPUS / 01</span>
                            <span className="text-[11px] text-white/85">{t.campus.cards[2].name}</span>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
