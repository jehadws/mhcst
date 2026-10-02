import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function CtaBanner() {
  const { t, isRTL } = useSite();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:px-8">
      <div className="border-border bg-card relative flex flex-col gap-8 rounded-[24px] border px-5 py-6 shadow-xl sm:px-9 sm:py-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:rounded-[32px] lg:px-[58px] lg:py-10">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="text-accent text-sm font-bold">{t.ctaBanner.eyebrow}</span>
            <span aria-hidden="true" className="bg-accent h-0.5 w-8 rounded-full" />
          </div>
          <h2 className="text-primary font-display mt-3 text-3xl leading-tight font-extrabold sm:text-4xl">{t.ctaBanner.title}</h2>
          <p className="text-muted-foreground mt-3 max-w-xl text-[15px] leading-relaxed">{t.ctaBanner.description}</p>
        </div>

        <Link
          href="/contact"
          className="bg-primary text-primary-foreground shadow-primary/20 inline-flex shrink-0 items-center gap-2.5 self-start rounded-[14px] px-7 py-3.5 text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5 lg:self-center"
        >
          {t.ctaBanner.button}
          <Arrow className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
