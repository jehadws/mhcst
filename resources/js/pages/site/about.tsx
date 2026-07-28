import { Head } from '@inertiajs/react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { Stats } from '@/components/site/stats'
import { Testimonials } from '@/components/site/testimonials'
import { Contact } from '@/components/site/contact'
import { FloatingButtons } from '@/components/site/floating-buttons'
import { useSite } from '@/context/site-context'
import {
    Award,
    CheckCircle2,
    Eye,
    GraduationCap,
    Lightbulb,
    ShieldCheck,
    Sparkles,
    Target,
    Users,
} from 'lucide-react'

interface Props {
    testimonials?: any[]
}

export default function PublicAboutPage({ testimonials }: Props) {
    const { t, locale } = useSite()

    const mission = {
        title: locale === 'ar' ? 'رسالتنا' : 'Our Mission',
        icon: Target,
        color: 'from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400',
        body:
            locale === 'ar'
                ? 'تقديم برامج تدريبية احترافية معتمدة تُمكّن الأفراد والمؤسسات من تطوير مهاراتهم والارتقاء بأدائهم المهني في بيئة تعليمية تفاعلية ومتطورة.'
                : 'To deliver accredited professional training programmes that empower individuals and organisations to develop their skills and elevate their professional performance in an interactive, world-class learning environment.',
    }

    const vision = {
        title: locale === 'ar' ? 'رؤيتنا' : 'Our Vision',
        icon: Eye,
        color: 'from-purple-500/20 to-violet-500/20 text-purple-600 dark:text-purple-400',
        body:
            locale === 'ar'
                ? 'أن نكون المرجع الأول في التدريب المهني المعتمد في ليبيا والمنطقة، ومنصة متكاملة تصنع جيلاً من القادة والمتخصصين القادرين على قيادة التحول والتنمية.'
                : 'To be the premier reference for accredited professional training in Libya and the region — a complete platform that produces a generation of leaders and specialists capable of driving transformation and development.',
    }

    const message = {
        title: locale === 'ar' ? 'رسالة الإدارة' : 'Message from Leadership',
        icon: Lightbulb,
        color: 'from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400',
        body:
            locale === 'ar'
                ? 'انطلقنا بحلم بسيط: أن يجد كل متعلم في ليبيا تدريباً احترافياً يثق به ويحصل من خلاله على شهادة تُغيّر مساره المهني. اليوم، نحمل هذا الحلم بكل جدية ونواصل رحلتنا مع كل متدرب يؤمن بأن المعرفة هي أقوى سلاح للنجاح.'
                : 'We started with a simple dream: that every learner in Libya finds professional training they can trust, earning a certificate that transforms their career. Today, we carry that dream with full dedication and continue our journey with every trainee who believes that knowledge is the most powerful tool for success.',
    }

    const values = [
        {
            icon: ShieldCheck,
            title: locale === 'ar' ? 'الاعتماد والجودة' : 'Accreditation & Quality',
            body: locale === 'ar' ? 'شهاداتنا معتمدة ومعترف بها إقليمياً ودولياً' : 'Our certificates are regionally and internationally recognized',
        },
        {
            icon: Users,
            title: locale === 'ar' ? 'مدربون من الخبراء' : 'Expert Instructors',
            body: locale === 'ar' ? 'نخبة من الممارسين الحقيقيين في مجالاتهم' : 'A select group of real-world practitioners in their fields',
        },
        {
            icon: GraduationCap,
            title: locale === 'ar' ? 'مرونة التعلم' : 'Flexible Learning',
            body: locale === 'ar' ? 'حضوري وعبر الإنترنت ومدمج حسب جدولك' : 'Onsite, online, and blended to fit your schedule',
        },
        {
            icon: Award,
            title: locale === 'ar' ? 'التطبيق العملي' : 'Practical Application',
            body: locale === 'ar' ? 'تعلّم نظرياً وطبّق فعلياً على مشاريع حقيقية' : 'Theory and hands-on real projects for your portfolio',
        },
    ]

    const milestones = [
        { year: '2013', label: locale === 'ar' ? 'التأسيس' : 'Founded' },
        { year: '2016', label: locale === 'ar' ? 'أول اعتماد دولي' : 'First Int\'l Accreditation' },
        { year: '2019', label: locale === 'ar' ? '5000+ خريج' : '5,000+ Graduates' },
        { year: '2023', label: locale === 'ar' ? 'توسّع رقمي' : 'Digital Expansion' },
        { year: '2025', label: locale === 'ar' ? '20,000+ متدرب' : '20,000+ Learners' },
    ]

    const pillars = [mission, vision, message]

    return (
        <>
            <Head title={`${t.nav.about} | ${t.brandShort}`} />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">

                    {/* ─── Hero Banner ─── */}
                    <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-indigo-500/5 py-20 sm:py-24">
                        <div className="pointer-events-none absolute inset-0 -z-10">
                            <div className="absolute -top-20 start-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
                        </div>
                        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                                <Sparkles className="size-3.5" />
                                <span>{t.nav.about}</span>
                            </span>
                            <h1 className="mt-5 font-serif text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                                {locale === 'ar' ? 'قصتنا ورحلتنا' : 'Our Story & Journey'}
                            </h1>
                            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                {locale === 'ar'
                                    ? 'أكثر من عقد من الخبرة في بناء مهارات المهنيين وتطوير المؤسسات عبر برامج تدريبية معتمدة ومُصمَّمة لتحقيق الأثر الحقيقي.'
                                    : 'Over a decade of experience building professional skills and developing organisations through accredited training designed for real-world impact.'}
                            </p>
                        </div>
                    </div>

                    {/* ─── Stats ─── */}
                    <div className="py-2">
                        <Stats />
                    </div>

                    {/* ─── Mission / Vision / Message ─── */}
                    <section className="py-16 sm:py-24">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mx-auto max-w-2xl text-center mb-12">
                                <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                    {locale === 'ar' ? 'من نحن — رسالتنا ورؤيتنا' : 'Who We Are — Mission & Vision'}
                                </h2>
                            </div>
                            <div className="grid gap-6 lg:grid-cols-3">
                                {pillars.map((p, i) => (
                                    <div
                                        key={i}
                                        className="group flex flex-col gap-5 rounded-3xl border border-border/80 bg-card p-8 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
                                    >
                                        <div className={`flex size-13 items-center justify-center rounded-2xl bg-gradient-to-br ${p.color} shadow-inner`}>
                                            <p.icon className="size-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                                                {p.title}
                                            </h3>
                                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ─── Story / Image + Values ─── */}
                    <section className="relative py-16 sm:py-24 bg-card/40 border-y border-border/60">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                                {/* Image */}
                                <div className="relative mx-auto max-w-lg lg:max-w-none">
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border/80 bg-card p-2 shadow-2xl">
                                        <img
                                            src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop"
                                            alt={t.about.title}
                                            className="h-full w-full rounded-2xl object-cover"
                                        />
                                    </div>
                                    {/* Experience badge */}
                                    <div className="absolute -bottom-5 -end-5 rounded-2xl border border-border/80 bg-card p-5 shadow-xl backdrop-blur-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-serif text-xl font-extrabold">
                                                +10
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground text-sm">
                                                    {locale === 'ar' ? 'سنوات من التميز' : 'Years of Excellence'}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {locale === 'ar' ? 'في التعليم والتطوير المهني' : 'In professional training'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Values */}
                                <div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                                        <ShieldCheck className="size-3.5" />
                                        <span>{locale === 'ar' ? 'قيمنا الجوهرية' : 'Our Core Values'}</span>
                                    </span>
                                    <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                        {t.about.title}
                                    </h2>
                                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{t.about.body}</p>

                                    <div className="mt-8 space-y-4">
                                        {values.map((v, i) => (
                                            <div
                                                key={i}
                                                className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-4 transition-all duration-300 hover:border-primary/40 hover:shadow-md"
                                            >
                                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                    <v.icon className="size-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-serif text-base font-bold text-foreground">{v.title}</h3>
                                                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{v.body}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ─── Timeline / Milestones ─── */}
                    <section className="py-16 sm:py-24">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="text-center mb-12">
                                <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                    {locale === 'ar' ? 'محطات مسيرتنا' : 'Our Milestones'}
                                </h2>
                            </div>
                            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-stretch sm:justify-between">
                                {/* Connector line */}
                                <div className="absolute start-6 top-0 hidden h-full w-0.5 bg-border/80 sm:block sm:start-auto sm:top-8 sm:h-0.5 sm:w-full" />
                                {milestones.map((m, i) => (
                                    <div key={i} className="relative flex items-start gap-4 sm:flex-col sm:items-center sm:text-center sm:flex-1">
                                        <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card font-serif text-xs font-extrabold text-primary shadow-md sm:z-10">
                                            {m.year}
                                        </div>
                                        <div className="sm:mt-2">
                                            <p className="font-semibold text-foreground text-sm">{m.label}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* ─── Testimonials ─── */}
                    <Testimonials items={testimonials} />

                    {/* ─── Contact CTA at end ─── */}
                    <Contact />

                </main>
                <SiteFooter />
                <FloatingButtons />
            </div>
        </>
    )
}
