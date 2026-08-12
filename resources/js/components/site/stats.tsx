import { useSite } from '@/context/site-context';
import { Award, BookOpen, GraduationCap, Users } from 'lucide-react';

export function Stats() {
  const { t } = useSite();

  const items = [
    { icon: Users, stat: '50+', label: t.stats.experts },
    { icon: BookOpen, stat: '120+', label: t.stats.courses },
    { icon: GraduationCap, stat: '20,000+', label: t.stats.learners },
    { icon: Award, stat: '99%', label: t.stats.satisfaction },
  ];

  return (
    <section className="bg-hero text-hero-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="divide-hero-foreground/15 grid grid-cols-2 divide-x lg:grid-cols-4">
          {items.map((item, idx) => (
            <div key={idx} className="px-5 py-9 text-center first:ps-0 last:pe-0 lg:text-start">
              <div className="bg-hero-accent/15 text-hero-accent mx-auto flex size-10 items-center justify-center rounded-full lg:mx-0">
                <item.icon className="size-[18px]" />
              </div>
              <p className="mt-4 font-serif text-3xl font-extrabold tracking-tight sm:text-4xl">{item.stat}</p>
              <p className="text-hero-muted mt-1 text-sm">{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
