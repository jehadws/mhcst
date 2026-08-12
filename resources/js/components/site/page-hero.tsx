import { cn } from '@/lib/utils';

interface PageHeroProps {
  label?: string;
  title: string;
  description?: string;
  className?: string;
}

export function PageHero({ label, title, description, className }: PageHeroProps) {
  return (
    <div className={cn('bg-hero text-hero-foreground border-hero-foreground/10 border-b pb-20 pt-[calc(4.25rem+3rem)] sm:pb-24 sm:pt-[calc(4.25rem+4rem)]', className)}>
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        {label && <p className="text-hero-muted text-xs font-bold tracking-[0.2em] uppercase">{label}</p>}
        <h1 className="mt-4 font-serif text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">{title}</h1>
        {description && <p className="text-hero-muted mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">{description}</p>}
      </div>
    </div>
  );
}
