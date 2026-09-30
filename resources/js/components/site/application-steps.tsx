import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, ClipboardCheck, FileText, Send } from 'lucide-react';

const STEP_ICONS = [ClipboardCheck, FileText, Send];

export function ApplicationSteps() {
  const { t, isRTL } = useSite();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-extrabold leading-snug text-primary sm:text-4xl">
          {t.applicationSteps.title} <span className="text-accent">{t.applicationSteps.titleAccent}</span>
        </h2>
        <p className="text-muted-foreground mt-4 text-base leading-normal">{t.applicationSteps.description}</p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {t.applicationSteps.steps.map((s, idx) => {
          const Icon = STEP_ICONS[idx] ?? ClipboardCheck;

          return (
            <div
              key={s.title}
              className="border-border bg-card relative rounded-2xl border p-8 text-start shadow-sm transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-5xl font-extrabold leading-tight tabular-nums text-primary/20">{idx + 1}</span>
                <span className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-xl shadow-md">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
              </div>
              <h3 className="font-display text-primary mt-6 text-lg font-bold leading-snug">
                {s.title}
              </h3>
              <p className="text-muted-foreground mt-3 text-sm leading-normal">{s.description}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/contact"
          className="bg-accent text-accent-foreground inline-flex items-center gap-2 rounded-lg px-7 py-3.5 text-sm font-bold shadow-md transition-transform hover:-translate-y-0.5"
        >
          {t.applicationSteps.cta}
          <Arrow className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
