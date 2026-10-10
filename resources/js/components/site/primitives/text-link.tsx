import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

interface TextLinkProps {
    href: string;
    children: ReactNode;
    light?: boolean;
    className?: string;
}

export function TextLink({ href, children, light = false, className }: TextLinkProps) {
    return (
        <Link
            href={href}
            className={cn(
                'inline-flex items-center gap-3 border-b pb-1 text-[13px] font-bold',
                'transition-[gap,color,border-color] duration-[250ms] ease-[cubic-bezier(.22,1,.36,1)]',
                'hover:gap-[18px]',
                light
                    ? 'border-white/50 text-white hover:border-coral hover:text-white'
                    : 'border-ink text-ink hover:text-coral',
                className,
            )}
        >
            {children}
        </Link>
    );
}
