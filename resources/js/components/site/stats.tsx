import { Award, BookOpen, GraduationCap, Users } from 'lucide-react'
import { useSite } from '@/context/site-context'

export function Stats() {
    const { t, locale } = useSite()

    const items = [
        { icon: Users, stat: '50+', label: t.stats.experts, color: 'from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400' },
        { icon: BookOpen, stat: '120+', label: t.stats.courses, color: 'from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400' },
        { icon: GraduationCap, stat: '20,000+', label: t.stats.learners, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400' },
        { icon: Award, stat: '99%', label: t.stats.satisfaction, color: 'from-purple-500/20 to-violet-500/20 text-purple-600 dark:text-purple-400' },
    ]

    return (
        <section className="relative py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-inner`}>
                                    <item.icon className="size-6" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground group-hover:text-primary transition-colors">
                                        {item.stat}
                                    </h3>
                                    <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">{item.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
