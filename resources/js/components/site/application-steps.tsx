import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const EASE = 'ease-[cubic-bezier(.22,1,.36,1)]';

export function ApplicationSteps() {
  const { t, locale, isRTL } = useSite();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section id="admissions" aria-labelledby="application-steps-heading" className="bg-background py-10 sm:py-14 lg:py-[70px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start lg:gap-20">
          <header className="flex flex-col items-start lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-accent">{t.applicationSteps.label}</span>
              <span aria-hidden="true" className="bg-accent h-0.5 w-8 rounded-full" />
            </div>
            <h2
              id="application-steps-heading"
              className={cn(
                'font-display text-primary mt-4 text-3xl leading-snug font-extrabold text-balance sm:text-4xl',
                locale === 'ar' ? '' : 'tracking-tight',
              )}
            >
              {t.applicationSteps.title} <span className="text-accent">{t.applicationSteps.titleAccent}</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-md text-base leading-normal">{t.applicationSteps.description}</p>
            <Link
              href="/contact"
              className="bg-primary text-primary-foreground mt-8 inline-flex items-center gap-2 self-start rounded-lg px-6 py-3 text-sm font-bold shadow-md transition-transform hover:-translate-y-0.5"
            >
              {t.applicationSteps.cta}
              <Arrow className="size-4" aria-hidden="true" />
            </Link>
          </header>

          {/* Steps indent progressively on desktop — the "path" descends in the
              reading direction; full-width rules keep the ledger edge-aligned. */}
          <ol className="flex flex-col">
            {t.applicationSteps.steps.map((step, index) => (
              <li
                key={step.title}
                className={cn(
                  'group flex items-start gap-6 border-t border-border py-7 first:border-t-0 first:pt-0 sm:gap-8 sm:py-9',
                  index === 1 && 'lg:ps-12',
                  index === 2 && 'lg:ps-24',
                )}
              >
                <span
                  className={cn(
                    'font-display text-primary/20 text-5xl leading-tight font-extrabold tabular-nums transition-colors duration-300 group-hover:text-accent motion-reduce:transition-none sm:text-6xl',
                    EASE,
                  )}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0 pt-1.5 sm:pt-2.5">
                  <h3 className="font-display text-primary text-lg leading-snug font-bold sm:text-xl">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 max-w-md text-sm leading-normal sm:text-base">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
