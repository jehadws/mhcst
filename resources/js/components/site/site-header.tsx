import { SiteLogo } from '@/components/site/site-logo';
import { useBrandText } from '@/hooks/use-site-settings';
import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpLeft, ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function SiteHeader() {
  const { t, theme, toggleTheme, toggleLocale, locale, isRTL } = useSite();
  const { brandName, brandSub } = useBrandText();
  const { url } = usePage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '/about', label: t.nav.about },
    { href: '/contact', label: locale === 'ar' ? 'القبول والتسجيل' : 'Admissions' },
    { href: '/departments', label: locale === 'ar' ? 'الأقسام والبرامج' : 'Departments' },
    { href: '/blog-posts', label: locale === 'ar' ? 'الأخبار' : 'News' },
    { href: '/faq', label: t.nav.faq },
  ];

  const isActive = (href: string) => url === href || url.startsWith(`${href}/`);
  const EnrollArrow = isRTL ? ArrowUpLeft : ArrowUpRight;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
        scrolled
          ? 'bg-hero/95 shadow-lg shadow-black/20 backdrop-blur supports-[backdrop-filter]:bg-hero/80'
          : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-hero-foreground flex items-center gap-3" aria-label={brandName}>
          <span className="border-accent/60 flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white p-0.5">
            <SiteLogo variant="header" className="size-10" />
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-base font-extrabold">{brandName}</span>
            <span className="text-hero-foreground/70 block text-[11px] font-medium">{brandSub}</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex" aria-label={locale === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}>
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'whitespace-nowrap text-sm font-medium transition-colors',
                isActive(item.href) ? 'text-accent' : 'text-hero-foreground/85 hover:text-accent',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLocale}
            className="border-hero-foreground/20 text-hero-foreground/85 hover:border-accent hover:text-accent hidden size-9 items-center justify-center rounded-md border text-xs font-bold transition-colors sm:flex"
            aria-label="Toggle language"
          >
            {locale === 'ar' ? 'EN' : 'AR'}
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="border-hero-foreground/20 text-hero-foreground/85 hover:border-accent hover:text-accent hidden size-9 items-center justify-center rounded-md border transition-colors sm:flex"
            aria-label={theme === 'dark' ? t.theme.light : t.theme.dark}
          >
            {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" aria-hidden="true" />}
          </button>
          <Link
            href="/contact"
            className="bg-accent text-accent-foreground inline-flex items-center gap-1.5 rounded-md px-4 py-2.5 text-sm font-bold transition-transform hover:-translate-y-0.5"
          >
            {t.nav.enroll}
            <EnrollArrow className="size-4" aria-hidden="true" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="border-hero-foreground/20 text-hero-foreground flex size-9 items-center justify-center rounded-md border xl:hidden"
            aria-label={open ? (locale === 'ar' ? 'إغلاق القائمة' : 'Close menu') : locale === 'ar' ? 'فتح القائمة' : 'Open menu'}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-hero-foreground/10 bg-hero border-t px-4 py-4 xl:hidden"
          aria-label={locale === 'ar' ? 'قائمة الجوال' : 'Mobile menu'}
        >
          <ul className="grid gap-1">
            {links.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'block rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive(item.href)
                      ? 'text-accent bg-white/5'
                      : 'text-hero-foreground/85 hover:bg-white/5 hover:text-accent',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
