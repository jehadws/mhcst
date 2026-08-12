import type { SiteSettings } from '@/types';

/** Source-of-truth branding assets under /public/images/branding */
export const brandingAssets = {
    /** White background — header, footer, admin, PDFs, light UI */
    main: '/images/branding/logo-main.png',
    /** Pre-sized for public site header (128×128 source) */
    header: '/images/branding/logo-header-128.png',
    /** Pre-sized for dashboard sidebar / compact UI (64×64 source) */
    icon: '/images/branding/logo-icon-64.png',
    /** Black canvas — social previews; prefer `main` on the live site */
    rounded: '/images/branding/logo-rounded.png',
    /** Open Graph / social square preview */
    og: '/images/og-logo.png',
} as const;

/** Recommended display heights in the UI (CSS), not file dimensions */
export const logoDisplaySizes = {
    header: 44,
    footer: 44,
    sidebar: 32,
    auth: 48,
    hero: 96,
} as const;

export type LogoVariant = keyof typeof brandingAssets;

export function resolveLogoUrl(settings?: SiteSettings, variant: LogoVariant = 'header'): string {
    if (settings?.site_logo) {
        return `/storage/${settings.site_logo}`;
    }

    return brandingAssets[variant];
}
