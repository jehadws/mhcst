import { SectionHeader } from '@/components/site/section-header';
import { useSite } from '@/context/site-context';

export function ApplicationSteps() {
  const { t } = useSite();

  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader label={t.applicationSteps.label} title={t.applicationSteps.title} description={t.applicationSteps.description} />

        <ol className="mt-14 grid gap-6 lg:grid-cols-3">
          {t.applicationSteps.steps.map((step, idx) => (
            <li key={idx} className="border-border bg-card relative border p-8 pt-10">
              <span className="bg-hero text-hero-foreground absolute -top-4 start-8 inline-flex size-8 items-center justify-center rounded-full text-xs font-bold">
                {idx + 1}
              </span>
              <p className="text-primary text-xs font-bold tracking-[0.15em] uppercase">
                {t.applicationSteps.label} {String(idx + 1).padStart(2, '0')}
              </p>
              <h3 className="text-foreground mt-3 font-serif text-xl font-bold">{step.title}</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-7">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
