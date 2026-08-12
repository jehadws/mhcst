import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function CtaBanner() {
  const { t, locale } = useSite();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="bg-hero text-hero-foreground py-20 sm:py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
        <div>
          <p className="text-hero-accent text-xs font-bold tracking-[0.2em] uppercase">{t.ctaBanner.badge}</p>
          <h2 className="mt-3 font-serif text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">{t.ctaBanner.title}</h2>
        </div>
        <Link
          href="/contact"
          className="bg-hero-accent text-hero-accent-foreground hover:bg-hero-accent/90 inline-flex shrink-0 items-center gap-2 rounded-full px-8 py-4 text-sm font-bold transition-colors"
        >
          {t.ctaBanner.button}
          <Arrow className="size-4" />
        </Link>
      </div>
    </section>
  );
}
