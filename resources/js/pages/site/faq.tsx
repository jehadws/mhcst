import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { SeoHead } from '@/components/seo-head'
import { Faq } from '@/components/site/faq'
import { FloatingButtons } from '@/components/site/floating-buttons'
import { useSite } from '@/context/site-context'
import { HelpCircle } from 'lucide-react'

interface FaqItem {
    question: string;
    answer: string;
}

interface Props {
    faqs?: FaqItem[];
}

export default function PublicFaqPage({ faqs }: Props) {
    const { t, locale } = useSite()

    return (
        <>
            <SeoHead
                title={t.nav.faq}
                description={locale === 'ar'
                    ? 'الأسئلة الشائعة حول التسجيل والدفع والشهادات في المعهد الحديث العالي للعلوم والتكنولوجيا'
                    : 'Frequently asked questions about enrollment, payment, and certificates at MHCST'}
            />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">
                    {/* Header Banner */}
                    <div className="relative border-b border-border/60 bg-gradient-to-b from-primary/10 via-background to-background py-14 sm:py-16">
                        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                                <HelpCircle className="size-3.5" />
                                <span>{t.nav.faq}</span>
                            </span>
                            <h1 className="mt-4 font-serif text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                                {t.faq.title}
                            </h1>
                            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
                                {t.faq.subtitle}
                            </p>
                        </div>
                    </div>

                    <Faq items={faqs} />
                </main>
                <SiteFooter />
                <FloatingButtons />
            </div>
        </>
    )
}
