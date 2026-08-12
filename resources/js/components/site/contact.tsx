import { useState } from 'react'
import { Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import { SectionHeader } from '@/components/site/section-header'
import { useSite } from '@/context/site-context'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { toast } from 'sonner'
import { router } from '@inertiajs/react'

export function Contact() {
    const { t } = useSite()
    const settings = useSiteSettings()
    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    })

    const contactEmail = settings.contact_email || 'info@mset.ly'
    const contactPhone = settings.contact_phone || '+218 91 234 5678'
    const address = settings.address || t.location.addressLine

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
        { icon: MapPin, title: t.location.address, detail: address },
        { icon: Phone, title: t.location.phone, detail: contactPhone },
        { icon: Mail, title: t.location.email, detail: contactEmail },
        { icon: Clock, title: t.location.hours, detail: t.location.hoursValue },
    ]

    return (
        <section id="contact" className="scroll-mt-20 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeader label={t.nav.contact} title={t.location.title} description={t.location.subtitle} />

                <div className="mt-12 grid gap-10 lg:grid-cols-12">
                    <div className="space-y-3 lg:col-span-5">
                        {cards.map((c, idx) => (
                            <div key={idx} className="flex items-start gap-4 rounded-xl border border-border/80 bg-card p-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    <c.icon className="size-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                                    <p className="mt-0.5 text-sm text-muted-foreground">{c.detail}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="rounded-2xl border border-border/80 bg-card p-6 sm:p-8 lg:col-span-7">
                        <h3 className="font-serif text-xl font-bold text-foreground">{t.enroll.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">{t.enroll.subtitle}</p>

                        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-foreground">{t.enroll.name} *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold text-foreground">{t.enroll.phone} *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-foreground">{t.enroll.email}</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold text-foreground">{t.enroll.message}</label>
                                <textarea
                                    rows={4}
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
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
