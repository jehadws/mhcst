import { Link } from '@inertiajs/react'
import { ArrowLeft, ArrowRight, BookOpen, Check, Clock, GraduationCap, Layers, Star } from 'lucide-react'
import { categories, levelLabels } from '@/data/courses'
import { useSite } from '@/context/site-context'
import { EnrollForm } from './enroll-form'

export function CourseDetail({ course, courses = [] }: { course: any; courses?: any[] }) {
    const { t, tr, locale } = useSite()
    const Back = locale === 'ar' ? ArrowRight : ArrowLeft

    if (!course) {
        return (
            <div className="mx-auto max-w-md px-4 py-28 text-center">
                <h1 className="font-serif text-3xl font-semibold">{t.course.notFound}</h1>
                <p className="mt-3 text-muted-foreground">{t.course.notFoundBody}</p>
                <Link
                    href="/courses"
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                    {t.course.back}
                </Link>
            </div>
        )
    }

    const titleObj = course.title || { en: course.title_en || course.title_ar, ar: course.title_ar }
    const summaryObj = course.summary || { en: course.description_en || course.description_ar, ar: course.description_ar }
    const descriptionObj = course.description || summaryObj

    const categoryId = course.category_id || course.category
    const category = categories.find((c) => c.id === categoryId)

    const modules = course.modules || []
    const outcomes = course.outcomes || []
    const totalLessons = modules.reduce((sum: number, m: any) => sum + (m.lessons || 0), 0)

    const instructorName = course.instructors?.[0]?.name || (course.instructor?.name ? tr(course.instructor.name) : '')
    const instructorRole = course.instructors?.[0]?.specialization || (course.instructor?.role ? tr(course.instructor.role) : '')

    const coverImage = course.cover_image
        ? (course.cover_image.startsWith('http') ? course.cover_image : `/storage/${course.cover_image}`)
        : course.image

    const priceText = course.price !== undefined ? `${course.price} د.ل` : `$${course.price_usd || 0}`

    const facts = [
        { icon: Layers, label: t.course.level, value: levelLabels[course.level] ? tr(levelLabels[course.level]) : course.level },
        { icon: Clock, label: t.course.duration, value: `${course.duration_hours || 0} ${t.catalog.hours}` },
        { icon: BookOpen, label: t.course.lessons, value: String(totalLessons || course.lessons || 0) },
        { icon: GraduationCap, label: t.course.certificate, value: t.course.certificateYes },
    ]

    return (
        <div>
            {/* Hero */}
            <section className="border-b border-border bg-card">
                <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
                    <Link
                        href="/courses"
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <Back className="size-4" />
                        {t.course.back}
                    </Link>

                    <div className="mt-6 grid gap-8 md:grid-cols-2 md:items-center">
                        <div>
                            {category && (
                                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                                    {tr(category.label)}
                                </span>
                            )}
                            <h1 className="mt-4 text-balance font-serif text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                                {tr(titleObj)}
                            </h1>
                            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{tr(summaryObj)}</p>
                            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                                {course.rating && (
                                    <span className="flex items-center gap-1.5">
                                        <span className="flex text-accent">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className="size-4 fill-current" />
                                            ))}
                                        </span>
                                        <span className="font-semibold">{course.rating}</span>
                                        {course.reviews && <span className="text-muted-foreground">({course.reviews})</span>}
                                    </span>
                                )}
                                {instructorName && <span className="text-muted-foreground">{instructorName}</span>}
                            </div>
                            <div className="mt-6 flex flex-wrap items-center gap-4">
                                <span className="font-serif text-3xl font-semibold text-primary">{priceText}</span>
                                <a
                                    href="#enroll"
                                    className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                                >
                                    {t.course.enroll}
                                </a>
                            </div>
                        </div>
                        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border shadow-lg">
                            <img src={coverImage} alt={tr(titleObj)} className="h-full w-full object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Facts bar */}
            <section className="border-b border-border">
                <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 md:grid-cols-4">
                    {facts.map((f) => (
                        <div key={f.label} className="flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <f.icon className="size-5" />
                            </span>
                            <div className="leading-tight">
                                <p className="text-xs text-muted-foreground">{f.label}</p>
                                <p className="text-sm font-semibold">{f.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Body */}
            <section className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3">
                <div className="space-y-12 lg:col-span-2">
                    <div>
                        <h2 className="font-serif text-2xl font-semibold tracking-tight">{t.course.overview}</h2>
                        <p className="mt-4 leading-relaxed text-muted-foreground whitespace-pre-line">{tr(descriptionObj)}</p>
                    </div>

                    {outcomes.length > 0 && (
                        <div>
                            <h2 className="font-serif text-2xl font-semibold tracking-tight">{t.course.whatYouLearn}</h2>
                            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                                {outcomes.map((o: any, i: number) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Check className="size-3.5" />
                                        </span>
                                        <span className="text-sm leading-relaxed">{typeof o === 'string' ? o : tr(o)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {(course.curriculums?.length > 0 || modules.length > 0) && (
                        <div>
                            <div className="flex items-baseline justify-between">
                                <h2 className="font-serif text-2xl font-semibold tracking-tight">{t.course.curriculum}</h2>
                                <span className="text-sm text-muted-foreground">
                                    {(course.curriculums?.length || modules.length)} {t.course.modules}
                                </span>
                            </div>
                            {course.curriculums?.length > 0 ? (
                                <div className="mt-4 space-y-4">
                                    {course.curriculums.map((curr: any, i: number) => {
                                        const secTitle = locale === 'ar' ? curr.section_title_ar : (curr.section_title_en || curr.section_title_ar)
                                        const lessonsList = Array.isArray(curr.lessons) ? curr.lessons : []
                                        return (
                                            <div key={curr.id || i} className="overflow-hidden rounded-2xl border border-border bg-card">
                                                <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 font-serif text-xs font-bold text-primary">
                                                            {i + 1}
                                                        </span>
                                                        <span className="font-semibold text-foreground">{secTitle}</span>
                                                    </div>
                                                    {lessonsList.length > 0 && (
                                                        <span className="text-xs font-medium text-muted-foreground">
                                                            {lessonsList.length} {t.catalog.lessons}
                                                        </span>
                                                    )}
                                                </div>
                                                {lessonsList.length > 0 && (
                                                    <div className="divide-y divide-border/40 px-5">
                                                        {lessonsList.map((les: any, j: number) => {
                                                            const lesTitle = locale === 'ar' ? (les.title_ar || les.title) : (les.title_en || les.title_ar || les.title)
                                                            return (
                                                                <div key={j} className="flex items-center justify-between py-3 text-sm">
                                                                    <span className="text-foreground/90">{lesTitle}</span>
                                                                    {les.duration_minutes && (
                                                                        <span className="text-xs text-muted-foreground">{les.duration_minutes} دقيقة</span>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="mt-4 divide-y divide-border overflow-hidden rounded-2xl border border-border">
                                    {modules.map((m: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between gap-4 px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-8 items-center justify-center rounded-lg bg-secondary font-serif text-sm font-semibold text-secondary-foreground">
                                                    {i + 1}
                                                </span>
                                                <span className="font-medium">{typeof m.title === 'string' ? m.title : tr(m.title)}</span>
                                            </div>
                                            <span className="shrink-0 text-sm text-muted-foreground">
                                                {m.lessons} {t.catalog.lessons}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {course.attachments?.length > 0 && (
                        <div>
                            <h2 className="font-serif text-2xl font-semibold tracking-tight">
                                {locale === 'ar' ? 'الملفات والمرفقات الدراسية' : 'Course Files & Attachments'}
                            </h2>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                {course.attachments.map((att: any) => {
                                    const attTitle = locale === 'ar' ? att.title_ar : (att.title_en || att.title_ar)
                                    return (
                                        <a
                                            key={att.id}
                                            href={`/storage/${att.file_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 transition-colors hover:border-primary hover:bg-primary/5"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs uppercase">
                                                    {att.file_type || 'PDF'}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground line-clamp-1">{attTitle}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {locale === 'ar' ? 'تحميل المستند' : 'Download file'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground">
                                                ↓
                                            </span>
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {instructorName && (
                        <div>
                            <h2 className="font-serif text-2xl font-semibold tracking-tight">{t.course.instructor}</h2>
                            <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                                <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 font-serif text-lg font-semibold text-primary">
                                    {instructorName.charAt(0)}
                                </span>
                                <div>
                                    <p className="font-semibold">{instructorName}</p>
                                    {instructorRole && <p className="text-sm text-muted-foreground">{instructorRole}</p>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky enroll */}
                <div className="lg:col-span-1">
                    <div id="enroll" className="scroll-mt-20 lg:sticky lg:top-20">
                        <h2 className="mb-4 font-serif text-xl font-semibold tracking-tight">{t.course.enroll}</h2>
                        <EnrollForm defaultCourse={course.slug} courses={courses.length > 0 ? courses : [{ slug: course.slug, title_ar: course.title_ar, title_en: course.title_en }]} />
                    </div>
                </div>
            </section>
        </div>
    )
}
