import { cmsAr, cmsEn } from '@/data/cms-i18n'

export type CmsDictionary = typeof cmsEn

export function cmsBreadcrumbs(
    c: CmsDictionary,
    segments: Array<{ label: string; href: string }>,
): Array<{ title: string; href: string }> {
    return [
        { title: c.common.academicSystem, href: '/dashboard' },
        ...segments.map((s) => ({ title: s.label, href: s.href })),
    ]
}

export function dayLabel(c: CmsDictionary, day: string): string {
    return c.labels.days[day as keyof typeof c.labels.days] ?? day
}

export function semesterLabel(c: CmsDictionary, semester: string): string {
    return c.labels.semesters[semester as keyof typeof c.labels.semesters] ?? semester
}

export function studentStatusLabel(c: CmsDictionary, status: string): string {
    return c.labels.studentStatus[status as keyof typeof c.labels.studentStatus] ?? status
}

export function enrollmentStatusLabel(c: CmsDictionary, status: string): string {
    return c.labels.enrollmentStatus[status as keyof typeof c.labels.enrollmentStatus] ?? status
}

export function sessionTypeLabel(c: CmsDictionary, type: string): string {
    return c.labels.sessionTypes[type as keyof typeof c.labels.sessionTypes] ?? type
}
