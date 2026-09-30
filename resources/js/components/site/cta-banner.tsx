import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function CtaBanner() {
  const { t, isRTL } = useSite();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6 lg:px-8">
      <div className="bg-hero relative overflow-hidden rounded-2xl px-6 py-20 text-center shadow-xl sm:px-12 sm:py-24">
        <img
          src="/banner.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover opacity-15"
        />
        <div className="relative">
          <h2 className="font-display text-hero-foreground text-4xl font-extrabold leading-tight sm:text-5xl">
            {t.ctaBanner.titleMain} <em className="text-accent not-italic">{t.ctaBanner.titleAccent}</em>
          </h2>
          <div className="mt-10 flex justify-center">
            <Link
              href="/contact"
              className="bg-accent text-accent-foreground inline-flex items-center gap-2 rounded-lg px-8 py-4 text-base font-bold shadow-lg transition-transform hover:-translate-y-0.5"
            >
              {t.ctaBanner.button}
              <Arrow className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
