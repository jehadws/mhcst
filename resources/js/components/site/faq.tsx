import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { faqs as defaultFaqs } from '@/data/i18n'
import { SectionHeader } from '@/components/site/section-header'
import { useSite } from '@/context/site-context'
import { cn } from '@/lib/utils'

export function Faq({ items }: { items?: any[] }) {
    const { t, tr } = useSite()
    const [openIdx, setOpenIdx] = useState<number | null>(0)

    const list = items && items.length > 0 ? items : defaultFaqs

    return (
        <section id="faq" className="bg-secondary scroll-mt-20 py-20 sm:py-28">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <SectionHeader label={t.faq.title} title={t.faq.subtitle} />

                <div className="mt-10 space-y-2">
                    {list.map((item, idx) => {
                        const question = item.question || (item.q ? tr(item.q) : '')
                        const answer = item.answer || (item.a ? tr(item.a) : '')
                        const isOpen = openIdx === idx

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    'overflow-hidden rounded-xl border transition-colors',
                                    isOpen ? 'border-primary/30 bg-card' : 'border-border/80 bg-card/60',
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                                    className="flex w-full items-center justify-between gap-4 p-5 text-start text-base font-semibold text-foreground focus:outline-none sm:text-lg"
                                >
                                    <span>{question}</span>
                                    <ChevronDown
                                        className={cn(
                                            'size-5 shrink-0 text-muted-foreground transition-transform duration-200',
                                            isOpen && 'rotate-180 text-primary',
                                        )}
                                    />
                                </button>

                                {isOpen && (
                                    <div className="border-t border-border/60 px-5 pb-5 pt-3 text-sm leading-relaxed text-muted-foreground">
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
