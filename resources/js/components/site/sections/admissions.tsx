import { buttonVariants } from '@/components/site/primitives/button';
import { Reveal } from '@/components/site/primitives/reveal';
import { SectionTag } from '@/components/site/primitives/section-tag';
import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

export function Admissions() {
    const { t } = useSite();
    const as = t.applicationSteps;

    return (
        <section aria-labelledby="admissions-heading" className="bg-cream py-[80px] site-md:py-[120px]">
            <div className="site-container grid gap-[38px] site-lg:grid-cols-[0.9fr_1.1fr] site-lg:gap-[72px]">
                <Reveal>
                    <SectionTag index="04" label={as.label} />
                    <h2 id="admissions-heading" className="text-site-h2 m-0 mt-[18px] text-ink font-semibold tracking-[-0.06em]">
                        {as.title} <span className="text-teal-dark">{as.titleAccent}</span>
                    </h2>
                    <p className="mt-[22px] max-w-[440px] text-[15px] leading-[2] text-ink-muted">{as.description}</p>
                    <Link href="/student/register" className={cn(buttonVariants({ variant: 'dark' }), 'mt-[30px]')}>
                        {as.cta}
                    </Link>
                </Reveal>

                <Reveal delay="delay">
                    <ol className="m-0 list-none p-0">
                        {as.steps.map((step, index) => (
                            <li
                                key={step.title}
                                className={cn(
                                    'border-line flex items-start gap-[20px] border-b py-[26px] site-md:gap-[34px]',
                                    index === 0 && 'border-t',
                                )}
                            >
                                <span className="font-site-latin pt-1 text-[12px] font-bold tracking-[0.1em] text-coral">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h3 className="m-0 text-[17px] font-semibold text-ink">{step.title}</h3>
                                    <p className="m-0 mt-2 text-[13px] leading-[2] text-ink-muted">{step.description}</p>
                                </div>
                                <span aria-hidden="true" className="pt-1 text-[16px] text-coral">
                                    ↗
                                </span>
                            </li>
                        ))}
                    </ol>
                </Reveal>
            </div>
        </section>
    );
}
