import { useSiteSettings } from '@/hooks/use-site-settings';
import { brandingAssets, resolveLogoUrl } from '@/lib/branding';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/**
 * The college seal on a light disc: the header, footer and auth bar are all dark ink,
 * and the logo artwork has a white ground.
 */
export function BrandMark({ className }: { className?: string }) {
    const settings = useSiteSettings();
    const [logoMissing, setLogoMissing] = useState(false);
    const logoUrl = logoMissing ? brandingAssets.header : resolveLogoUrl(settings, 'header');

    return (
        <span className={cn('grid size-[42px] shrink-0 place-items-center rounded-full bg-white overflow-hidden p-[4px] ring-1 ring-black/10', className)}>
            <img
                src={logoUrl}
                alt=""
                aria-hidden="true"
                width={42}
                height={42}
                decoding="async"
                onError={() => setLogoMissing(true)}
                className="size-full object-contain"
            />
        </span>
    );
}
