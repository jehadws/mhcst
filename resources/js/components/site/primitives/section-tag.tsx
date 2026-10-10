import { cn } from '@/lib/utils';
import type * as React from 'react';

interface SectionTagProps {
    index: string;
    label: React.ReactNode;
    light?: boolean;
    className?: string;
}

export function SectionTag({ index, label, light = false, className }: SectionTagProps) {
    return (
        <span
            className={cn(
                'flex items-center gap-[10px] font-site-latin text-[10px] font-bold tracking-[0.1em] whitespace-nowrap',
                light ? 'text-eyebrow-light' : 'text-teal-dark',
                className,
            )}
        >
            <span className="text-coral text-[11px]">{index}</span>
            <span className="bg-coral block h-px w-[38px]" aria-hidden="true" />
            <span>{label}</span>
        </span>
    );
}

interface EyebrowProps {
    children: React.ReactNode;
    light?: boolean;
    className?: string;
}

export function Eyebrow({ children, light = false, className }: EyebrowProps) {
    return (
        <span
            className={cn(
                'flex items-center gap-[9px] text-[11px] font-bold tracking-[0.08em]',
                light ? 'text-eyebrow-light' : 'text-teal-dark',
                className,
            )}
        >
            <span className="bg-coral inline-block size-[7px] rounded-full" aria-hidden="true" />
            <span>{children}</span>
        </span>
    );
}
