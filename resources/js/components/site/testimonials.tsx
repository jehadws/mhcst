import { SectionHeader } from '@/components/site/section-header';
import { useSite } from '@/context/site-context';
import { testimonials as defaultTestimonials } from '@/data/i18n';

export function Testimonials({ items }: { items?: any[] }) {
  const { t, tr, locale } = useSite();

  const list = items && items.length > 0 ? items : defaultTestimonials;

  return (
    <section id="testimonials" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={t.testimonials.title}
          title={locale === 'ar' ? 'خريجون يتحدثون' : 'Graduates speak'}
          align="start"
        />

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {list.slice(0, 4).map((item, idx) => {
            const name = typeof item.name === 'string' ? item.name : tr(item.name);
            const role = item.role_title || item.company || (item.role ? tr(item.role) : '');
            const quoteText = item.quote ? (typeof item.quote === 'string' ? item.quote : tr(item.quote)) : '';

            return (
              <blockquote
                key={idx}
                className="border-border bg-card border-s-4 border-s-hero-accent p-8 sm:p-10"
              >
                <p className="text-foreground font-serif text-xl leading-relaxed font-medium sm:text-2xl">&ldquo;{quoteText}&rdquo;</p>
                <footer className="mt-8">
                  <cite className="text-foreground not-italic font-semibold">{name}</cite>
                  {role && <p className="text-muted-foreground mt-1 text-sm">{role}</p>}
                </footer>
              </blockquote>
            );
          })}
        </div>
      </div>
    </section>
  );
}
