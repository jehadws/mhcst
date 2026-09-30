import { useSite } from '@/context/site-context';

export function Partnerships() {
  const { t } = useSite();

  return (
    <section className="bg-secondary py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 text-start md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl font-extrabold leading-snug text-primary sm:text-4xl">
              {t.partnerships.title} <span className="text-accent">{t.partnerships.titleAccent}</span>
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-normal">{t.partnerships.description}</p>
          </div>
          <span className="bg-hero text-hero-foreground shrink-0 rounded-full px-4 py-2 text-sm font-bold shadow-md">
            {t.partnerships.count}
          </span>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {t.partnerships.items.map((p) => (
            <div
              key={p}
              className="border-border bg-card text-foreground hover:border-accent/50 flex min-h-24 items-center justify-center rounded-xl border px-4 py-5 text-center text-sm font-bold shadow-sm transition-colors"
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
