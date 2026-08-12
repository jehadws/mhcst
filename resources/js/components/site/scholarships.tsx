import { useSite } from '@/context/site-context';
import { useRef } from 'react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

export function Scholarships() {
  const { t, isRTL } = useSite();
  const scroller = useRef<HTMLDivElement>(null);
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const scrollBy = (dir: number) => {
    const amount = dir * 340 * (isRTL ? -1 : 1);
    scroller.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className="bg-hero text-hero-foreground py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl text-start">
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              {t.scholarships.title} <span className="text-accent">{t.scholarships.titleAccent}</span>
            </h2>
            <p className="text-hero-foreground/75 mt-4 leading-relaxed">{t.scholarships.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="border-hero-foreground/25 hover:border-accent hover:text-accent flex size-11 items-center justify-center rounded-full border transition-colors"
              aria-label="Previous"
            >
              {isRTL ? <ChevronRight className="size-5" /> : <ChevronLeft className="size-5" />}
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="border-hero-foreground/25 hover:border-accent hover:text-accent flex size-11 items-center justify-center rounded-full border transition-colors"
              aria-label="Next"
            >
              {isRTL ? <ChevronLeft className="size-5" /> : <ChevronRight className="size-5" />}
            </button>
            <Link
              href="/contact"
              className="bg-accent text-accent-foreground hidden rounded-md px-5 py-2.5 text-sm font-bold sm:inline-block"
            >
              {t.scholarships.viewAll}
            </Link>
          </div>
        </div>

        <div
          ref={scroller}
          className="mt-12 flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {t.scholarships.items.map((s) => (
            <article
              key={s.title}
              className="border-hero-foreground/10 hover:border-accent/50 flex min-h-64 w-[300px] shrink-0 snap-start flex-col rounded-2xl border bg-white/5 p-6 text-start backdrop-blur transition-colors dark:bg-white/5"
            >
              <span className="bg-accent text-accent-foreground inline-flex w-fit rounded-full px-3 py-1 text-sm font-extrabold">
                {s.badge}
              </span>
              <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
              <p className="text-hero-foreground/70 mt-3 flex-1 text-sm leading-relaxed">{s.description}</p>
              <Link
                href="/contact"
                className="text-accent hover:text-hero-foreground mt-4 inline-flex items-center gap-1 self-start text-sm font-bold"
              >
                {t.scholarships.readMore}
                <Arrow className="size-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
