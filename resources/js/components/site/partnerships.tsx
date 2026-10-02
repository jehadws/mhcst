import { useSite } from '@/context/site-context';
import { useState } from 'react';

/**
 * Partner logo files: drop images into public/images/partners/ and map
 * partner name -> path here. Partners without an entry (or whose image
 * fails to load) fall back to a typographic wordmark.
 */
const PARTNER_LOGOS: Record<string, string> = {};

function PartnerCell({ name }: { name: string }) {
  const { locale } = useSite();
  const [logoBroken, setLogoBroken] = useState(false);
  const logo = PARTNER_LOGOS[name];
  const wordmarkCase = locale === 'ar' ? '' : 'uppercase tracking-widest';

  return (
    <div className="border-border bg-card group hover:border-accent/50 flex min-h-28 flex-col items-center justify-center rounded-xl border px-4 py-5 text-center shadow-sm transition-colors">
      {logo && !logoBroken ? (
        <img src={logo} alt={name} loading="lazy" onError={() => setLogoBroken(true)} className="max-h-14 max-w-full object-contain grayscale" />
      ) : (
        <span
          className={`font-display text-muted-foreground group-hover:text-foreground text-sm leading-snug font-extrabold transition-colors ${wordmarkCase}`}
        >
          {name}
        </span>
      )}
    </div>
  );
}

export function Partnerships() {
  const { t } = useSite();

  return (
    <section className="bg-secondary py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-start md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-primary text-3xl leading-snug font-extrabold sm:text-4xl">
              {t.partnerships.title} <span className="text-accent">{t.partnerships.titleAccent}</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-normal">{t.partnerships.description}</p>
          </div>
          <span className="bg-hero text-hero-foreground shrink-0 rounded-full px-4 py-2 text-sm font-bold shadow-md">{t.partnerships.count}</span>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {t.partnerships.items.map((name) => (
            <PartnerCell key={name} name={name} />
          ))}
        </div>
      </div>
    </section>
  );
}
