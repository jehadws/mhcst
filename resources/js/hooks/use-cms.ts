import { useSite } from '@/context/site-context'
import { usePage } from '@inertiajs/react'
import type { CmsCapabilities } from '@/lib/dashboard-access'
import type { SharedData } from '@/types'

export function useCms() {
    const { t, locale, isRTL } = useSite()
    const page = usePage<SharedData>()
    const capabilities = (page.props.cmsCapabilities ?? { canManage: false, isTeacher: false }) as CmsCapabilities

    return {
        c: t.cms,
        locale,
        isRTL,
        canManage: capabilities.canManage,
        isTeacher: capabilities.isTeacher,
    }
}
