import { Award, BookOpenCheck, Clock, Headphones, ShieldCheck, Users } from 'lucide-react'
import { useSite } from '@/context/site-context'

export function FeaturesGrid() {
    const { locale } = useSite()

    const features = [
        {
            icon: ShieldCheck,
            title: locale === 'ar' ? 'اعتماد رسمي ومعترف به' : 'Officially Accredited',
            description: locale === 'ar' ? 'شهادات معتمدة محلياً ودولياً تمنحك ميزة تنافسية في سوق العمل.' : 'Certificates recognized by employers and professional bodies across the region.',
            badge: 'Accredited',
            color: 'from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400',
        },
        {
            icon: Users,
            title: locale === 'ar' ? 'مدربون من ذوي الخبرة' : 'Industry Expert Instructors',
            description: locale === 'ar' ? 'تعلّم مباشرة من خبراء يمارسون المهنة ويمتلكون سنوات طويلة من الخبرة.' : 'Learn directly from seasoned practitioners with years of real-world experience.',
            badge: 'Experts',
            color: 'from-purple-500/20 to-violet-500/20 text-purple-600 dark:text-purple-400',
        },
        {
            icon: BookOpenCheck,
            title: locale === 'ar' ? 'تطبيق عملي ومشاريع' : 'Hands-on Practical Projects',
            description: locale === 'ar' ? 'تركيز على التطبيق العملي وإنجاز مشاريع تضاف إلى معرض أعمالك.' : 'Focus on real-world practical projects to build a solid portfolio.',
            badge: 'Practical',
            color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400',
        },
        {
            icon: Clock,
            title: locale === 'ar' ? 'مرونة في المواعيد' : 'Flexible Learning Options',
            description: locale === 'ar' ? 'خيارات متنوعة للتعلم حضورياً أو عبر الإنترنت حسب وقتك وجدولك.' : 'Choose online, onsite, or hybrid classes that match your availability.',
            badge: 'Flexible',
            color: 'from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400',
        },
        {
            icon: Award,
            title: locale === 'ar' ? 'محتوى متجدد باستمرار' : 'Up-to-Date Curriculum',
            description: locale === 'ar' ? 'مناهج يتم تحديثها دورياً لتواكب أحدث التطورات والتكنولوجيا.' : 'Curriculum updated continuously to match the latest industry trends.',
            badge: 'Updated',
            color: 'from-pink-500/20 to-rose-500/20 text-pink-600 dark:text-pink-400',
        },
        {
            icon: Headphones,
            title: locale === 'ar' ? 'دعم ومتابعة مستمرة' : 'Dedicated Learning Support',
            description: locale === 'ar' ? 'فريق مستشارين لمساعدتك طوال فترة الدراسة وحتى الحصول على الشهادة.' : 'Advisors and mentors available to guide you from start to graduation.',
            badge: 'Support 24/7',
            color: 'from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400',
        },
    ]

    return (
        <section className="relative py-16 sm:py-24 bg-card/50 border-y border-border/60">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                        <ShieldCheck className="size-3.5" />
                        <span>{locale === 'ar' ? 'لماذا المعايير الحديثة؟' : 'Why Modern Standards?'}</span>
                    </span>
                    <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {locale === 'ar' ? 'كل ما تحتاجه للنجاح والتفوق المهني' : 'Everything You Need for Career Success'}
                    </h2>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((item, idx) => (
                        <div
                            key={idx}
                            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-inner`}>
                                    <item.icon className="size-6" />
                                </div>
                                <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-bold text-muted-foreground">
                                    {item.badge}
                                </span>
                            </div>

                            <h3 className="mt-5 font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                {item.title}
                            </h3>

                            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
