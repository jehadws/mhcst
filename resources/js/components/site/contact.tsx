import { useState } from 'react'
import { Clock, Mail, MapPin, Phone, Send, Sparkles } from 'lucide-react'
import { useSite } from '@/context/site-context'
import { toast } from 'sonner'
import { router } from '@inertiajs/react'

export function Contact() {
    const { t, locale } = useSite()
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        router.post(route('contact.store'), form, {
            onSuccess: () => {
                toast.success(t.enroll.successTitle)
                setForm({ name: '', email: '', phone: '', subject: '', message: '' })
                setSubmitting(false)
            },
            onError: () => {
                toast.error('حدث خطأ، يرجى المحاولة لاحقاً')
                setSubmitting(false)
            },
        })
    }

    const cards = [
        { icon: MapPin, title: t.location.address, detail: t.location.addressLine, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
        { icon: Phone, title: t.location.phone, detail: '+218 91 234 5678', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
        { icon: Mail, title: t.location.email, detail: 'info@mset.ly', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
        { icon: Clock, title: t.location.hours, detail: t.location.hoursValue, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    ]

    return (
        <section id="contact" className="relative scroll-mt-20 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                        <Sparkles className="size-3.5" />
                        <span>{t.nav.contact}</span>
                    </span>
                    <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        {t.location.title}
                    </h2>
                    <p className="mt-3 text-muted-foreground">{t.location.subtitle}</p>
                </div>

                <div className="mt-12 grid gap-10 lg:grid-cols-12">
                    {/* Contact Info Cards */}
                    <div className="space-y-4 lg:col-span-5">
                        {cards.map((c, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-md"
                            >
                                <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${c.color}`}>
                                    <c.icon className="size-5" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-sm font-bold text-foreground">{c.title}</h3>
                                    <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{c.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xl sm:p-8 lg:col-span-7">
                        <h3 className="font-serif text-xl font-bold text-foreground">{t.enroll.title}</h3>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{t.enroll.subtitle}</p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="block text-xs font-semibold text-foreground mb-1.5">{t.enroll.name} *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-foreground mb-1.5">{t.enroll.phone} *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1.5">{t.enroll.email}</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-foreground mb-1.5">{t.enroll.message}</label>
                                <textarea
                                    rows={4}
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 disabled:opacity-50"
                            >
                                <Send className="size-4" />
                                <span>{submitting ? t.enroll.submitting : t.enroll.submit}</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}
