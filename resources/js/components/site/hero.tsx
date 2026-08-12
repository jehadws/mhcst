import { useSite } from '@/context/site-context';
import { ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface HeroStats {
  students_count?: number;
  teachers_count?: number;
  departments_count?: number;
}

interface HeroProps {
  stats?: HeroStats;
}

export function Hero({ stats }: HeroProps) {
  const { t, locale } = useSite();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  const statItems = [
    { value: t.hero.foundedYear, label: t.hero.foundedLabel },
    {
      value: stats?.students_count ? `${stats.students_count.toLocaleString()}+` : '20,000+',
      label: t.stats.learners,
    },
    {
      value: stats?.departments_count ? String(stats.departments_count) : '12',
      label: t.stats.satisfaction,
    },
    {
      value: stats?.teachers_count ? `${stats.teachers_count}+` : '50+',
      label: t.stats.experts,
    },
  ];

  return (
    <section className="bg-hero text-hero-foreground relative isolate flex min-h-screen flex-col overflow-hidden pt-[4.25rem]">
      <img
        src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=85&w=2000&auto=format&fit=crop"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40"
      />
      <div className="from-hero via-hero/90 to-hero/80 absolute inset-0 -z-10 bg-gradient-to-b" />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-4 py-28 sm:px-6 lg:px-8 lg:py-32">
        <p className="text-hero-muted text-sm font-medium tracking-wide">{t.hero.locationTag}</p>

        <h1 className="mt-6 max-w-4xl font-serif text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-7xl">
          {t.hero.titleLine1}
          <span className="text-hero-accent mt-2 block">{t.hero.titleLine2}</span>
        </h1>

        <p className="text-hero-muted mt-6 max-w-2xl text-base leading-8 sm:text-lg">{t.hero.subtitle}</p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="/departments"
            className="bg-hero-accent text-hero-accent-foreground hover:bg-hero-accent/90 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition-colors"
          >
            {t.hero.ctaPrimary}
            <Arrow className="size-4" />
          </a>
          <a
            href="/about"
            className="border-hero-foreground/25 bg-hero-foreground/10 text-hero-foreground hover:bg-hero-foreground/15 inline-flex items-center rounded-full border px-7 py-3.5 text-sm font-semibold backdrop-blur-sm transition-colors"
          >
            {t.hero.ctaSecondary}
          </a>
          <a href="#contact" className="text-hero-muted hover:text-hero-foreground px-2 text-sm font-medium underline-offset-4 transition-colors hover:underline">
            {t.hero.ctaContact}
          </a>
        </div>
      </div>

      <div className="border-hero-foreground/10 border-t">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-hero-foreground/10 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {statItems.map((item) => (
            <div key={item.label} className="px-4 py-8 text-center first:ps-0 lg:py-10 lg:text-start">
              <p className="font-serif text-3xl font-extrabold tracking-tight sm:text-4xl">{item.value}</p>
              <p className="text-hero-muted mt-1 text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <a
        href="#departments"
        className="text-hero-muted hover:text-hero-foreground absolute bottom-6 start-1/2 flex -translate-x-1/2 flex-col items-center gap-1 text-xs tracking-widest uppercase transition-colors max-lg:hidden"
        aria-label={t.hero.scrollHint}
      >
        <span>{t.hero.scrollHint}</span>
        <ArrowDown className="size-4 animate-bounce" />
      </a>
    </section>
  );
}
