import { useSite } from '@/context/site-context';

export function WhyUs() {
  const { t } = useSite();

  return (
    <section className="bg-secondary py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="border-border shadow-lg relative overflow-hidden rounded-2xl border shadow-primary/10">
          <img src="/images/research.webp" alt={t.whyUs.label} className="aspect-[4/3] size-full object-cover" />
        </div>

        <div className="text-start">
          <h2 className="font-display text-primary text-3xl font-extrabold leading-snug sm:text-4xl">
            {t.whyUs.titlePrefix} <span className="text-accent">{t.whyUs.titleAccent}</span>
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-normal">{t.whyUs.title}</p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {t.whyUs.items.map((f, idx) => (
              <div key={f.title} className="border-border border-t pt-4">
                <span className="text-accent text-sm font-extrabold tabular-nums">{String(idx + 1).padStart(2, '0')}</span>
                <h3 className="text-foreground mt-2 text-lg font-bold">{f.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-normal">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
