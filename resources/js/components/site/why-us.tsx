import { SectionHeader } from '@/components/site/section-header';
import { useSite } from '@/context/site-context';

export function WhyUs() {
  const { t } = useSite();

  return (
    <section className="bg-secondary py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader label={t.whyUs.label} title={t.whyUs.title} align="start" className="max-w-2xl" />

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {t.whyUs.items.map((item, idx) => (
            <article key={idx} className="border-border bg-card border p-8 sm:p-10">
              <p className="text-hero-accent font-serif text-5xl font-extrabold leading-none">{String(idx + 1).padStart(2, '0')}</p>
              <h3 className="text-foreground mt-6 font-serif text-xl font-bold">{item.title}</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-7">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
