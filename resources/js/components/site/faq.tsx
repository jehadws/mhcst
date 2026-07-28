import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { faqs as defaultFaqs } from '@/data/i18n'
import { useSite } from '@/context/site-context'
import { cn } from '@/lib/utils'

export function Faq({ items }: { items?: any[] }) {
    const { t, tr } = useSite()
    const [openIdx, setOpenIdx] = useState<number | null>(0)

    const list = items && items.length > 0 ? items : defaultFaqs

    return (
        <section id="faq" className="relative scroll-mt-20 py-16 sm:py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                        <HelpCircle className="size-3.5" />
                        <span>{t.faq.title}</span>
                    </span>
                    <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {t.faq.subtitle}
                    </h2>
                </div>

                <div className="mt-10 space-y-3">
                    {list.map((item, idx) => {
                        const question = item.question || (item.q ? tr(item.q) : '')
                        const answer = item.answer || (item.a ? tr(item.a) : '')
                        const isOpen = openIdx === idx

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    'overflow-hidden rounded-2xl border transition-all duration-300',
                                    isOpen ? 'border-primary/50 bg-card shadow-md' : 'border-border/80 bg-card/60 hover:border-primary/30',
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                                    className="flex w-full items-center justify-between p-5 text-start font-serif font-bold text-foreground text-base sm:text-lg focus:outline-none"
                                >
                                    <span>{question}</span>
                                    <ChevronDown
                                        className={cn(
                                            'size-5 shrink-0 text-muted-foreground transition-transform duration-300',
                                            isOpen && 'rotate-180 text-primary',
                                        )}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="border-t border-border/60 px-5 pb-5 pt-3 text-xs sm:text-sm leading-relaxed text-muted-foreground animate-fade-in">
                                        <p>{answer}</p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
