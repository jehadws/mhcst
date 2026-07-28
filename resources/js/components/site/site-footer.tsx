import { Link } from '@inertiajs/react'
import { Facebook, GraduationCap, Instagram, Linkedin, MessageCircle, Twitter } from 'lucide-react'
import { useSite } from '@/context/site-context'

export function SiteFooter() {
    const { t, tr, locale } = useSite()

    const navLinks = [
        { href: '/courses', label: t.nav.courses },
        { href: '/about', label: t.nav.about },
        { href: '/blog', label: locale === 'ar' ? 'المدونة' : 'Blog' },
        { href: '/faq', label: t.nav.faq },
        { href: '/contact', label: t.nav.contact },
    ]

    const legalLinks = [
        { href: '/privacy', label: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy' },
        { href: '/terms', label: locale === 'ar' ? 'الشروط والأحكام' : 'Terms of Use' },
    ]

    const socials = [
        { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
        { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
        { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
        { href: 'https://twitter.com', icon: Twitter, label: 'X / Twitter' },
    ]

    return (
        <footer className="border-t border-border bg-card">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="sm:col-span-2 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
                                <GraduationCap className="size-5" />
                            </span>
                            <span className="flex flex-col leading-none">
                                <span className="font-serif text-base font-bold">{t.brandShort}</span>
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
                            <li>{t.location.addressLine}</li>
                            <li dir="ltr" className={locale === 'ar' ? 'text-end' : ''}>+218 91 234 5678</li>
                            <li dir="ltr" className={locale === 'ar' ? 'text-end' : ''}>info@mset.ly</li>
                            <li className="text-xs">{t.location.hoursValue}</li>
                            <li className="pt-1">
                                <a
                                    href="https://wa.me/218912345678"
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
                        © {new Date().getFullYear()}{' '}
                        {tr({ en: 'Modern Standards for Education & Training', ar: 'المعايير الحديثة للتعليم والتدريب' })}.{' '}
                        {t.footer.rights}
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
