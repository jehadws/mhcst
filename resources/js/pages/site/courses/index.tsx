import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { SeoHead } from '@/components/seo-head'
import { CourseCatalog } from '@/components/site/course-catalog'
import { useSite } from '@/context/site-context'

interface CourseListItem {
    title_ar?: string;
    title_en?: string;
    title?: { en: string; ar: string };
    slug?: string;
    description_ar?: string;
    description_en?: string;
    cover_image?: string;
    price?: number;
    [key: string]: unknown;
}

interface Props {
    courses: CourseListItem[];
}

export default function PublicCoursesPage({ courses = [] }: Props) {
    const { t, locale } = useSite()

    return (
        <>
            <SeoHead
                title={t.nav.courses}
                description={locale === 'ar'
                    ? 'تصفح الدورات التدريبية المهنية المعتمدة في المعهد الحديث العالي للعلوم والتكنولوجيا'
                    : 'Browse accredited professional training courses at the Modern Higher Institute for Science & Technology'}
            />
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
