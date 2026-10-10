import { cn } from '@/lib/utils';

interface CircleArrowProps {
    light?: boolean;
    className?: string;
}

/** 38px outlined arrow disc that inverts on hover. Decorative — the parent link carries the label. */
export function CircleArrow({ light = false, className }: CircleArrowProps) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                'grid size-[38px] shrink-0 place-items-center rounded-full border text-[16px] transition-colors duration-300',
                light ? 'border-white/45 text-white group-hover:bg-white group-hover:text-ink' : 'border-ink text-ink group-hover:bg-ink group-hover:text-white',
                className,
            )}
        >
            ↗
        </span>
    );
}
