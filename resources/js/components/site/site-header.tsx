import { useSite } from '@/context/site-context';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Globe, Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

export function SiteHeader() {
  const { t, theme, toggleTheme, toggleLocale, locale } = useSite();
  const settings = useSiteSettings();
  const logoUrl = settings?.site_logo ? `/storage/${settings.site_logo}` : '/logo.png';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300',
        scrolled ? 'border-border bg-background/85 shadow-sm backdrop-blur-md' : 'bg-background border-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 focus:outline-none">
          <img src={logoUrl} alt={settings?.site_name || t.brandShort} className="size-9 rounded-lg object-cover" />
          <span className="flex flex-col leading-none">
            <span className="font-serif text-base font-semibold tracking-tight">{settings.site_name || t.brandShort}</span>
            <span className="text-muted-foreground text-[11px]">{locale === 'en' ? 'Education & Training' : "للعلوم والتقنية"}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button type="button" size={'default'} variant={'ghost'} onClick={toggleLocale} aria-label="Toggle language">
            <Globe className="size-4" />
            <span className="text-xs font-semibold">{locale === 'en' ? 'AR' : 'EN'}</span>
          </Button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t.theme.light : t.theme.dark}
            className="text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors"
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <Link
            href="/contact"
            className="bg-primary text-primary-foreground hover:bg-primary/90 hidden rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-all sm:inline-flex"
          >
            {t.nav.enroll}
          </Link>
          <button
            type="button"
            className="text-muted-foreground hover:bg-secondary hover:text-foreground inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-border bg-background border-t md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 sm:px-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="text-foreground hover:bg-secondary rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="bg-primary text-primary-foreground mt-2 rounded-md px-4 py-2.5 text-center text-sm font-medium"
            >
              {t.nav.enroll}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
