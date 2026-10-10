import { Reveal } from '@/components/site/primitives/reveal';
import { SectionHead } from '@/components/site/primitives/section-head';
import { useSite } from '@/context/site-context';

const SYMBOLS = ['◎', '↗', '✦', '❖'];

export function Values() {
    const { t } = useSite();
    const wy = t.whyUs;

    return (
        <section aria-labelledby="values-heading" className="bg-paper py-[80px] site-md:py-[120px]">
            <div className="site-container">
                <Reveal>
                    <SectionHead
                        index="05"
                        label={wy.groupTitle}
                        title={
                            <span id="values-heading">
                                {wy.titlePrefix} <span className="text-teal-dark">{wy.titleAccent}</span>
                            </span>
                        }
                    />
                </Reveal>

                <div className="grid gap-[24px] site-md:grid-cols-2 site-lg:grid-cols-4">
                    {wy.items.map((item, index) => (
                        <Reveal key={item.title} delay={index === 1 ? 'delay' : index === 2 ? 'delay-2' : 'none'} className="h-full">
                            <article className="border-line h-full border bg-white p-[26px] transition-colors duration-300 hover:border-teal/40">
                                <div className="flex items-center justify-between">
                                    <span className="font-site-latin text-[11px] font-bold tracking-[0.1em] text-coral">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    <span aria-hidden="true" className="text-[18px] text-teal">
                                        {SYMBOLS[index % SYMBOLS.length]}
                                    </span>
                                </div>
                                <h3 className="m-0 mt-[34px] text-[17px] leading-[1.5] font-semibold text-ink">{item.title}</h3>
                                <p className="m-0 mt-3 text-[13px] leading-[2] text-ink-muted">{item.description}</p>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
