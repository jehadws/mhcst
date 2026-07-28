import { Head } from '@inertiajs/react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { CourseCatalog } from '@/components/site/course-catalog'
import { useSite } from '@/context/site-context'

interface Props {
    courses: any[]
}

export default function PublicCoursesPage({ courses = [] }: Props) {
    const { t } = useSite()

    return (
        <>
            <Head title={`${t.nav.courses} | ${t.brandShort}`} />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1 py-6">
                    <CourseCatalog courses={courses} />
                </main>
                <SiteFooter />
            </div>
        </>
    )
}
