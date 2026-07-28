import { Head } from '@inertiajs/react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { CourseDetail } from '@/components/site/course-detail'
import { useSite } from '@/context/site-context'

export default function ShowCoursePage({ course }: { course: any }) {
    const { t, tr } = useSite()

    const titleText = course
        ? (course.title_ar || (course.title ? tr(course.title) : t.brandShort))
        : t.course.notFound

    return (
        <>
            <Head title={`${titleText} | ${t.brandShort}`} />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">
                    <CourseDetail course={course} />
                </main>
                <SiteFooter />
            </div>
        </>
    )
}
