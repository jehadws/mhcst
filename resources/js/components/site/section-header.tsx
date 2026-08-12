import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  label?: string;
  title: string;
  description?: string;
  align?: 'center' | 'start';
  className?: string;
}

export function SectionHeader({ label, title, description, align = 'center', className }: SectionHeaderProps) {
  return (
    <div className={cn(align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-xl text-start', className)}>
      {label && <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">{label}</p>}
      <h2 className="text-foreground mt-3 font-serif text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {description && <p className="text-muted-foreground mt-3 text-sm leading-relaxed sm:text-base">{description}</p>}
    </div>
  );
}
