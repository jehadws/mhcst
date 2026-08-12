import { resolveLogoUrl, type LogoVariant } from '@/lib/branding';
import { cn } from '@/lib/utils';
import { useSiteSettings } from '@/hooks/use-site-settings';
import type { ImgHTMLAttributes } from 'react';

type SiteLogoProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
    variant?: LogoVariant;
    alt?: string;
};

export function SiteLogo({ variant = 'header', alt, className, ...props }: SiteLogoProps) {
    const settings = useSiteSettings();

    return (
        <img
            src={resolveLogoUrl(settings, variant)}
            alt={alt ?? settings.site_name ?? 'College logo'}
            className={cn('size-full object-contain', className)}
            {...props}
        />
    );
}
