import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, ArrowUpLeft, ArrowUpRight } from 'lucide-react';
import { useRef, useState, type CSSProperties } from 'react';

const CAMPUS_IMAGE_POOL = ['/images/news-forum.webp', '/images/research.webp', '/images/news-volunteer.webp', '/images/college-nursing.webp'];

const EASE = 'ease-[cubic-bezier(.22,1,.36,1)]';

interface AboutProps {
  stats?: {
    teachers_count?: number;
  };
}

export function About({ stats }: AboutProps) {
  const { t, isRTL } = useSite();
  const instructorCount = stats?.teachers_count ?? 40;
  const [activeIndex, setActiveIndex] = useState(0);
  const lastActivatedAt = useRef(0);
  const Arrow = isRTL ? ArrowUpLeft : ArrowUpRight;
  const CtaArrow = isRTL ? ArrowLeft : ArrowRight;

  const activate = (index: number) => {
    lastActivatedAt.current = Date.now();
    setActiveIndex(index);
  };

  const cards = t.campus.cards.map((card, idx) => ({
    ...card,
    image: CAMPUS_IMAGE_POOL[idx % CAMPUS_IMAGE_POOL.length],
  }));

  return (
    <section id="about" aria-labelledby="about-heading" className="bg-background py-10 sm:py-14 lg:py-[70px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div className="max-w-2xl">
            <h2
              id="about-heading"
              className={cn(
                'font-display text-primary text-[clamp(1.5rem,7vw,1.75rem)] leading-tight font-extrabold text-balance sm:text-[clamp(2.125rem,3vw,3rem)]',
                isRTL ? '' : 'tracking-tight',
              )}
            >
              {t.campus.title} <span className="text-accent">{t.campus.titleAccent}</span>
            </h2>
            <p className="text-muted-foreground mt-2 text-xs sm:mt-4 sm:text-base">{t.campus.description}</p>
          </div>

          <Link
            href="/about"
            className="bg-primary text-primary-foreground inline-flex shrink-0 items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold shadow-md transition-transform hover:-translate-y-0.5"
          >
            {t.campus.discover}
            <CtaArrow className="size-4" aria-hidden="true" />
          </Link>
        </header>

        {/* The stats panel pins a fixed leading track while the campus cards
            animate around it, so the non-animating panel stays pixel-stable. */}
        <div
          className="mt-4 grid grid-cols-1 gap-[9px] transition-[grid-template-columns] duration-700 motion-reduce:transition-none sm:mt-8 lg:h-[540px] lg:[grid-template-columns:var(--about-cols)] lg:grid-rows-1 lg:gap-[18px]"
          style={
            {
              '--about-cols': `minmax(0,15rem) ${cards.map((_, i) => (i === activeIndex ? 'minmax(0,2.8fr)' : 'minmax(0,1fr)')).join(' ')}`,
            } as CSSProperties
          }
        >
          <div className="bg-hero text-hero-foreground flex flex-row items-center justify-between gap-6 rounded-2xl p-6 shadow-xl sm:p-8 lg:flex-col lg:items-start lg:justify-between">
            <div>
              <span className="font-display text-hero-accent block text-4xl leading-tight font-extrabold tabular-nums sm:text-5xl">
                {t.hero.foundedYear}
              </span>
              <span className="mt-1 block max-w-[13rem] text-sm leading-snug font-bold">{t.campus.estLabel}</span>
            </div>
            <div className="border-hero-foreground/15 max-lg:border-s max-lg:ps-6 lg:border-t lg:pt-5">
              <span className="font-display block text-3xl leading-tight font-extrabold tabular-nums sm:text-4xl">+{instructorCount}</span>
              <span className="text-hero-foreground/70 mt-1 block max-w-[11rem] text-xs leading-normal">{t.campus.statLabel}</span>
            </div>
          </div>

          {cards.map((card, index) => {
            const isActive = index === activeIndex;

            return (
              <Link
                key={card.name}
                href="/about"
                onMouseEnter={() => activate(index)}
                onPointerEnter={() => activate(index)}
                onFocus={() => activate(index)}
                onClick={(e) => {
                  // A pointer/keyboard activation that immediately precedes the
                  // click (touch tap, Enter key) counts as an expand request,
                  // not navigation.
                  if (!isActive || Date.now() - lastActivatedAt.current < 500) {
                    e.preventDefault();
                    activate(index);
                  }
                }}
                className={cn(
                  'group ring-accent relative isolate block min-w-0 overflow-hidden rounded-2xl text-white outline-none',
                  'ring-offset-background focus-visible:ring-2 focus-visible:ring-offset-2',
                  'transition-[height] duration-700 motion-reduce:transition-none',
                  isActive ? 'h-[260px]' : 'h-[92px]',
                  'lg:h-auto',
                  EASE,
                )}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={index === 0 ? 'high' : undefined}
                  className="absolute inset-0 size-full object-cover object-center"
                />

                <span
                  className={cn(
                    'absolute inset-x-0 bottom-0 z-10 flex min-h-[45px] items-center gap-3 bg-linear-to-t from-black/75 via-black/35 to-transparent px-4 py-2 backdrop-blur-[6px]',
                    'transition-[min-height] duration-700 motion-reduce:transition-none',
                    'group-hover:min-h-[130px] md:group-hover:min-h-[80px]',
                    isActive && 'min-h-[130px] md:min-h-[80px]',
                    EASE,
                  )}
                >
                  <span className="flex min-w-0 flex-1 flex-col items-start">
                    <strong
                      className={cn(
                        'max-w-full overflow-hidden text-sm font-medium text-ellipsis whitespace-nowrap transition-[font-size] duration-700 motion-reduce:transition-none',
                        'group-hover:text-lg md:group-hover:text-xl md:group-hover:font-bold',
                        isActive && 'text-lg font-bold md:text-xl',
                        EASE,
                      )}
                    >
                      {card.name}
                    </strong>
                    <span
                      className={cn(
                        'mt-1 max-w-full translate-y-1 overflow-hidden text-xs leading-5 text-ellipsis text-white/85 opacity-0 transition-[opacity,transform] duration-700 motion-reduce:transition-none',
                        'md:text-[13px] md:leading-6 md:whitespace-nowrap',
                        'group-hover:translate-y-0 group-hover:opacity-100',
                        isActive && 'translate-y-0 opacity-100',
                        EASE,
                      )}
                    >
                      {card.desc}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'grid size-9 shrink-0 translate-y-1 place-items-center rounded-full bg-black/60 opacity-0 transition-[opacity,transform] duration-700 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none',
                      isActive && 'translate-y-0 opacity-100',
                      EASE,
                    )}
                    aria-hidden="true"
                  >
                    <Arrow className="text-accent size-5" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
