import { usePage } from '@inertiajs/react'
import type { SiteSettings } from '@/types'

export function useSiteSettings(): SiteSettings {
    return (usePage().props.siteSettings as SiteSettings) ?? {}
}
