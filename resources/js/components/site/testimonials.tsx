import { Quote, Star } from 'lucide-react'
import { testimonials as defaultTestimonials } from '@/data/i18n'
import { useSite } from '@/context/site-context'

export function Testimonials({ items }: { items?: any[] }) {
    const { t, tr, locale } = useSite()

    const list = items && items.length > 0 ? items : defaultTestimonials

    return (
        <section id="testimonials" className="relative scroll-mt-20 py-16 sm:py-24 bg-card/40 border-y border-border/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                        <Star className="size-3.5 fill-current text-amber-500" />
                        <span>{t.testimonials.title}</span>
                    </span>
                    <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {t.testimonials.subtitle}
                    </h2>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {list.map((item, idx) => {
                        const name = typeof item.name === 'string' ? item.name : tr(item.name)
                        const role = item.role_title || item.company || (item.role ? tr(item.role) : '')
                        const quoteText = item.quote ? (typeof item.quote === 'string' ? item.quote : tr(item.quote)) : ''

                        return (
                            <div
                                key={idx}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
                            >
                                <div>
                                    <div className="flex items-center gap-1 text-amber-500">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} className="size-4 fill-current" />
                                        ))}
                                    </div>
                                    <p className="mt-4 text-xs sm:text-sm leading-relaxed text-muted-foreground italic">
                                        "{quoteText}"
                                    </p>
                                </div>

                                <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-serif text-sm font-bold text-primary">
                                        {name.charAt(0)}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h3 className="truncate font-semibold text-foreground text-sm">{name}</h3>
                                        {role && <p className="truncate text-xs text-muted-foreground">{role}</p>}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
