import { Link } from '@inertiajs/react'
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Sparkles } from 'lucide-react'
import { useSite } from '@/context/site-context'

export function CorporateCta() {
    const { locale } = useSite()
    const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight

    const perks = locale === 'ar'
        ? ['برامج مصممة لاحتياجات فريقك', 'تدريب حضوري وعبر الإنترنت', 'شهادات معتمدة للموظفين', 'تقارير متابعة وتقييم']
        : ['Programs tailored to your team\'s needs', 'On-site & online delivery', 'Accredited staff certificates', 'Progress tracking & reporting']

    return (
        <section className="relative overflow-hidden py-16 sm:py-24">
            {/* Background gradient blobs */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute -start-20 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
                <div className="absolute -end-20 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary via-primary/90 to-indigo-700 p-8 shadow-2xl sm:p-12 lg:p-16">
                    {/* Decorative dots */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-10 -end-10 h-64 w-64 rounded-full border border-white/10" />
                        <div className="absolute -bottom-16 -start-16 h-72 w-72 rounded-full border border-white/10" />
                    </div>

                    <div className="relative grid gap-10 lg:grid-cols-2 lg:gap-16">
                        <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                                <Building2 className="size-3.5" />
                                <span>{locale === 'ar' ? 'تدريب الشركات والمؤسسات' : 'Corporate & Group Training'}</span>
                            </span>

                            <h2 className="mt-5 font-serif text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">
                                {locale === 'ar'
                                    ? 'برامج تدريبية مخصصة لمؤسستك'
                                    : 'Tailored Training for Your Organisation'}
                            </h2>

                            <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
                                {locale === 'ar'
                                    ? 'نصمم برامج تدريبية احترافية تتناسب مع أهداف مؤسستك وطبيعة فريق العمل لديك، مع مرونة كاملة في التوقيت وأسلوب التقديم.'
                                    : 'We design professional training programmes tailored to your organisation\'s goals and team dynamics, with full flexibility in timing and delivery format.'}
                            </p>

                            <ul className="mt-6 space-y-3">
                                {perks.map((p, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-white/90">
                                        <CheckCircle2 className="size-4.5 shrink-0 text-emerald-300" />
                                        {p}
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-8 flex flex-wrap gap-4">
                                <Link
                                    href="/contact"
                                    className="group inline-flex items-center gap-2.5 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-primary shadow-lg transition-all hover:bg-white/90 hover:shadow-xl"
                                >
                                    <Sparkles className="size-4" />
                                    <span>{locale === 'ar' ? 'تواصل معنا الآن' : 'Get in Touch'}</span>
                                    <Arrow className="size-4 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                                </Link>
                                <a
                                    href="https://wa.me/218912345678"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2.5 rounded-xl border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                                >
                                    {locale === 'ar' ? 'واتساب' : 'WhatsApp'}
                                </a>
                            </div>
                        </div>

                        {/* Stats block */}
                        <div className="flex items-center">
                            <div className="grid w-full grid-cols-2 gap-4">
                                {[
                                    { num: '200+', label: locale === 'ar' ? 'شركة شريكة' : 'Partner Companies' },
                                    { num: '50+', label: locale === 'ar' ? 'خبير متخصص' : 'Subject Experts' },
                                    { num: '10+', label: locale === 'ar' ? 'سنوات خبرة' : 'Years Experience' },
                                    { num: '99%', label: locale === 'ar' ? 'رضا العملاء' : 'Client Satisfaction' },
                                ].map((s, i) => (
                                    <div
                                        key={i}
                                        className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
                                    >
                                        <p className="font-serif text-3xl font-extrabold text-white">{s.num}</p>
                                        <p className="mt-1 text-xs text-white/70">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
