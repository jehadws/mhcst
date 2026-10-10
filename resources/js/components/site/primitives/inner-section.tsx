import { Reveal } from '@/components/site/primitives/reveal';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Tone = 'paper' | 'cream' | 'ink';

const toneClass: Record<Tone, string> = {
    paper: 'bg-paper text-ink',
    cream: 'bg-cream text-ink',
    ink: 'bg-ink text-white',
};

interface InnerSectionProps {
    kicker: ReactNode;
    title?: ReactNode;
    /** Trailing part of the heading, set in teal. */
    accent?: ReactNode;
    lead?: ReactNode;
    children?: ReactNode;
    tone?: 'paper' | 'cream';
    headingId?: string;
    className?: string;
}

export function InnerSection({ kicker, title, accent, lead, children, tone = 'paper', headingId, className }: InnerSectionProps) {
    return (
        <section id={headingId} className={cn(toneClass[tone], 'py-[75px] site-md:py-[110px]', className)}>
            <div className="site-container">
                <Reveal>
                    <div className="site-lg:grid site-lg:grid-cols-[200px_1fr] site-lg:gap-[90px]">
                        <div className={cn('font-site-latin mb-[28px] text-[10px] font-bold tracking-[0.13em] text-teal-dark site-lg:mb-0 site-lg:pt-2', !title && !lead && !children && 'hidden')}>
                            {kicker}
                        </div>
                        <div className="min-w-0">
                            {title ? (
                                <h2 className="m-0 mb-[25px] text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.24] font-semibold tracking-[-0.06em]">
                                    {title} {accent ? <span className="text-teal">{accent}</span> : null}
                                </h2>
                            ) : null}
                            {lead ? <p className="m-0 mb-7 max-w-[570px] text-[15px] leading-[2.05] text-ink-muted">{lead}</p> : null}
                            {children}
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}

interface ProseProps {
    children: ReactNode;
    className?: string;
}

/** Long-form body copy in the kit's reading rhythm. */
export function Prose({ children, className }: ProseProps) {
    return <div className={cn('max-w-[680px] space-y-5 text-[15px] leading-[2.05] text-ink-muted', className)}>{children}</div>;
}

/** ✓-marked list used for requirements and included items. */
export function CheckList({ items, className }: { items: ReactNode[]; className?: string }) {
    return (
        <ul className={cn('m-0 mt-[10px] max-w-[640px] list-none p-0', className)}>
            {items.map((item, i) => (
                <li key={i} className="relative flex items-start gap-3 border-b border-line py-[17px] text-[14px] text-ink-muted">
                    <span className="font-site-latin mt-px shrink-0 text-[14px] font-bold text-coral" aria-hidden="true">
                        ✓
                    </span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

/** Kit's admissions step rows: coral number, title, description. */
export function StepList({ items, className }: { items: { title: ReactNode; body?: ReactNode }[]; className?: string }) {
    return (
        <div className={cn('border-t border-line', className)}>
            {items.map((item, i) => (
                <div key={i} className="grid grid-cols-[58px_1fr] gap-[18px] border-b border-line py-[24px] site-md:grid-cols-[70px_1fr] site-md:gap-5">
                    <span className="font-site-latin pt-1 text-[12px] font-bold text-coral" dir="ltr">
                        {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                        <h3 className="m-0 mb-[6px] text-[20px] font-semibold tracking-[-0.03em]">{item.title}</h3>
                        {item.body ? <p className="m-0 text-[13px] leading-[1.9] text-ink-muted">{item.body}</p> : null}
                    </div>
                </div>
            ))}
        </div>
    );
}

/** Hairline-ruled numbered rows: index, body, trailing affordance. */
export function NumberedRows({
    items,
    className,
}: {
    items: { index: number; title: ReactNode; body?: ReactNode; meta?: ReactNode; action?: ReactNode }[];
    className?: string;
}) {
    return (
        <div className={cn('border-t border-line', className)}>
            {items.map((item) => (
                <div
                    key={item.index}
                    className="grid grid-cols-[45px_1fr_38px] items-start gap-[10px] border-b border-line py-[26px] site-md:grid-cols-[90px_1fr_48px] site-md:gap-[25px] site-md:py-8"
                >
                    <span className="font-site-latin pt-1 text-[12px] font-bold text-coral" dir="ltr">
                        {String(item.index).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                        <h3 className="m-0 mb-2 text-[19px] font-semibold tracking-[-0.03em] site-md:text-[25px]">{item.title}</h3>
                        {item.body ? <p className="m-0 mb-4 text-[12px] leading-[1.9] text-ink-muted site-md:text-[14px]">{item.body}</p> : null}
                        {item.meta}
                    </div>
                    <div className="flex justify-end">{item.action}</div>
                </div>
            ))}
        </div>
    );
}
