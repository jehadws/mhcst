import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import type { Banner } from '@/types';
import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;
const DRAG_INTENT_PX = 8;

interface HeroSlide {
  key: string;
  image: string;
  title: React.ReactNode;
  tabLabel?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  staticCta?: boolean;
  alt: string;
}

export function Hero({ banners = [] }: { banners?: Banner[] }) {
  const { t, locale, isRTL } = useSite();

  const slides: HeroSlide[] = useMemo(() => {
    const cmsSlides: HeroSlide[] = banners.map((banner) => {
      const title = locale === 'ar' && banner.title_ar ? banner.title_ar : banner.title;

      return {
        key: `banner-${banner.id}`,
        image: banner.image.startsWith('http') ? banner.image : `/storage/${banner.image}`,
        title: title || t.hero.imageAlt,
        tabLabel: title || '',
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
  const [isPageHidden, setIsPageHidden] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const isDragIntent = useRef(false);
  const suppressClick = useRef(false);

  const prefersReducedMotion = useMemo(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  const goTo = useCallback((index: number) => setActiveIndex(((index % count) + count) % count), [count]);

  useEffect(() => {
    setActiveIndex(0);
  }, [count]);

  useEffect(() => {
    const handleVisibility = () => setIsPageHidden(document.hidden);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const autoplayEnabled = count > 1 && !isHovering && !isPageHidden && !prefersReducedMotion;

  useEffect(() => {
    if (!autoplayEnabled) return;

    const id = window.setInterval(() => setActiveIndex((current) => (current + 1) % count), AUTOPLAY_MS);

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

  const handlePointerDown = (e: React.PointerEvent) => {
    if (count <= 1 || !e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;

    dragStart.current = { x: e.clientX, y: e.clientY };
    isDragIntent.current = false;
    suppressClick.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const start = dragStart.current;

    if (!start || isDragIntent.current) return;

    if (Math.abs(e.clientX - start.x) < DRAG_INTENT_PX && Math.abs(e.clientY - start.y) < DRAG_INTENT_PX) return;

    isDragIntent.current = true;

    // Unlike touches, mouse pointers are not implicitly captured, so claim the
    // drag to keep receiving moves once the cursor leaves the hero.
    if (e.pointerType === 'mouse') {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const start = dragStart.current;

    dragStart.current = null;
    suppressClick.current = isDragIntent.current;
    isDragIntent.current = false;

    if (!start || count <= 1) return;

    const delta = e.clientX - start.x;

    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;

    // In RTL the slides flow right-to-left, so a swipe right moves forward.
    if (isRTL ? delta > 0 : delta < 0) {
      next();
    } else {
      prev();
    }
  };

  const handlePointerCancel = () => {
    dragStart.current = null;
    isDragIntent.current = false;
  };

  // A swipe that ends on top of a CTA link or slide tab must not count as a click.
  const handleDraggedClick = (e: React.MouseEvent) => {
    if (!suppressClick.current) return;

    e.preventDefault();
    e.stopPropagation();
    suppressClick.current = false;
  };

  return (
    <section
      className="bg-hero relative isolate mt-14 min-h-[max(420px,60svh)] cursor-grab touch-pan-y overflow-hidden select-none active:cursor-grabbing sm:mt-0 sm:min-h-screen"
      role="region"
      aria-roledescription="carousel"
      aria-label={t.hero.imageAlt}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClickCapture={handleDraggedClick}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeIndex;
        const ctaHref = slide.staticCta ? undefined : slide.ctaLink;

        return (
          <article
            key={slide.key}
            aria-hidden={!isActive}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-in-out',
              isActive ? 'z-10 opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              fetchPriority={index === 0 ? 'high' : undefined}
              className="absolute inset-0 size-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.7))]" />

            <div className="relative mx-auto flex h-full max-w-6xl flex-col items-center justify-end px-4 pt-10 pb-14 text-center sm:px-6 sm:pt-[calc(80px+3rem)] sm:pb-[calc(70px+2.5rem)] lg:px-8">
              <h1
                className={cn(
                  'text-hero-foreground font-display text-[clamp(2rem,9vw,2.6rem)] leading-[1.15] font-semibold text-balance sm:text-[clamp(2.25rem,5vw,4.5rem)]',
                  locale === 'ar' ? '' : 'tracking-tight',
                )}
              >
                {slide.title}
              </h1>

              {slide.subtitle ? (
                <p className="text-hero-foreground sm:text-hero-foreground/90 mt-5 max-w-[1100px] text-sm leading-relaxed font-semibold text-pretty sm:mt-6 sm:text-[1.4rem] sm:font-medium">
                  {slide.subtitle}
                </p>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                {slide.staticCta ? (
                  <>
                    <Link
                      href="/departments"
                      tabIndex={isActive ? 0 : -1}
                      className="border-hero-foreground/40 text-hero-foreground hover:border-accent hover:text-accent inline-flex items-center justify-center rounded-lg border bg-white/10 px-6 py-2.5 text-sm font-bold backdrop-blur transition-colors sm:py-3 dark:bg-white/5"
                    >
                      {t.hero.ctaPrimary}
                    </Link>
                    <Link
                      href="/about"
                      tabIndex={isActive ? 0 : -1}
                      className="bg-accent text-accent-foreground inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 hover:brightness-110 sm:py-3"
                    >
                      {t.hero.ctaSecondary}
                    </Link>
                  </>
                ) : ctaHref && slide.ctaText ? (
                  <Link
                    href={ctaHref}
                    tabIndex={isActive ? 0 : -1}
                    className="bg-accent text-accent-foreground inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 hover:brightness-110 sm:py-3"
                  >
                    {slide.ctaText}
                  </Link>
                ) : null}
              </div>

              {count > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2 md:hidden">
                  {slides.map((slide, dotIndex) => (
                    <button
                      key={`dot-${slide.key}`}
                      type="button"
                      onClick={() => goTo(dotIndex)}
                      tabIndex={isActive ? 0 : -1}
                      aria-label={t.hero.slider.goTo.replace('{n}', String(dotIndex + 1))}
                      aria-current={dotIndex === activeIndex}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300',
                        dotIndex === activeIndex ? 'bg-accent w-6' : 'w-1.5 bg-white/50 hover:bg-white/80',
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </article>
        );
      })}

      {count > 1 && (
        <nav
          className="absolute inset-x-0 bottom-0 z-20 mx-auto hidden max-w-7xl items-stretch border-t border-white/30 px-4 sm:px-6 md:flex lg:px-8"
          aria-label={locale === 'ar' ? 'شرائح الواجهة الرئيسية' : 'Hero slides'}
        >
          {slides.map((slide, index) => (
            <button
              key={slide.key}
              type="button"
              onClick={() => goTo(index)}
              aria-label={t.hero.slider.goTo.replace('{n}', String(index + 1))}
              aria-current={index === activeIndex}
              className={cn(
                'relative flex flex-1 cursor-pointer items-center justify-center bg-transparent px-3 pt-[1.6rem] pb-[1.1rem] text-base font-bold whitespace-nowrap transition-colors',
                index === activeIndex ? 'text-hero-foreground font-extrabold' : 'text-hero-foreground/60 hover:text-hero-foreground/90',
              )}
            >
              <span className="max-w-[280px] truncate">{slide.tabLabel}</span>
              {index === activeIndex && <span className="bg-accent absolute inset-x-0 -top-px h-1" aria-hidden="true" />}
            </button>
          ))}
        </nav>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-20 h-2.5 bg-[repeating-linear-gradient(135deg,var(--color-accent)_0_14px,var(--color-hero)_14px_28px)] md:hidden"
      />
    </section>
  );
}
