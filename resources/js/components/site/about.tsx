import { Award, BookOpen, CheckCircle, GraduationCap, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useSite } from '@/context/site-context'

export function About() {
    const { t, locale } = useSite()

    const features = [
        {
            icon: ShieldCheck,
            title: t.about.point1Title,
            body: t.about.point1Body,
            color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        },
        {
            icon: Users,
            title: t.about.point2Title,
            body: t.about.point2Body,
            color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
        },
        {
            icon: GraduationCap,
            title: t.about.point3Title,
            body: t.about.point3Body,
            color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
    ]

    return (
        <section id="about" className="relative scroll-mt-20 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
                    {/* Visual collage */}
                    <div className="relative lg:col-span-6">
                        <div className="relative mx-auto max-w-lg lg:max-w-none">
                            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border/80 bg-card p-2 shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1000&auto=format&fit=crop"
                                    alt={t.about.title}
                                    className="h-full w-full rounded-2xl object-cover"
                                />
                            </div>

                            {/* Decorative Experience Badge */}
                            <div className="absolute -bottom-6 -end-6 rounded-2xl border border-border/80 bg-card p-5 shadow-xl backdrop-blur-xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-serif text-xl font-bold">
                                        +10
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">
                                            {locale === 'ar' ? 'سنوات من التميز' : 'Years of Excellence'}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {locale === 'ar' ? 'في التعليم والتطوير المهني' : 'In professional training'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content text */}
                    <div className="lg:col-span-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary">
                            <Sparkles className="size-3.5" />
                            <span>{locale === 'ar' ? 'رؤيتنا ورسالتنا' : 'Our Mission'}</span>
                        </div>

                        <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {t.about.title}
                        </h2>

                        <p className="mt-4 leading-relaxed text-muted-foreground">
                            {t.about.body}
                        </p>

                        <div className="mt-8 space-y-4">
                            {features.map((f, i) => (
                                <div
                                    key={i}
                                    className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-md"
                                >
                                    <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${f.color}`}>
                                        <f.icon className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-serif text-base font-bold text-foreground">{f.title}</h3>
                                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{f.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
