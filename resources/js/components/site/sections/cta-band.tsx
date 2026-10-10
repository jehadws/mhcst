import { buttonVariants } from '@/components/site/primitives/button';
import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

export function CtaBand() {
    const { t } = useSite();

    return (
        <section aria-labelledby="cta-heading" className="bg-coral relative overflow-hidden text-white">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -end-[180px] -top-[180px] size-[520px] rounded-full border border-white/20"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -end-[110px] -top-[110px] size-[380px] rounded-full border border-white/15"
            />

            <div className="site-container relative z-10 flex min-h-[415px] flex-col items-start justify-center py-[80px]">
                <span className="font-site-latin text-[10px] font-semibold tracking-[0.14em] text-white/[0.72]">
                    {t.ctaBanner.eyebrow}
                </span>
                <h2 id="cta-heading" className="text-site-cta m-0 mt-4 max-w-[720px] font-semibold tracking-[-0.07em]">
                    {t.ctaBanner.title}
                </h2>
                <p className="m-0 mt-5 max-w-[520px] text-[15px] leading-[2] text-white/[0.85] site-md:text-[16px]">
                    {t.ctaBanner.description}
                </p>
                <Link href="/student/register" className={cn(buttonVariants({ variant: 'light' }), 'mt-[34px]')}>
                    {t.ctaBanner.button}
                </Link>
            </div>
        </section>
    );
}
