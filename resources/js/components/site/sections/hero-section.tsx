import { buttonVariants } from '@/components/site/primitives/button';
import { TextLink } from '@/components/site/primitives/text-link';
import { Eyebrow } from '@/components/site/primitives/section-tag';
import { useBrandText } from '@/hooks/use-site-settings';
import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import type { Banner } from '@/types';
import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;
const DRAG_INTENT_PX = 8;

// The Arabic dictionary writes years with Eastern Arabic-Indic digits (۲۰۱۰).
const toLatinDigits = (value: string) =>
    value
        .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
        .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660));

const resolveImage = (image: string) => (image.startsWith('http') ? image : image.startsWith('/') ? image : `/storage/${image}`);

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

export function HeroSection({ banners = [] }: { banners?: Banner[] }) {
    const { t, locale, isRTL } = useSite();
    const { brandName } = useBrandText();

    const slides: HeroSlide[] = useMemo(() => {
        const cmsSlides: HeroSlide[] = banners.map((banner) => {
            const title = locale === 'ar' && banner.title_ar ? banner.title_ar : banner.title;

            return {
                key: `banner-${banner.id}`,
                image: resolveImage(banner.image),
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
                image: '/images/campus-hero.webp',
                title: (
                    <>
                        {t.hero.titleLine1}
                        <br />
                        <em className="text-coral not-italic">{t.hero.titleLine2}</em>
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

    const prefersReducedMotion = useMemo(
        () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        [],
    );

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

    // A swipe that ends on top of a CTA link or slide dot must not count as a click.
    const handleDraggedClick = (e: React.MouseEvent) => {
        if (!suppressClick.current) return;

        e.preventDefault();
        e.stopPropagation();
        suppressClick.current = false;
    };

    const active = slides[activeIndex];
    const yearsRunning = new Date().getFullYear() - Number(toLatinDigits(t.hero.foundedYear));

    return (
        <section
            className="bg-ink relative isolate min-h-[max(560px,88svh)] cursor-grab touch-pan-y overflow-hidden pb-[40px] pt-[120px] select-none active:cursor-grabbing site-md:min-h-[690px] site-md:pb-[60px] site-md:pt-[150px]"
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
            <div className="site-hero-glow pointer-events-none absolute inset-0" aria-hidden="true" />

            <div className="site-container relative z-10 grid items-center gap-[38px] site-lg:grid-cols-[0.94fr_1.06fr] site-lg:gap-[72px]">
                <div>
                    <Eyebrow light>{brandName}</Eyebrow>

                    <div key={active.key} className="motion-safe:animate-[site-hero-fade_0.7s_cubic-bezier(.22,1,.36,1)]">
                        <h1 className="mt-[22px] text-[clamp(2.6rem,7.5vw,5rem)] leading-[1.18] font-semibold tracking-[-0.02em] text-white [text-wrap:balance]">
                            {active.title}
                        </h1>

                        {active.subtitle ? (
                            <p className="mt-[22px] max-w-[510px] text-[15px] leading-[2] text-white/[0.68] site-md:text-[17px]">
                                {active.subtitle}
                            </p>
                        ) : null}

                        <div className="mt-[34px] flex flex-wrap items-center gap-[22px]">
                            {active.staticCta ? (
                                <>
                                    <Link href="/departments" className={cn(buttonVariants({ variant: 'accent' }))}>
                                        {t.hero.ctaPrimary}
                                    </Link>
                                    <TextLink href="/about" light>
                                        {t.hero.ctaSecondary}
                                    </TextLink>
                                </>
                            ) : active.ctaLink && active.ctaText ? (
                                <Link href={active.ctaLink} className={cn(buttonVariants({ variant: 'accent' }))}>
                                    {active.ctaText}
                                </Link>
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-[46px] flex items-center gap-[14px]">
                        <span className="font-site-latin text-[11px] font-semibold tracking-[0.1em] text-white/45">
                            {String(activeIndex + 1).padStart(2, '0')}
                        </span>
                        <span className="h-px w-[70px] bg-white/20" aria-hidden="true" />
                        <span className="text-[11px] text-white/45">{t.hero.locationTag}</span>
                    </div>

                    {count > 1 && (
                        <div className="mt-[26px] flex items-center gap-[8px]" aria-label={locale === 'ar' ? 'شرائح الواجهة الرئيسية' : 'Hero slides'}>
                            {slides.map((slide, index) => (
                                <button
                                    key={slide.key}
                                    type="button"
                                    onClick={() => goTo(index)}
                                    aria-label={t.hero.slider.goTo.replace('{n}', String(index + 1))}
                                    aria-current={index === activeIndex}
                                    className={cn(
                                        'h-[7px] rounded-full transition-all duration-300',
                                        index === activeIndex ? 'bg-coral w-[26px]' : 'w-[7px] bg-white/30 hover:bg-white/60',
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative">
                    <div className="relative h-[340px] site-md:h-[440px] site-lg:h-[540px]">
                        {slides.map((slide, index) => (
                            <img
                                key={slide.key}
                                src={slide.image}
                                alt={index === activeIndex ? slide.alt : ''}
                                aria-hidden={index !== activeIndex}
                                loading={index === 0 ? 'eager' : 'lazy'}
                                decoding="async"
                                draggable={false}
                                fetchPriority={index === 0 ? 'high' : undefined}
                                className={cn(
                                    'absolute inset-0 size-full rounded-ss-[90px] object-cover object-center transition-opacity duration-700 ease-in-out site-lg:rounded-ss-[150px]',
                                    index === activeIndex ? 'opacity-100' : 'opacity-0',
                                )}
                            />
                        ))}
                    </div>

                    <div className="bg-coral shadow-hero-stamp absolute -bottom-6 -start-4 flex size-[118px] rotate-8 flex-col items-center justify-center rounded-full p-2 text-center site-md:size-[142px]">
                        <span className="font-site-latin text-[34px] leading-none font-extrabold text-white">{yearsRunning}</span>
                        <span className="mt-1 text-[10px] leading-[1.5] font-semibold text-white/90">{t.campus.estLabel}</span>
                    </div>

                    <div className="font-site-latin absolute top-8 -end-10 hidden rotate-90 text-[10px] tracking-[0.22em] whitespace-nowrap text-white/40 site-lg:block" aria-hidden="true">
                        MHCST / {new Date().getFullYear()}
                    </div>
                </div>
            </div>

            <div className="site-container relative z-10 mt-[50px] flex items-center justify-between gap-6 border-t border-white/10 pt-[22px]">
                <span className="font-site-latin text-[10px] font-semibold tracking-[0.14em] text-white/45">{t.location.address}</span>
                <span className="font-site-latin flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-white/45">
                    {t.hero.scrollHint} <b className="text-coral">↓</b>
                </span>
            </div>
        </section>
    );
}
