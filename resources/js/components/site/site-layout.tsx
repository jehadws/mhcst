import { FloatingButtons } from '@/components/site/floating-buttons';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type SiteLayoutProps = {
    children: ReactNode;
    headerVariant?: 'overlay' | 'solid';
};

export function SiteLayout({ children, headerVariant = 'overlay' }: SiteLayoutProps) {
    const { locale } = useSite();

    return (
        <div
            className={cn(
                'bg-paper text-ink flex min-h-screen flex-col',
                locale === 'ar' ? 'font-site' : 'font-site-latin',
            )}
        >
            <SiteHeader variant={headerVariant} />
            <main id="main-content" className="flex-1">
                {children}
            </main>
            <SiteFooter />
            <FloatingButtons />
        </div>
    );
}
