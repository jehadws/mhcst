import { cn } from '@/lib/utils';
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: 'none' | 'delay' | 'delay-2';
    style?: CSSProperties;
}

export function Reveal({ children, className, delay = 'none', style }: RevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            el.classList.add('is-visible');
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        observer.unobserve(entry.target);
                    }
                }
            },
            { threshold: 0.12 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} style={style} className={cn('reveal', delay !== 'none' && `reveal-${delay}`, className)}>
            {children}
        </div>
    );
}
