import { Head } from '@inertiajs/react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { FloatingButtons } from '@/components/site/floating-buttons'
import { CorporateCta } from '@/components/site/corporate-cta'
import { Hero } from '@/components/site/hero'
import { Stats } from '@/components/site/stats'
import { CategoriesGrid } from '@/components/site/categories-grid'
import { FeaturesGrid } from '@/components/site/features-grid'
import { CourseCatalog } from '@/components/site/course-catalog'
import { About } from '@/components/site/about'
import { Testimonials } from '@/components/site/testimonials'
import { Faq } from '@/components/site/faq'
import { Contact } from '@/components/site/contact'
import { useSite } from '@/context/site-context'

interface Props {
    courses: any[]
    faqs?: any[]
    testimonials?: any[]
}

export default function Welcome({ courses = [], faqs, testimonials }: Props) {
    const { t } = useSite()

    return (
        <>
            <Head title={t.brandShort} />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">
                    <Hero />
                    <Stats />
                    <CategoriesGrid />
                    <CourseCatalog courses={courses} />
                    <FeaturesGrid />
                    <About />
                    <CorporateCta />
                    <Testimonials items={testimonials} />
                    <Faq items={faqs} />
                    <Contact />
                </main>
                <SiteFooter />
                <FloatingButtons />
            </div>
        </>
    )
}
