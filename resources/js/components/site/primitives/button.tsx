import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
    [
        'inline-flex items-center justify-center gap-[15px] rounded-site-button border font-bold text-[13px] leading-normal whitespace-nowrap',
        'transition-[transform,background-color,color,border-color] duration-[250ms] ease-[cubic-bezier(.22,1,.36,1)]',
        'motion-safe:hover:-translate-y-[3px]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral',
    ],
    {
        variants: {
            variant: {
                dark: 'border-transparent bg-ink text-white hover:bg-ink-2',
                accent: 'border-transparent bg-coral text-white hover:bg-coral-hover',
                light: 'border-transparent bg-white text-teal-dark',
                'outline-light':
                    'border-white/38 text-white hover:bg-white hover:text-ink',
            },
            size: {
                default: 'px-[21px] py-[14px]',
                small: 'px-[15px] py-[10px] text-[12px]',
            },
        },
        defaultVariants: {
            variant: 'dark',
            size: 'default',
        },
    },
);

export interface SiteButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

export function SiteButton({ className, variant, size, asChild = false, ...props }: SiteButtonProps) {
    const Comp = asChild ? Slot : 'button';

    return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
