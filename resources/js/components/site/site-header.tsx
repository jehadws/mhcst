import { useSite } from '@/context/site-context';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { Globe, Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

export function SiteHeader() {
  const { t, theme, toggleTheme, toggleLocale, locale } = useSite();
  const settings = useSiteSettings();
  const { url } = usePage();
  const logoUrl = settings?.site_logo ? `/storage/${settings.site_logo}` : '/logo.png';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '/departments', label: locale === 'ar' ? 'الأقسام الأكاديمية' : 'Departments' },
    { href: '/blog-posts', label: locale === 'ar' ? 'الأخبار والإعلانات' : 'News' },
    { href: '/about', label: t.nav.about },
    { href: '/faq', label: t.nav.faq },
    { href: '/contact', label: t.nav.contact },
  ];

  const isActive = (href: string) => url === href || url.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 w-full border-b transition-all duration-300',
        scrolled
          ? 'border-hero-foreground/10 bg-hero/75 shadow-lg backdrop-blur-xl'
          : 'border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 focus:outline-none">
          <img src={logoUrl} alt={settings?.site_name || t.brandShort} className="size-9 rounded-lg object-cover" />
          <span className="text-hero-foreground flex flex-col leading-none">
            <span className="font-serif text-base font-semibold tracking-tight">{settings.site_name || t.brandShort}</span>
            <span className="text-hero-muted text-[11px]">{locale === 'en' ? 'Education & Training' : 'للعلوم والتقنية'}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive(l.href)
                  ? 'bg-hero-foreground/10 text-hero-accent'
                  : 'text-hero-foreground/75 hover:bg-hero-foreground/10 hover:text-hero-foreground',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="default"
            variant="ghost"
            onClick={toggleLocale}
            aria-label="Toggle language"
            className="text-hero-foreground/75 hover:bg-hero-foreground/10 hover:text-hero-foreground"
          >
            <Globe className="size-4" />
            <span className="text-xs font-semibold">{locale === 'en' ? 'AR' : 'EN'}</span>
          </Button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t.theme.light : t.theme.dark}
            className="text-hero-foreground/75 hover:bg-hero-foreground/10 hover:text-hero-foreground inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <Link
            href="/contact"
            className="bg-hero-accent text-hero-accent-foreground hover:bg-hero-accent/85 ms-1 hidden rounded-full px-5 py-2.5 text-sm font-bold transition-colors sm:inline-flex"
          >
            {t.nav.enroll}
          </Link>
          <button
            type="button"
            className="text-hero-foreground/75 hover:bg-hero-foreground/10 hover:text-hero-foreground inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className={cn(
            'border-hero-foreground/10 border-t md:hidden',
            scrolled ? 'bg-hero/75 backdrop-blur-xl' : 'bg-hero/40 backdrop-blur-md',
          )}
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(l.href) ? 'bg-hero-foreground/10 text-hero-accent' : 'text-hero-foreground/80 hover:bg-hero-foreground/10',
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="bg-hero-accent text-hero-accent-foreground mt-2 rounded-full px-4 py-2.5 text-center text-sm font-bold"
            >
              {t.nav.enroll}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
