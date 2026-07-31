import { useEffect, useState } from 'react'
import { Link } from '@inertiajs/react'
import { Globe, GraduationCap, Menu, Moon, Sun, X } from 'lucide-react'
import { useSite } from '@/context/site-context'
import { useSiteSettings } from '@/hooks/use-site-settings'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'

export function SiteHeader() {
    const { t, theme, toggleTheme, toggleLocale, locale } = useSite()
    const settings = useSiteSettings()
    const [open, setOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8)
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const links = [
        { href: '/courses', label: t.nav.courses },
        { href: '/student/portal', label: locale === 'ar' ? 'بوابة المتدربين' : 'Learner Portal' },
        { href: '/blog-posts', label: locale === 'ar' ? 'المدونة' : 'Blog' },
        { href: '/about', label: t.nav.about },
        { href: '/contact', label: t.nav.contact },
    ]

    return (
        <header
            className={cn(
                'sticky top-0 z-50 w-full border-b transition-all duration-300',
                scrolled ? 'border-border bg-background/85 shadow-sm backdrop-blur-md' : 'border-transparent bg-background',
            )}
        >
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
                <Link href="/" className="flex items-center gap-2.5 focus:outline-none">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                        <GraduationCap className="size-5" />
                    </span>
                    <span className="flex flex-col leading-none">
                        <span className="font-serif text-base font-semibold tracking-tight">{settings.site_name || t.brandShort}</span>
                        <span className="text-[11px] text-muted-foreground">
                            {locale === 'en' ? 'Education & Training' : 'للتعليم والتدريب'}
                        </span>
                    </span>
                </Link>

                <nav className="hidden items-center gap-1 md:flex">
                    {links.map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                            {l.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-1.5">
                    <Button
                        type="button"
                        size={"default"}
                        variant={"ghost"}
                        onClick={toggleLocale}
                        aria-label="Toggle language"
                    >
                        <Globe className="size-4" />
                        <span className="text-xs font-semibold">{locale === 'en' ? 'AR' : 'EN'}</span>
                    </Button>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label={theme === 'dark' ? t.theme.light : t.theme.dark}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                        {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    </button>
                    <Link
                        href="/contact"
                        className="hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 sm:inline-flex"
                    >
                        {t.nav.enroll}
                    </Link>
                    <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
                        onClick={() => setOpen((v) => !v)}
                        aria-label="Toggle menu"
                        aria-expanded={open}
                    >
                        {open ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            {open && (
                <div className="border-t border-border bg-background md:hidden">
                    <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
                        {links.map((l) => (
                            <Link
                                key={l.href}
                                href={l.href}
                                onClick={() => setOpen(false)}
                                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                            >
                                {l.label}
                            </Link>
                        ))}
                        <Link
                            href="/contact"
                            onClick={() => setOpen(false)}
                            className="mt-2 rounded-md bg-primary px-4 py-2.5 text-center text-sm font-medium text-primary-foreground"
                        >
                            {t.nav.enroll}
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    )
}
