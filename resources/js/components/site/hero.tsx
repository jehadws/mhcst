import { ArrowLeft, ArrowRight, Award, CheckCircle2, Play, ShieldCheck, Sparkles, Star, Users } from 'lucide-react'
import { useSite } from '@/context/site-context'

export function Hero() {
    const { t, locale } = useSite()
    const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight

    return (
        <section className="relative overflow-hidden py-16 sm:py-24 lg:py-28">
            {/* Background Mesh Glows */}
            <div className="hero-glow pointer-events-none absolute inset-0 -z-10" />
            <div className="pointer-events-none absolute -top-40 start-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-0 end-0 -z-10 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[100px]" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                    {/* Text Column */}
                    <div className="animate-fade-up lg:col-span-7">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary backdrop-blur-md shadow-xs">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                                <span className="relative inline-flex size-2 rounded-full bg-primary" />
                            </span>
                            <ShieldCheck className="size-4" />
                            <span>{t.hero.badge}</span>
                        </div>

                        <h1 className="mt-6 font-serif text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.15]">
                            {locale === 'ar' ? (
                                <>
                                    طوّر مهاراتك مع <span className="gradient-text">أحدث البرامج</span> المعتمدة
                                </>
                            ) : (
                                <>
                                    Build skills that move your <span className="gradient-text">career forward</span>
                                </>
                            )}
                        </h1>

                        <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                            {t.hero.subtitle}
                        </p>

                        {/* Feature bullets */}
                        <div className="mt-6 flex flex-wrap gap-4 text-xs font-medium text-foreground sm:text-sm">
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="size-4 text-emerald-500" />
                                {locale === 'ar' ? 'شهادات معتمدة دولياً' : 'Accredited Certificates'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="size-4 text-emerald-500" />
                                {locale === 'ar' ? 'نخبة من المدربين الخبراء' : 'Expert Instructors'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="size-4 text-emerald-500" />
                                {locale === 'ar' ? 'تدريب حضوري وأونلاين' : 'Onsite & Online Training'}
                            </span>
                        </div>

                        {/* CTA Buttons */}
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <a
                                href="/departments"
                                className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-xl bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5"
                            >
                                <Sparkles className="size-4" />
                                <span>{locale === 'ar' ? 'استكشف الأقسام الأكاديمية' : 'Explore Departments'}</span>
                                <Arrow className="size-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                            </a>
                            <a
                                href="#contact"
                                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-sm font-semibold text-foreground shadow-xs transition-all hover:border-primary/40 hover:bg-secondary hover:-translate-y-0.5"
                            >
                                <span>{t.hero.ctaSecondary}</span>
                            </a>
                        </div>

                        {/* Trust & Rating Stats */}
                        <div className="mt-10 flex items-center gap-4 border-t border-border/60 pt-6">
                            <div className="flex -space-x-2.5 rtl:space-x-reverse">
                                {['/images/avatar1.jpg', '/images/avatar2.jpg', '/images/avatar3.jpg', '/images/avatar4.jpg'].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex size-9 items-center justify-center rounded-full border-2 border-background bg-gradient-to-tr from-primary to-indigo-600 text-xs font-bold text-white shadow-xs"
                                    >
                                        {['A', 'M', 'S', 'K'][i]}
                                    </div>
                                ))}
                            </div>
                            <div className="text-xs sm:text-sm">
                                <div className="flex items-center gap-1">
                                    <span className="flex text-amber-500">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star key={i} className="size-3.5 fill-current" />
                                        ))}
                                    </span>
                                    <span className="font-bold text-foreground">4.9 / 5</span>
                                </div>
                                <p className="text-muted-foreground">
                                    {locale === 'ar' ? 'أكثر من 20,000+ متدرب يثقون بنا' : 'Trusted by 20,000+ graduates'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Image Column with Floating Cards */}
                    <div className="relative lg:col-span-5">
                        <div className="relative mx-auto max-w-md lg:max-w-none">
                            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border/80 bg-card p-2 shadow-2xl shadow-primary/10">
                                <img
                                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop"
                                    alt={t.hero.imageAlt}
                                    className="h-full w-full rounded-2xl object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            </div>

                            {/* Floating Card 1: Certificate Badge */}
                            <div className="animate-float absolute -bottom-6 -start-6 max-w-[220px] rounded-2xl border border-border/80 bg-card/90 p-4 shadow-xl backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 shadow-inner">
                                        <Award className="size-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">{t.about.point1Title}</p>
                                        <p className="text-[11px] text-muted-foreground">{locale === 'ar' ? 'اعتماد رسمي' : 'Official Accreditation'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Card 2: Student Stats */}
                            <div className="animate-float [animation-delay:2s] absolute -top-6 -end-6 rounded-2xl border border-border/80 bg-card/90 px-4 py-3 shadow-xl backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Users className="size-5" />
                                    </div>
                                    <div>
                                        <p className="font-serif text-lg font-bold leading-none text-foreground">+20,000</p>
                                        <p className="text-[11px] text-muted-foreground">{t.stats.learners}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
