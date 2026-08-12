import { usePage } from '@inertiajs/react'
import { useSite } from '@/context/site-context'
import type { SiteSettings } from '@/types'

export function useSiteSettings(): SiteSettings {
    return (usePage().props.siteSettings as SiteSettings) ?? {}
}

export function useBrandText(): { brandName: string; brandSub: string } {
    const { t, tr } = useSite()
    const settings = useSiteSettings()

    return {
        brandName: tr({
            en: settings.site_name || t.brandShort,
            ar: settings.site_name_ar || t.brandShort,
        }),
        brandSub: tr({
            en: settings.site_tagline || t.brandFull,
            ar: settings.site_tagline_ar || t.brandFull,
        }),
    }
}
