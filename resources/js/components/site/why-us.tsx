import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function WhyUs() {
  const { t, isRTL } = useSite();
  const MoreArrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="px-2.5 py-[10px] sm:px-6 sm:py-[42px]" aria-labelledby="why-us-title">
      <div className="bg-hero text-hero-foreground relative mx-auto max-w-7xl overflow-hidden rounded-xl sm:rounded-[40px]">
        <div
          aria-hidden="true"
          className="photo-veil pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'url(/banner.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div aria-hidden="true" className="bg-black/40 pointer-events-none absolute inset-0" />

        <div className="relative z-[1] px-4 py-14 sm:px-[50px] sm:pt-20 sm:pb-16">
          <header className="mx-auto max-w-3xl text-center">
            <span className="bg-accent/15 text-accent inline-flex items-center rounded-full px-5 py-1.5 text-sm font-medium">
              {t.whyUs.label}
            </span>
            <h2 id="why-us-title" className="font-display mt-6 text-4xl leading-snug font-extrabold text-balance">
              {t.whyUs.titlePrefix} <span className="text-accent">{t.whyUs.titleAccent}</span>
            </h2>
            <p className="text-hero-foreground/90 mx-auto mt-5 max-w-2xl text-base leading-normal text-pretty">{t.whyUs.description}</p>
          </header>

          <div className="mt-12 flex flex-col gap-12 sm:mt-16 sm:grid sm:grid-cols-[minmax(0,1fr)_380px] sm:items-center sm:gap-14">
            <div className="order-2 min-w-0 sm:order-1">
              <div className="mt-7 grid gap-3">
                {t.whyUs.items.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[20px] bg-white/[0.08] p-5 backdrop-blur-md transition-transform duration-200 hover:-translate-y-0.5 hover:bg-white/[0.13] md:px-8 md:py-5"
                  >
                    <h4 className="font-display text-lg leading-snug font-bold sm:text-xl">{item.title}</h4>
                    <p className="text-hero-foreground/80 mt-2 text-sm leading-normal">{item.description}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="order-1 sm:order-2">
              <div className="relative mx-auto aspect-[4/3] w-full max-w-[420px] sm:mx-0 sm:w-[min(100%,380px)]">
                <span
                  aria-hidden="true"
                  className="bg-accent/25 absolute -start-[55px] -top-3 z-[1] block h-[92%] w-[82%] rounded-[20px] [transform:rotate(-12deg)_skewX(-8deg)]"
                />
                <span
                  aria-hidden="true"
                  className="bg-accent/25 absolute -end-[30px] -bottom-8 z-[1] block h-[52%] w-[48%] rotate-[10deg] rounded-[18px]"
                />
                <img
                  className="relative z-[2] block size-full rounded-[20px] object-cover"
                  src="/images/research.webp"
                  alt={t.whyUs.label}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>

        <footer className="border-white/15 bg-black/55 relative z-[1] border-t px-4 py-6 sm:flex sm:items-center sm:gap-10 sm:px-[50px] sm:py-7">
          <div className="grid flex-1 grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {t.whyUs.highlights.map((highlight, index) => (
              <article key={highlight.title} className={cn(index > 0 && 'lg:border-s lg:border-white/25 lg:ps-7')}>
                <h4 className="text-accent font-display text-base leading-snug font-bold">{highlight.title}</h4>
                <p className="text-hero-foreground/70 mt-2 text-sm leading-normal sm:max-w-[260px]">{highlight.description}</p>
              </article>
            ))}
          </div>
          <Link
            href={t.whyUs.moreHref}
            className="text-hero-foreground hover:text-accent mt-6 inline-flex items-center justify-center gap-2 text-base font-bold whitespace-nowrap transition-colors sm:mt-0"
          >
            <MoreArrow className="size-5" aria-hidden="true" />
            <span>{t.whyUs.moreLabel}</span>
          </Link>
        </footer>
      </div>
    </section>
  );
}
