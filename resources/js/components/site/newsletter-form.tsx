import { useState } from 'react'
import { CheckCircle2, Mail, Send } from 'lucide-react'
import { useSite } from '@/context/site-context'
import { toast } from 'sonner'
import { router } from '@inertiajs/react'

interface Props {
    compact?: boolean
}

export function NewsletterForm({ compact = false }: Props) {
    const { t } = useSite()
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [done, setDone] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) {
            toast.error(t.newsletter.invalidEmail)
            return
        }
        setSubmitting(true)

        router.post(route('newsletter.subscribe'), { email, name }, {
            onSuccess: () => {
                setDone(true)
                setSubmitting(false)
                toast.success(t.newsletter.success)
            },
            onError: () => {
                setSubmitting(false)
                toast.error(t.newsletter.error)
            },
        })
    }

    if (done) {
        return (
            <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm'}`}>
                <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">{t.newsletter.success}</span>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Mail className="size-4 shrink-0 text-muted-foreground" />
                <input
                    type="email"
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.newsletter.emailPlaceholder}
                    aria-label={t.newsletter.emailPlaceholder}
                    className="h-10 w-full bg-transparent text-sm outline-none"
                />
            </div>
            {!compact && (
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.newsletter.namePlaceholder}
                    aria-label={t.newsletter.namePlaceholder}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
                />
            )}
            <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                <Send className="size-4" />
                {submitting ? t.newsletter.subscribing : t.newsletter.subscribe}
            </button>
        </form>
    )
}
