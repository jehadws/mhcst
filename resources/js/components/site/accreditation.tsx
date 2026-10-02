import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';

export function Accreditation() {
  const { t, locale } = useSite();

  return (
    <section aria-labelledby="accreditation-heading" className="bg-muted py-10 sm:py-14 lg:py-[70px]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2
            id="accreditation-heading"
            className={cn(
              'font-display text-primary max-w-2xl text-3xl leading-snug font-extrabold text-balance sm:text-4xl',
              locale === 'ar' ? '' : 'tracking-tight',
            )}
          >
            {t.accreditation.title} <span className="text-accent">{t.accreditation.titleAccent}</span>
          </h2>
          <p className="text-muted-foreground max-w-md text-sm leading-normal sm:text-base">{t.accreditation.description}</p>
        </header>

        {/* One shared panel with gap-px hairlines — a register, not a row of
            tiles. The part of each body name before the em-dash is typeset as
            the display name; the qualifier follows as a muted second line. */}
        <div className="bg-border mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border sm:mt-12 md:grid-cols-3">
          {t.accreditation.bodies.map((body, index) => {
            const [name, ...rest] = body.split(' — ');
            const qualifier = rest.join(' — ');

            return (
              <article key={body} className="bg-card flex flex-col gap-3 p-6 sm:p-8">
                <span className="font-display text-primary/20 text-3xl leading-tight font-extrabold tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-foreground text-lg leading-snug font-bold">{name}</h3>
                  {qualifier ? <p className="text-muted-foreground mt-1.5 text-sm leading-normal">{qualifier}</p> : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
