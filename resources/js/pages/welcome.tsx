import { SeoHead } from '@/components/seo-head'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { FloatingButtons } from '@/components/site/floating-buttons'
import { Hero } from '@/components/site/hero'
import { Stats } from '@/components/site/stats'
import { FeaturesGrid } from '@/components/site/features-grid'
import { About } from '@/components/site/about'
import { BlogPostsSection } from '@/components/site/blog-posts-section'
import { Testimonials } from '@/components/site/testimonials'
import { Faq } from '@/components/site/faq'
import { Contact } from '@/components/site/contact'

interface Props {
    departments?: any[]
    faqs?: any[]
    testimonials?: any[]
    posts?: any[]
    stats?: any
}

export default function Welcome({ faqs, testimonials, posts }: Props) {
    return (
        <>
            <SeoHead />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">
                    <Hero />
                    <Stats />
                    <FeaturesGrid />
                    <About />
                    <Testimonials items={testimonials} />
                    <BlogPostsSection items={posts} />
                    <Faq items={faqs} />
                    <Contact />
                </main>
                <SiteFooter />
                <FloatingButtons />
            </div>
        </>
    )
}

