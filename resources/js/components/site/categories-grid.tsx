import { Link } from '@inertiajs/react'
import { ArrowLeft, ArrowRight, Briefcase, Calculator, Code2, FolderGit2, Globe2, Megaphone, Sparkles } from 'lucide-react'
import { categories } from '@/data/courses'
import { useSite } from '@/context/site-context'

const categoryIcons: Record<string, any> = {
    business: Briefcase,
    it: Code2,
    finance: Calculator,
    languages: Globe2,
    project: FolderGit2,
    marketing: Megaphone,
}

export function CategoriesGrid() {
    const { t, tr, locale } = useSite()
    const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight

    return (
        <section className="relative py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-start">
                    <div>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                            <Sparkles className="size-3.5" />
                            <span>{locale === 'ar' ? 'التصنيفات المتاحة' : 'Course Categories'}</span>
                        </span>
                        <h2 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {locale === 'ar' ? 'اختر مجال التعلم المناسب لك' : 'Explore Courses by Category'}
                        </h2>
                    </div>
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground shadow-xs transition-all hover:border-primary/40 hover:bg-secondary"
                    >
                        <span>{t.hero.ctaPrimary}</span>
                        <Arrow className="size-4" />
                    </Link>
                </div>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((c) => {
                        const Icon = categoryIcons[c.id] || Briefcase
                        return (
                            <Link
                                key={c.id}
                                href={`/courses?category=${c.id}`}
                                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 shadow-inner">
                                        <Icon className="size-7" />
                                    </div>
                                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        {locale === 'ar' ? 'برامج متنوعة' : 'Multiple Courses'}
                                    </span>
                                </div>

                                <h3 className="mt-5 font-serif text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                                    {tr(c.label)}
                                </h3>

                                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                                    {locale === 'ar'
                                        ? 'اكتسب أحدث المهارات المطلوبة في هذا المجال مع شهادات معتمدة.'
                                        : 'Master in-demand skills in this field with accredited certification.'}
                                </p>

                                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary transition-all group-hover:gap-2">
                                    <span>{t.catalog.viewCourse}</span>
                                    <Arrow className="size-3.5" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
