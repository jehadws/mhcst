import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight } from 'lucide-react';

export function Hero() {
  const { t, isRTL } = useSite();
  const Arrow = isRTL ? ArrowUpLeft : ArrowUpRight;

  return (
    <section className="relative flex min-h-screen items-end overflow-hidden">
      <img src="/images/campus-aerial.png" alt={t.hero.imageAlt} className="absolute inset-0 size-full object-cover" />
      <div className="from-hero via-hero/70 to-hero/40 absolute inset-0 bg-gradient-to-t" />
      <div className="bg-hero/30 absolute inset-0" />

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-28 pt-32 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start text-start">
          <span className="border-accent/40 text-hero-foreground mb-5 inline-flex items-center gap-2 rounded-full border bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur dark:bg-white/5">
            <span className="bg-accent size-1.5 rounded-full" />
            {t.hero.locationTag}
          </span>

          <h1 className="text-hero-foreground max-w-3xl text-balance text-4xl font-extrabold leading-[1.15] sm:text-5xl lg:text-6xl">
            <span className="text-accent block">{t.hero.titleAccent1}</span>
            <span className="block">
              {t.hero.titleMain} <span className="text-accent">{t.hero.titleAccent2}</span>
              {t.hero.titleSuffix ? ` ${t.hero.titleSuffix}` : ''}
            </span>
          </h1>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/departments"
              className="border-hero-foreground/30 text-hero-foreground hover:border-accent hover:text-accent inline-flex items-center rounded-md border bg-white/5 px-6 py-3 text-sm font-bold backdrop-blur transition-colors dark:bg-white/5"
            >
              {t.hero.ctaPrimary}
            </Link>
            <Link
              href="/about"
              className="bg-accent text-accent-foreground inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
            >
              {t.hero.ctaSecondary}
              <Arrow className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <span className="text-hero-foreground/60 absolute bottom-5 left-1/2 -translate-x-1/2 text-[11px] font-medium tracking-[0.3em]">
        SCROLL ↓
      </span>
    </section>
  );
}
