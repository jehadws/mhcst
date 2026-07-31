import { Link } from '@inertiajs/react'
import { Facebook, GraduationCap, Instagram, Linkedin, MessageCircle, Twitter } from 'lucide-react'
import { useSite } from '@/context/site-context'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { NewsletterForm } from './newsletter-form'

export function SiteFooter() {
    const { t, tr, locale } = useSite()
    const settings = useSiteSettings()

    const brandName = settings.site_name || t.brandShort
    const contactPhone = settings.contact_phone || '+218 91 234 5678'
    const contactEmail = settings.contact_email || 'info@mset.ly'
    const address = settings.address || t.location.addressLine
    const whatsapp = settings.whatsapp_number || '218912345678'
    const socialLinks = settings.social_links || {}

    const navLinks = [
        { href: '/courses', label: t.nav.courses },
        { href: '/about', label: t.nav.about },
        { href: '/blog-posts', label: locale === 'ar' ? 'المدونة' : 'Blog' },
        { href: '/faq', label: t.nav.faq },
        { href: '/contact', label: t.nav.contact },
    ]

    const legalLinks = [
        { href: '/verify-certificate', label: locale === 'ar' ? 'التحقق من الشهادة' : 'Verify Certificate' },
        { href: '/privacy-policy', label: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy' },
        { href: '/terms-of-use', label: locale === 'ar' ? 'الشروط والأحكام' : 'Terms of Use' },
    ]

    const socials = [
        { href: socialLinks.facebook || 'https://facebook.com', icon: Facebook, label: 'Facebook' },
        { href: socialLinks.instagram || 'https://instagram.com', icon: Instagram, label: 'Instagram' },
        { href: socialLinks.linkedin || 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
        { href: socialLinks.twitter || 'https://twitter.com', icon: Twitter, label: 'X / Twitter' },
    ]

    return (
        <footer className="border-t border-border bg-card">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                                <GraduationCap className="size-5" />
                            </span>
                            <span className="flex flex-col leading-none">
                                <span className="font-serif text-base font-bold">{brandName}</span>
                                <span className="text-[11px] text-muted-foreground">
                                    {locale === 'en' ? 'Education & Training' : 'للتعليم والتدريب'}
                                </span>
                            </span>
                        </Link>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">{t.footer.tagline}</p>

                        {/* Social Icons */}
                        <div className="mt-5 flex items-center gap-2">
                            {socials.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label}
                                    className="flex size-9 items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
                                >
                                    <s.icon className="size-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-serif text-sm font-bold text-foreground">{t.newsletter.title}</h3>
                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{t.newsletter.subtitle}</p>
                        <div className="mt-4">
                            <NewsletterForm compact />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-serif text-sm font-bold text-foreground">{t.footer.quickLinks}</h3>
                        <ul className="mt-4 space-y-2.5">
                            {navLinks.map((l) => (
                                <li key={l.href}>
                                    <Link
                                        href={l.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                                    >
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-serif text-sm font-bold text-foreground">{t.footer.contact}</h3>
                        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                            <li>{address}</li>
                            <li dir="ltr" className={locale === 'ar' ? 'text-end' : ''}>{contactPhone}</li>
                            <li dir="ltr" className={locale === 'ar' ? 'text-end' : ''}>{contactEmail}</li>
                            <li className="text-xs">{t.location.hoursValue}</li>
                            <li className="pt-1">
                                <a
                                    href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-600 transition-all hover:bg-emerald-500/20 dark:text-emerald-400"
                                >
                                    <MessageCircle className="size-3.5" />
                                    {t.location.whatsapp}
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-serif text-sm font-bold text-foreground">
                            {locale === 'ar' ? 'القانوني' : 'Legal'}
                        </h3>
                        <ul className="mt-4 space-y-2.5">
                            {legalLinks.map((l) => (
                                <li key={l.href}>
                                    <Link
                                        href={l.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-primary"
                                    >
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Accreditation Badge */}
                        <div className="mt-6 rounded-xl border border-border/80 bg-background p-3">
                            <p className="text-[11px] font-semibold text-foreground mb-1">
                                {locale === 'ar' ? 'جهة تدريب معتمدة' : 'Accredited Training Provider'}
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                {locale === 'ar'
                                    ? 'معتمدون من الجهات المهنية الإقليمية والدولية'
                                    : 'Recognized by regional & international professional bodies'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-border">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
                    <p>
                        {settings.footer_text || (
                            <>
                                © {new Date().getFullYear()}{' '}
                                {tr({ en: 'Modern Standards for Education & Training', ar: 'المعايير الحديثة للتعليم والتدريب' })}.{' '}
                                {t.footer.rights}
                            </>
                        )}
                    </p>
                    <div className="flex items-center gap-4">
                        {legalLinks.map((l) => (
                            <Link key={l.href} href={l.href} className="transition-colors hover:text-foreground">
                                {l.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
