import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { SeoHead } from '@/components/seo-head'
import { CourseDetail } from '@/components/site/course-detail'
import { useSite } from '@/context/site-context'

interface CourseDetailData {
    title_ar?: string;
    title_en?: string;
    title?: { en: string; ar: string };
    slug?: string;
    description_ar?: string;
    description_en?: string;
    summary?: { en: string; ar: string };
    cover_image?: string;
}

export default function ShowCoursePage({ course, courses = [] }: { course: CourseDetailData | null; courses?: CourseDetailData[] }) {
    const { t, tr } = useSite()

    const titleText = course
        ? (course.title_ar || (course.title ? tr(course.title) : t.brandShort))
        : t.course.notFound

    const summary = course?.summary || {
        en: course?.description_en || course?.description_ar,
        ar: course?.description_ar || course?.description_en,
    }

    const coverImage = course?.cover_image
        ? (course.cover_image.startsWith('http') ? course.cover_image : `/storage/${course.cover_image}`)
        : undefined

    return (
        <>
            <SeoHead
                title={titleText}
                description={course ? tr(summary) : undefined}
                image={coverImage}
                type="article"
            />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">
                    <CourseDetail course={course} courses={courses} />
                </main>
                <SiteFooter />
            </div>
        </>
    )
}
