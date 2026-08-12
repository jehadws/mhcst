import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function CtaBanner() {
  const { t, isRTL } = useSite();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
      <div className="bg-hero shadow-lg shadow-black/20 relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-12">
        <img
          src="/images/campus-aerial.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-15"
        />
        <div className="relative">
          <h2 className="text-hero-foreground text-4xl font-extrabold sm:text-5xl">
            {t.ctaBanner.titleMain} <em className="text-accent not-italic">{t.ctaBanner.titleAccent}</em>
          </h2>
          <div className="mt-8 flex justify-center">
            <Link
              href="/contact"
              className="bg-accent text-accent-foreground inline-flex items-center gap-2 rounded-md px-8 py-4 text-base font-bold transition-transform hover:-translate-y-0.5"
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
