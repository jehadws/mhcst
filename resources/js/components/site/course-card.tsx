import { Link } from '@inertiajs/react'
import { ArrowLeft, ArrowRight, Clock, Star, Users } from 'lucide-react'
import { categories, levelLabels, type Course } from '@/data/courses'
import { useSite } from '@/context/site-context'
import { cn } from '@/lib/utils'

export function CourseCard({ course }: { course: Course }) {
    const { t, tr, locale } = useSite()
    const category = categories.find((c) => c.id === (course.category_id || (course as any).category))
    const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight

    const titleObj = course.title_ar ? { en: course.title_en || course.title_ar, ar: course.title_ar } : (course as any).title
    const summaryObj = course.description_ar ? { en: course.description_en || course.description_ar, ar: course.description_ar } : (course as any).summary

    const coverImage = course.cover_image
        ? (course.cover_image.startsWith('http') ? course.cover_image : `/storage/${course.cover_image}`)
        : ((course as any).image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=800&auto=format&fit=crop')

    const priceDisplay = course.price !== undefined ? `${course.price} د.ل` : `$${(course as any).price_usd || 0}`

    const levelKey = course.level || 'beginner'
    const levelLabel = levelLabels[levelKey] ? tr(levelLabels[levelKey]) : levelKey

    return (
        <Link
            href={`/courses/${course.slug || course.id}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5"
            prefetch
        >
            {/* Image Header with Badge Overlay */}
            <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                    src={coverImage}
                    alt={titleObj ? tr(titleObj) : ''}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                
                <div className="absolute start-3 top-3 flex gap-2">
                    {category && (
                        <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-primary-foreground shadow-md backdrop-blur-md">
                            {tr(category.label)}
                        </span>
                    )}
                </div>

                <div className="absolute end-3 bottom-3 rounded-xl bg-background/90 px-3 py-1 text-xs font-bold text-foreground shadow-md backdrop-blur-md">
                    {levelLabel}
                </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-semibold text-amber-500">
                        <Star className="size-3.5 fill-current" />
                        <span>4.9</span>
                        <span className="text-muted-foreground font-normal">(120+)</span>
                    </span>
                    {course.duration_hours && (
                        <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            <span>{course.duration_hours} {t.catalog.hours}</span>
                        </span>
                    )}
                </div>

                <h3 className="mt-3 line-clamp-2 font-serif text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {titleObj ? tr(titleObj) : ''}
                </h3>

                <p className="mt-2 line-clamp-2 flex-1 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {summaryObj ? tr(summaryObj) : ''}
                </p>

                {/* Footer with Price and Link */}
                <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4">
                    <div>
                        <span className="text-xs text-muted-foreground block leading-none">{locale === 'ar' ? 'رسوم الدورة' : 'Price'}</span>
                        <span className="font-serif text-xl font-extrabold text-primary">{priceDisplay}</span>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                        <span>{t.catalog.viewCourse}</span>
                        <Arrow className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    </span>
                </div>
            </div>
        </Link>
    )
}
