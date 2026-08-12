import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Check } from 'lucide-react';

interface AboutProps {
  stats?: {
    teachers_count?: number;
  };
}

export function About({ stats }: AboutProps) {
  const { t } = useSite();
  const instructorCount = stats?.teachers_count ?? 40;

  return (
    <section id="about" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="order-2 text-start lg:order-1">
          <h2 className="text-primary text-3xl font-extrabold sm:text-4xl">
            {t.campus.title} <span className="text-accent">{t.campus.titleAccent}</span>
          </h2>
          <p className="text-muted-foreground mt-4 leading-relaxed">{t.campus.description}</p>

          <ul className="mt-8 grid gap-4">
            {t.campus.bullets.map((f) => (
              <li key={f} className="flex items-center gap-3 text-start">
                <span className="bg-accent/15 text-accent flex size-7 shrink-0 items-center justify-center rounded-full">
                  <Check className="size-4" aria-hidden="true" />
                </span>
                <span className="text-primary font-medium">{f}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/about"
            className="bg-primary text-primary-foreground mt-8 inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5"
          >
            {t.campus.discover}
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="order-1 lg:order-2">
          <div className="border-border bg-hero shadow-lg shadow-black/15 relative overflow-hidden rounded-3xl border p-8">
            <img
              src="/images/campus-aerial.png"
              alt={t.campus.title}
              className="absolute inset-0 size-full object-cover opacity-25"
            />
            <div className="relative flex flex-col items-start gap-2 text-start">
              <span className="text-accent text-6xl font-extrabold">{t.hero.foundedYear}</span>
              <span className="text-hero-foreground text-lg font-bold">{t.campus.estLabel}</span>
            </div>
            <div className="relative mt-24 flex items-end justify-start">
              <div className="rounded-xl bg-white/10 px-5 py-3 text-start backdrop-blur">
                <span className="text-hero-foreground block text-2xl font-extrabold">+{instructorCount}</span>
                <span className="text-hero-foreground/70 text-xs">{t.campus.statLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
