import { useSite } from '@/context/site-context';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { Link } from '@inertiajs/react';
import { Facebook, Instagram, Linkedin, MessageCircle, Twitter } from 'lucide-react';
import { NewsletterForm } from './newsletter-form';

export function SiteFooter() {
  const { t, tr, locale } = useSite();
  const settings = useSiteSettings();
  const logoUrl = settings?.site_logo ? `/storage/${settings.site_logo}` : '/logo.png';

  const brandName = settings.site_name || t.brandShort;
  const contactPhone = settings.contact_phone || '+218 91 234 5678';
  const contactEmail = settings.contact_email || 'info@mset.ly';
  const address = settings.address || t.location.addressLine;
  const whatsapp = settings.whatsapp_number || '218912345678';
  const socialLinks = settings.social_links || {};

  const navLinks = [
    { href: '/departments', label: locale === 'ar' ? 'الأقسام الأكاديمية' : 'Departments' },
    { href: '/about', label: t.nav.about },
    { href: '/blog-posts', label: locale === 'ar' ? 'الأخبار والإعلانات' : 'News' },
    { href: '/faq', label: t.nav.faq },
    { href: '/contact', label: t.nav.contact },
  ];

  const legalLinks = [
    { href: '/verify-certificate', label: locale === 'ar' ? 'التحقق من الشهادة' : 'Verify Certificate' },
    { href: '/student/portal', label: locale === 'ar' ? 'بوابة المتدربين' : 'Learner Portal' },
    { href: '/privacy-policy', label: locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy' },
    { href: '/terms-of-use', label: locale === 'ar' ? 'الشروط والأحكام' : 'Terms of Use' },
  ];

  const socials = [
    { href: socialLinks.facebook || 'https://facebook.com', icon: Facebook, label: 'Facebook' },
    { href: socialLinks.instagram || 'https://instagram.com', icon: Instagram, label: 'Instagram' },
    { href: socialLinks.linkedin || 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
    { href: socialLinks.twitter || 'https://twitter.com', icon: Twitter, label: 'X / Twitter' },
  ];

  return (
    <footer className="border-hero-foreground/10 bg-hero text-hero-foreground border-t">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <img src={logoUrl} alt={brandName} className="size-10 rounded-xl object-cover shadow-md" />
              <span className="flex flex-col leading-none">
                <span className="font-serif text-base font-bold">{brandName}</span>
                <span className="text-hero-muted text-[11px]">{locale === 'en' ? 'Education & Training' : 'للتعليم والتدريب'}</span>
              </span>
            </Link>
            <p className="text-hero-muted mt-4 max-w-xs text-sm leading-relaxed">{t.footer.tagline}</p>

            {/* Social Icons */}
            <div className="mt-5 flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="border-hero-foreground/15 bg-hero-foreground/5 text-hero-muted hover:border-hero-accent hover:bg-hero-foreground/10 hover:text-hero-accent flex size-9 items-center justify-center rounded-full border transition-all"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-serif text-sm font-bold">{t.newsletter.title}</h3>
            <p className="text-hero-muted mt-3 text-xs leading-relaxed">{t.newsletter.subtitle}</p>
            <div className="mt-4">
              <NewsletterForm compact />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-serif text-sm font-bold">{t.footer.quickLinks}</h3>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-hero-muted hover:text-hero-accent text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-serif text-sm font-bold">{t.footer.contact}</h3>
            <ul className="text-hero-muted mt-4 space-y-3 text-sm">
              <li>{address}</li>
              <li dir="ltr" className={locale === 'ar' ? 'text-end' : ''}>
                {contactPhone}
              </li>
              <li dir="ltr" className={locale === 'ar' ? 'text-end' : ''}>
                {contactEmail}
              </li>
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
            <h3 className="font-serif text-sm font-bold">{locale === 'ar' ? 'القانوني' : 'Legal'}</h3>
            <ul className="mt-4 space-y-2.5">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-hero-muted hover:text-hero-accent text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Accreditation Badge */}
            <div className="border-hero-foreground/15 bg-hero-foreground/5 mt-6 rounded-xl border p-3">
              <p className="mb-1 text-[11px] font-semibold">{locale === 'ar' ? 'جهة تدريب معتمدة' : 'Accredited Training Provider'}</p>
              <p className="text-hero-muted text-[10px] leading-relaxed">
                {locale === 'ar' ? 'معتمدون من الجهات المهنية الإقليمية والدولية' : 'Recognized by regional & international professional bodies'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-hero-foreground/10 border-t">
        <div className="text-hero-muted mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs sm:flex-row sm:px-6 lg:px-8">
          <p>
            {settings.footer_text || (
              <>
                © {new Date().getFullYear()} {tr({ en: 'Modern Standards for Education & Training', ar: 'المعايير الحديثة للتعليم والتدريب' })}.{' '}
                {t.footer.rights}
              </>
            )}
          </p>
          <div className="flex items-center gap-4">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-hero-foreground transition-colors">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
