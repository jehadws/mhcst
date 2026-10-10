import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface InnerHeroProps {
    /** Two-digit page number shown in the decorative MHCST / NN index. Omit to hide the index. */
    index?: string;
    eyebrow: ReactNode;
    title: ReactNode;
    /** Trailing part of the heading, set in coral. */
    accent?: ReactNode;
    intro?: ReactNode;
    aside?: ReactNode;
    className?: string;
}

export function InnerHero({ index, eyebrow, title, accent, intro, aside, className }: InnerHeroProps) {
    return (
        <section className={cn('bg-ink relative overflow-hidden pb-[70px] pt-[60px] text-white site-md:pb-[80px] site-md:pt-[85px]', className)}>
            <span className="inner-ornament" aria-hidden="true" />

            <div className="site-container relative z-10 flex flex-wrap items-end justify-between gap-x-[60px] gap-y-[30px] max-[760px]:gap-y-[26px]">
                <div className="min-w-0 max-w-[780px]">
                    <span className="flex items-center gap-[10px] font-site-latin text-[10px] font-bold tracking-[0.1em] text-eyebrow-light">
                        <span className="bg-coral inline-block size-[7px] rounded-full" aria-hidden="true" />
                        <span>{eyebrow}</span>
                    </span>

                    <h1 className="m-[22px_0_18px] text-[clamp(2.9rem,7vw,5.75rem)] leading-[1.13] font-semibold tracking-[-0.07em]">
                        {title} {accent ? <span className="text-coral">{accent}</span> : null}
                    </h1>

                    {intro ? <p className="m-0 max-w-[560px] text-[15px] leading-[2] text-white/[0.68] site-md:text-[16px]">{intro}</p> : null}

                    {aside ? <div className="mt-[30px]">{aside}</div> : null}
                </div>

                {index ? (
                    <span
                        className="font-site-latin text-end text-[11px] leading-[2] font-semibold tracking-[0.18em] whitespace-nowrap text-white/35"
                        dir="ltr"
                        aria-hidden="true"
                    >
                        MHCST
                        <br />
                        <span className="text-coral text-[26px]">/{index}</span>
                    </span>
                ) : null}
            </div>
        </section>
    );
}
