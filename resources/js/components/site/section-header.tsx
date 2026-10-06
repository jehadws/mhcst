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
      {label && <p className="text-primary text-xs font-bold tracking-widest uppercase">{label}</p>}
      <h2 className="text-foreground mt-3 font-display text-2xl sm:text-3xl font-extrabold leading-snug tracking-tight sm:text-4xl">{title}</h2>
      {description && <p className="text-muted-foreground mt-4 text-base leading-normal sm:text-lg">{description}</p>}
    </div>
  );
}
