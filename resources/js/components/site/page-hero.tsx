import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';

type Crumb = { label: string; href: string };

interface PageHeroProps {
  title: string;
  description?: string;
  crumbs?: Crumb[];
  className?: string;
}

export function PageHero({ title, description, crumbs = [] }: PageHeroProps) {
  const { t } = useSite();

  return (
    <section className="bg-hero text-hero-foreground relative overflow-hidden pt-32 pb-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'url(/images/campus-aerial.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        aria-hidden="true"
        className="bg-accent/20 pointer-events-none absolute start-0 top-1/2 size-64 -translate-y-1/2 rounded-full blur-3xl"
      />
      <div className="relative mx-auto max-w-7xl px-4 text-start sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-hero-foreground/70 flex items-center gap-1 text-xs">
          <Link href="/" className="hover:text-accent">
            {t.nav.home}
          </Link>
          {crumbs.map((c) => (
            <span key={c.href} className="flex items-center gap-1">
              <ChevronLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
              <Link href={c.href} className="hover:text-accent">
                {c.label}
              </Link>
            </span>
          ))}
        </nav>
        <h1 className="mt-4 text-3xl font-extrabold text-balance sm:text-5xl">{title}</h1>
        {description ? (
          <p className="text-hero-foreground/80 mt-4 max-w-2xl text-pretty leading-relaxed">{description}</p>
        ) : null}
        <span className="bg-accent mt-6 block h-1 w-24 rounded-full" />
      </div>
    </section>
  );
}
