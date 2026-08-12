import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, ClipboardCheck, FileText, Send } from 'lucide-react';

const STEP_ICONS = [ClipboardCheck, FileText, Send];

export function ApplicationSteps() {
  const { t, isRTL } = useSite();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-primary text-3xl font-extrabold sm:text-4xl">
          {t.applicationSteps.title} <span className="text-accent">{t.applicationSteps.titleAccent}</span>
        </h2>
        <p className="text-muted-foreground mt-4">{t.applicationSteps.description}</p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {t.applicationSteps.steps.map((s, idx) => {
          const Icon = STEP_ICONS[idx] ?? ClipboardCheck;

          return (
            <div
              key={s.title}
              className="border-border bg-card shadow-primary/5 relative rounded-2xl border p-8 text-start shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="text-secondary text-5xl font-extrabold">{idx + 1}</span>
                <span className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-xl">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
              </div>
              <h3 className="text-primary mt-6 text-lg font-bold">
                {idx + 1}. {s.title}
              </h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{s.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <Link
          href="/contact"
          className="bg-accent text-accent-foreground inline-flex items-center gap-2 rounded-md px-7 py-3.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
        >
          {t.applicationSteps.cta}
          <Arrow className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
