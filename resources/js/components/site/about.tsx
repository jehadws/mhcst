import { useSite } from '@/context/site-context';
import { Check } from 'lucide-react';

const CAMPUS_IMAGE = 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop';

export function About() {
  const { t } = useSite();

  return (
    <section id="about" className="bg-secondary scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">{t.campus.label}</p>
            <h2 className="text-foreground mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">{t.campus.title}</h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">{t.campus.description}</p>

            <ul className="mt-8 space-y-4">
              {t.campus.bullets.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
                  <span className="bg-primary/10 text-primary mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full">
                    <Check className="size-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="border-border bg-card overflow-hidden border shadow-lg">
              <img src={CAMPUS_IMAGE} alt={t.campus.title} className="aspect-[4/3] w-full object-cover" />
            </div>

            <div className="border-border bg-card absolute -bottom-6 -start-4 border px-6 py-5 shadow-xl sm:-start-6">
              <p className="text-primary text-xs font-bold tracking-widest uppercase">Est.</p>
              <p className="text-foreground font-serif text-3xl font-extrabold">{t.hero.foundedYear}</p>
              <p className="text-muted-foreground mt-1 max-w-[180px] text-xs leading-relaxed">{t.campus.estLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
