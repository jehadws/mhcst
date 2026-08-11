import { useState } from 'react'
import { router } from '@inertiajs/react'
import { toast } from 'sonner'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { SeoHead } from '@/components/seo-head'
import { Faq } from '@/components/site/faq'
import { FloatingButtons } from '@/components/site/floating-buttons'
import { useSite } from '@/context/site-context'
import { useSiteSettings } from '@/hooks/use-site-settings'
import {
    ArrowRight,
    Building2,
    Mail,
    MapPin,
    MessageCircle,
    Phone,
    Send,
} from 'lucide-react'

interface FaqItem {
    question: string
    answer: string
}

interface Props {
    courses?: Array<{ id: number; title_ar: string; title_en?: string; slug: string }>
    faqs?: FaqItem[]
}

export default function PublicContactPage({ courses = [], faqs = [] }: Props) {
    const { t, locale } = useSite()
    const settings = useSiteSettings()

    const contactPhone = settings.contact_phone || '+218 91 234 5678'
    const contactEmail = settings.contact_email || 'info@mhcst.ly'
    const address = settings.address || (locale === 'ar' ? 'طرابلس، ليبيا' : 'Tripoli, Libya')

    const [submitting, setSubmitting] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })

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
                toast.error(locale === 'ar' ? 'حدث خطأ، يرجى المحاولة لاحقاً' : 'Something went wrong, please try again.')
                setSubmitting(false)
            },
        })
    }

    const isRtl = locale === 'ar'

    return (
        <>
            <SeoHead
                title={t.nav.contact}
                description={
                    isRtl
                        ? 'تواصل مع المعهد الحديث العالي للعلوم والتكنولوجيا - احصل على استشارة مجانية حول دوراتنا التدريبية'
                        : 'Contact the Modern Higher Institute for Science & Technology for a free consultation about our training courses'
                }
            />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">

                    {/* ── Hero Split Section ───────────────────────────────────── */}
                    <section className="relative bg-[#f0f4f8] dark:bg-muted/40">
                        <div className="mx-auto max-w-7xl">
                            <div className="grid min-h-[680px] lg:grid-cols-2">

                                {/* Left: Image + Info */}
                                <div className={`relative flex flex-col ${isRtl ? 'lg:order-2' : 'lg:order-1'}`}>
                                    {/* Building image */}
                                    <div className="relative h-72 overflow-hidden lg:h-[420px]">
                                        <img
                                            src="/contact-hero.png"
                                            alt={isRtl ? 'مبنى المعهد' : 'Institute Building'}
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#f0f4f8] dark:to-muted/40" />
                                    </div>

                                    {/* Info block below image */}
                                    <div className="flex flex-1 flex-col justify-center px-8 pb-12 pt-6 lg:px-12">
                                        <span className="mb-3 inline-flex w-fit items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                                            {isRtl ? 'تواصل معنا' : 'Reach Out To Us'}
                                        </span>

                                        <h1 className="font-serif text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
                                            {isRtl
                                                ? <>نسعد بالتواصل<br />معك.</>
                                                : <>We'd Love to<br />Hear From You.</>}
                                        </h1>

                                        <p className="mt-3 text-sm text-muted-foreground">
                                            {isRtl ? 'أو تواصل مباشرة عبر ' : 'Or just reach out manually to '}
                                            <a href={`mailto:${contactEmail}`} className="font-medium text-primary hover:underline" dir="ltr">
                                                {contactEmail}
                                            </a>
                                        </p>

                                        {/* Contact cards */}
                                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                                            <ContactCard
                                                icon={Mail}
                                                color="bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                title={isRtl ? 'الدعم عبر البريد' : 'Email Support'}
                                                subtitle={isRtl ? 'يمكن لفريقنا الرد في الوقت الفعلي.' : 'Our team can respond in real time.'}
                                                link={`mailto:${contactEmail}`}
                                                linkLabel={contactEmail}
                                            />
                                            <ContactCard
                                                icon={Building2}
                                                color="bg-violet-500/10 text-violet-600 dark:text-violet-400"
                                                title={isRtl ? 'زيارة مقرنا' : 'Visit Our Office'}
                                                subtitle={isRtl ? 'قم بزيارة موقعنا شخصياً.' : 'Visit our location in real life.'}
                                                link={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                                                linkLabel={address}
                                                isExternal
                                            />
                                            <ContactCard
                                                icon={Phone}
                                                color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                title={isRtl ? 'اتصل بنا مباشرة' : 'Call Us Directly'}
                                                subtitle={isRtl ? 'متاح خلال ساعات العمل.' : 'Available during working hours.'}
                                                link={`tel:${contactPhone}`}
                                                linkLabel={contactPhone}
                                            />
                                            <ContactCard
                                                icon={MessageCircle}
                                                color="bg-green-500/10 text-green-600 dark:text-green-400"
                                                title={isRtl ? 'واتساب' : 'WhatsApp'}
                                                subtitle={isRtl ? 'راسلنا على واتساب مباشرة.' : 'Message us directly on WhatsApp.'}
                                                link={`https://wa.me/${(settings.whatsapp_number || contactPhone).replace(/\D/g, '')}`}
                                                linkLabel={isRtl ? 'ابدأ المحادثة' : 'Start a chat'}
                                                isExternal
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Form card */}
                                <div className={`flex items-center justify-center px-6 py-12 lg:px-10 ${isRtl ? 'lg:order-1' : 'lg:order-2'}`}>
                                    <div className="w-full max-w-lg rounded-3xl border border-border/80 bg-white/90 p-8 shadow-2xl shadow-black/5 backdrop-blur-sm dark:bg-card sm:p-10">
                                        <div className="mb-6">
                                            <h2 className="font-serif text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                                                {isRtl ? 'لنبدأ التواصل.' : "Let's Get In Touch."}
                                            </h2>
                                            <p className="mt-1.5 text-sm text-muted-foreground">
                                                {isRtl ? 'أو تواصل مباشرة عبر ' : 'Or just reach out manually to '}
                                                <a href={`mailto:${contactEmail}`} className="font-medium text-primary hover:underline" dir="ltr">
                                                    {contactEmail}
                                                </a>
                                            </p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            {/* Name row */}
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <FormField
                                                    label={isRtl ? 'الاسم الأول' : 'First Name'}
                                                    placeholder={isRtl ? 'أدخل الاسم الأول...' : 'Enter your first name...'}
                                                    value={form.name.split(' ')[0] || ''}
                                                    onChange={(v) => setForm({ ...form, name: v + ' ' + (form.name.split(' ').slice(1).join(' ') || '') })}
                                                    icon={<UserIcon />}
                                                />
                                                <FormField
                                                    label={isRtl ? 'اسم العائلة' : 'Last Name'}
                                                    placeholder={isRtl ? 'أدخل اسم العائلة...' : 'Enter your last name...'}
                                                    value={form.name.split(' ').slice(1).join(' ') || ''}
                                                    onChange={(v) => setForm({ ...form, name: (form.name.split(' ')[0] || '') + ' ' + v })}
                                                    icon={<UserIcon />}
                                                />
                                            </div>

                                            {/* Email */}
                                            <FormField
                                                label={isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                                                type="email"
                                                placeholder={isRtl ? 'أدخل بريدك الإلكتروني...' : 'Enter your email address...'}
                                                value={form.email}
                                                onChange={(v) => setForm({ ...form, email: v })}
                                                icon={<MailIcon />}
                                                dir="ltr"
                                            />

                                            {/* Phone */}
                                            <FormField
                                                label={isRtl ? 'رقم الهاتف' : 'Phone Number'}
                                                type="tel"
                                                placeholder={isRtl ? '+218 (000) 000-0000' : '+44 (000) 000-0000'}
                                                value={form.phone}
                                                onChange={(v) => setForm({ ...form, phone: v })}
                                                icon={<PhoneIcon />}
                                                dir="ltr"
                                            />

                                            {/* Message */}
                                            <div>
                                                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                                                    {isRtl ? 'الرسالة' : 'Message'}
                                                </label>
                                                <div className="relative">
                                                    <textarea
                                                        rows={5}
                                                        maxLength={500}
                                                        value={form.message}
                                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                                        placeholder={isRtl ? 'اكتب رسالتك هنا...' : 'Enter your main text here...'}
                                                        className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                                    />
                                                    <span className="absolute bottom-2.5 end-3 text-[10px] text-muted-foreground/50">
                                                        {form.message.length}/500
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Submit */}
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-60"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <Send className="size-4 animate-pulse" />
                                                        {t.enroll.submitting}
                                                    </>
                                                ) : (
                                                    <>
                                                        {isRtl ? 'إرسال الرسالة' : 'Submit Form'}
                                                        <ArrowRight className={`size-4 ${isRtl ? 'rotate-180' : ''}`} />
                                                    </>
                                                )}
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>



                    {/* ── Map ─────────────────────────────────────────────────── */}
                    <section className="border-t border-border/60 bg-muted/30 py-16 sm:py-20">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-8 text-center">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                                    <MapPin className="size-3.5" />
                                    <span>{isRtl ? 'موقعنا' : 'Our Location'}</span>
                                </span>
                                <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    {isRtl ? 'تجدنا هنا' : 'Find Us Here'}
                                </h2>
                                <p className="mt-2 text-sm text-muted-foreground">{address}</p>
                            </div>

                            <div className="overflow-hidden rounded-3xl border border-border/80 shadow-xl">
                                <iframe
                                    src="https://www.openstreetmap.org/export/embed.html?bbox=13.1,32.8,13.3,32.95&layer=mapnik&marker=32.8872,13.1913"
                                    width="100%"
                                    height="420"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    title={isRtl ? 'موقع المعهد' : 'Institute Location'}
                                    className="block w-full"
                                />
                            </div>
                        </div>
                    </section>

                    {/* ── FAQ ─────────────────────────────────────────────────── */}
                    <section className="border-t border-border/60 bg-background">
                        <Faq items={faqs} />
                    </section>

                </main>
                <SiteFooter />
                <FloatingButtons />
            </div>
        </>
    )
}

/* ── Sub-components ─────────────────────────────────────────────────────────── */

interface ContactCardProps {
    icon: React.ElementType
    color: string
    title: string
    subtitle: string
    link: string
    linkLabel: string
    isExternal?: boolean
}

function ContactCard({ icon: Icon, color, title, subtitle, link, linkLabel, isExternal }: ContactCardProps) {
    return (
        <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-white/80 p-4 shadow-xs backdrop-blur-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md dark:bg-card/60">
            <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
                <Icon className="size-4" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold text-foreground">{title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
                <a
                    href={link}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    className="mt-1 block truncate text-[11px] font-semibold text-primary hover:underline"
                    dir="ltr"
                >
                    {linkLabel}
                </a>
            </div>
        </div>
    )
}

interface FormFieldProps {
    label: string
    type?: string
    placeholder: string
    value: string
    onChange: (v: string) => void
    icon?: React.ReactNode
    dir?: string
}

function FormField({ label, type = 'text', placeholder, value, onChange, icon, dir }: FormFieldProps) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">{label}</label>
            <div className="relative">
                {icon && (
                    <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                        {icon}
                    </span>
                )}
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    dir={dir}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background py-2.5 pe-4 ps-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
            </div>
        </div>
    )
}

/* Tiny SVG icons as components */
function UserIcon() {
    return (
        <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
    )
}
function MailIcon() {
    return (
        <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
    )
}
function PhoneIcon() {
    return (
        <svg className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 6.75Z" />
        </svg>
    )
}
