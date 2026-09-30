import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Banner } from '@/types';
import { cn } from '@/lib/utils';
import { ArrowUpLeft, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSlide {
  key: string;
  image: string;
  title: React.ReactNode;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  staticCta?: boolean;
  alt: string;
}

export function Hero({ banners = [] }: { banners?: Banner[] }) {
  const { t, locale, isRTL } = useSite();
  const Arrow = isRTL ? ArrowUpLeft : ArrowUpRight;
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  const slides: HeroSlide[] = useMemo(() => {
    const cmsSlides: HeroSlide[] = banners.map((banner) => {
      const title = locale === 'ar' && banner.title_ar ? banner.title_ar : banner.title;

      return {
        key: `banner-${banner.id}`,
        image: banner.image.startsWith('http') ? banner.image : `/storage/${banner.image}`,
        title: title || t.hero.imageAlt,
        subtitle: (locale === 'ar' && banner.subtitle_ar ? banner.subtitle_ar : banner.subtitle) || '',
        ctaText: (locale === 'ar' && banner.cta_text_ar ? banner.cta_text_ar : banner.cta_text) || '',
        ctaLink: banner.cta_link || '',
        alt: title || t.hero.imageAlt,
      };
    });

    if (cmsSlides.length > 0) {
      return cmsSlides;
    }

    return [
      {
        key: 'static',
        image: '/banner.webp',
        title: (
          <>
            <span className="text-accent block">{t.hero.titleAccent1}</span>
            <span className="block">
              {t.hero.titleMain} <span className="text-accent">{t.hero.titleAccent2}</span>
              {t.hero.titleSuffix ? ` ${t.hero.titleSuffix}` : ''}
            </span>
          </>
        ),
        staticCta: true,
        alt: t.hero.imageAlt,
      },
    ];
  }, [banners, locale, t]);

  const count = slides.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const prefersReducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const goTo = useCallback((index: number) => setActiveIndex(((index % count) + count) % count), [count]);

  useEffect(() => {
    setActiveIndex(0);
  }, [count]);

  const autoplayEnabled = count > 1 && !isHovering && !prefersReducedMotion;

  useEffect(() => {
    if (!autoplayEnabled) return;

    const id = window.setInterval(() => setActiveIndex((current) => (current + 1) % count), 6000);

    return () => window.clearInterval(id);
  }, [autoplayEnabled, count]);

  const prev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);
  const next = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (count <= 1) return;

      if (e.key === 'ArrowLeft') {
        if (isRTL) {
          next();
        } else {
          prev();
        }
      } else if (e.key === 'ArrowRight') {
        if (isRTL) {
          prev();
        } else {
          next();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [count, isRTL, next, prev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;

    if (start === null || count <= 1) return;

    const delta = (e.changedTouches[0]?.clientX ?? start) - start;

    if (Math.abs(delta) < 40) return;

    if (delta < 0) {
      next();
    } else {
      prev();
    }
  };

  return (
    <section
      className="relative flex min-h-screen items-end overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label={t.hero.imageAlt}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        const ctaHref = slide.staticCta ? undefined : slide.ctaLink;

        return (
          <div
            key={slide.key}
            aria-hidden={!isActive}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-in-out',
              isActive ? 'z-10 opacity-100' : 'pointer-events-none opacity-0'
            )}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={index === 0 ? 'high' : undefined}
              className="absolute inset-0 size-full object-cover"
            />
            <div className="from-hero via-hero/70 to-hero/40 absolute inset-0 bg-gradient-to-t" />
            <div className="bg-hero/30 absolute inset-0" />

            <div className="relative mx-auto flex h-full w-full max-w-7xl items-end px-4 pb-28 pt-32 sm:px-6 lg:px-8">
              <div className="flex flex-col items-start text-start">
                <span className="border-accent/40 text-hero-foreground mb-5 inline-flex items-center gap-2 rounded-full border bg-white/10 px-4 py-1.5 text-xs font-medium backdrop-blur dark:bg-white/5">
                  <span className="bg-accent size-1.5 rounded-full" />
                  {t.hero.locationTag}
                </span>

                <h1 className="text-hero-foreground font-display max-w-3xl text-balance text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                  {slide.title}
                </h1>

                {slide.subtitle ? (
                  <p className="text-hero-foreground/90 mt-6 max-w-2xl text-base leading-normal sm:text-lg">{slide.subtitle}</p>
                ) : null}

                <div className="mt-9 flex flex-wrap items-center gap-3">
                  {slide.staticCta ? (
                    <>
                      <Link
                        href="/departments"
                        tabIndex={isActive ? 0 : -1}
                        className="border-hero-foreground/30 text-hero-foreground hover:border-accent hover:text-accent inline-flex items-center rounded-md border bg-white/5 px-6 py-3 text-sm font-bold backdrop-blur transition-colors dark:bg-white/5"
                      >
                        {t.hero.ctaPrimary}
                      </Link>
                      <Link
                        href="/about"
                        tabIndex={isActive ? 0 : -1}
                        className="bg-accent text-accent-foreground inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
                      >
                        {t.hero.ctaSecondary}
                        <Arrow className="size-4" aria-hidden="true" />
                      </Link>
                    </>
                  ) : ctaHref && slide.ctaText ? (
                    <Link
                      href={ctaHref}
                      tabIndex={isActive ? 0 : -1}
                      className="bg-accent text-accent-foreground inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
                    >
                      {slide.ctaText}
                      <Arrow className="size-4" aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        );
      })}


      {count > 1 && (
        <div className="absolute bottom-20 end-4 z-20 flex items-center gap-2 sm:bottom-24 sm:end-6 lg:end-8">
          <button
            type="button"
            onClick={prev}
            aria-label={t.hero.slider.prev}
            className="border-hero-foreground/30 text-hero-foreground hover:border-accent hover:text-accent inline-flex size-9 items-center justify-center rounded-full border bg-white/10 backdrop-blur transition-colors"
          >
            <PrevIcon className="size-4" aria-hidden="true" />
          </button>

          {slides.map((slide, index) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => goTo(index)}
              aria-label={t.hero.slider.goTo.replace('{n}', String(index + 1))}
              aria-current={index === activeIndex}
              className={cn(
                'rounded-full transition-all duration-300',
                index === activeIndex ? 'bg-accent h-1.5 w-6' : 'h-1.5 w-1.5 bg-white/50 hover:bg-white/80'
              )}
            />
          ))}

          <button
            type="button"
            onClick={next}
            aria-label={t.hero.slider.next}
            className="border-hero-foreground/30 text-hero-foreground hover:border-accent hover:text-accent inline-flex size-9 items-center justify-center rounded-full border bg-white/10 backdrop-blur transition-colors"
          >
            <NextIcon className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <span className="text-hero-foreground/60 absolute bottom-5 left-1/2 z-20 -translate-x-1/2 text-[11px] font-medium tracking-[0.3em]">
        SCROLL ↓
      </span>
    </section>
  );
}
