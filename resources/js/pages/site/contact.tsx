import { Head } from '@inertiajs/react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { Contact } from '@/components/site/contact'
import { EnrollForm } from '@/components/site/enroll-form'
import { FloatingButtons } from '@/components/site/floating-buttons'
import { useSite } from '@/context/site-context'
import { Mail } from 'lucide-react'

interface Props {
    courses?: any[]
}

export default function PublicContactPage({ courses = [] }: Props) {
    const { t } = useSite()

    return (
        <>
            <Head title={`${t.nav.contact} | ${t.brandShort}`} />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">
                    {/* Header Banner */}
                    <div className="relative border-b border-border/60 bg-gradient-to-b from-primary/10 via-background to-background py-14 sm:py-16">
                        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                                <Mail className="size-3.5" />
                                <span>{t.nav.contact}</span>
                            </span>
                            <h1 className="mt-4 font-serif text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                                {t.location.title}
                            </h1>
                            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
                                {t.location.subtitle}
                            </p>
                        </div>
                    </div>
                    <Contact />

                    {courses.length > 0 && (
                        <section className="border-t border-border/60 bg-background py-16 sm:py-20">
                            <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-start">
                                <div>
                                    <h2 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">
                                        {t.enroll.title}
                                    </h2>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                                        {t.enroll.subtitle}
                                    </p>
                                </div>
                                <EnrollForm courses={courses} />
                            </div>
                        </section>
                    )}
                </main>
                <SiteFooter />
                <FloatingButtons />
            </div>
        </>
    )
}
