import { useSite } from '@/context/site-context';
import { testimonials as defaultTestimonials } from '@/data/i18n';
import { Quote } from 'lucide-react';

export function Testimonials({ items }: { items?: any[] }) {
  const { t, tr } = useSite();

  const list = items && items.length > 0 ? items : defaultTestimonials;

  return (
    <section id="testimonials" className="bg-secondary scroll-mt-20 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-primary text-center text-3xl font-extrabold sm:text-4xl">
          {t.testimonials.title} <span className="text-accent">{t.testimonials.titleAccent}</span>
        </h2>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {list.slice(0, 4).map((item, idx) => {
            const name = typeof item.name === 'string' ? item.name : tr(item.name);
            const role = item.role_title || item.company || (item.role ? tr(item.role) : '');
            const quoteText = item.quote ? (typeof item.quote === 'string' ? item.quote : tr(item.quote)) : '';
            const initial = name.split(' ')[1]?.[0] ?? name[0] ?? 'M';

            return (
              <figure key={idx} className="border-border bg-card relative rounded-2xl border p-8 text-start shadow-sm">
                <Quote className="text-accent/40 size-9" aria-hidden="true" />
                <blockquote className="text-primary mt-4 text-lg font-medium leading-relaxed">&ldquo;{quoteText}&rdquo;</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-full text-sm font-bold">
                    {initial}
                  </span>
                  <div>
                    <div className="text-primary font-bold">{name}</div>
                    {role && <div className="text-muted-foreground text-sm">{role}</div>}
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
