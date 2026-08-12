import { useSite } from '@/context/site-context';
import { BadgeCheck } from 'lucide-react';

export function Accreditation() {
  const { t } = useSite();

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-primary text-3xl font-extrabold sm:text-4xl">
          {t.accreditation.title} <span className="text-accent">{t.accreditation.titleAccent}</span>
        </h2>
        <p className="text-muted-foreground mt-4 text-pretty leading-relaxed">{t.accreditation.description}</p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {t.accreditation.bodies.map((b) => (
          <div
            key={b}
            className="border-border bg-card flex flex-col items-center gap-4 rounded-2xl border p-8 text-center shadow-sm"
          >
            <span className="bg-primary/5 text-primary flex size-14 items-center justify-center rounded-2xl">
              <BadgeCheck className="text-accent size-7" aria-hidden="true" />
            </span>
            <p className="text-primary text-sm font-medium leading-relaxed">{b}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
