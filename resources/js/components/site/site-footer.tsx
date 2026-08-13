import { SiteLogo } from '@/components/site/site-logo';
import { useBrandText, useSiteSettings } from '@/hooks/use-site-settings';
import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
    </svg>
  );
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.25h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07Z" />
    </svg>
  );
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.38A5.8 5.8 0 0 0 .63 4.14c-.3.76-.5 1.64-.56 2.91C.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.38 2.12.66.66 1.33 1.08 2.12 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.8 5.8 0 0 0 2.12-1.38 5.8 5.8 0 0 0 1.38-2.12c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.8 5.8 0 0 0-1.38-2.12A5.8 5.8 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84A6.16 6.16 0 1 0 18.16 12 6.16 6.16 0 0 0 12 5.84ZM12 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4Zm6.41-10.85a1.44 1.44 0 1 0 1.44 1.44 1.44 1.44 0 0 0-1.44-1.44Z" />
    </svg>
  );
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0Z" />
    </svg>
  );
}

export function SiteFooter() {
  const { t, locale } = useSite();
  const { brandName, brandSub } = useBrandText();
  const settings = useSiteSettings();
  const contactPhone = settings.contact_phone || '+218 91 234 5678';
  const contactEmail = settings.contact_email || 'info@mhcst.ly';
  const address = settings.address || t.location.addressLine;
  const socialLinks = settings.social_links || {};

  const quickLinks = [
    { href: '/about', label: t.nav.about },
    { href: '/contact', label: locale === 'ar' ? 'القبول والتسجيل' : 'Admissions' },
    { href: '/departments', label: locale === 'ar' ? 'الأقسام والبرامج' : 'Departments' },
    { href: '/blog-posts', label: locale === 'ar' ? 'الأخبار' : 'News' },
    { href: '/faq', label: t.nav.faq },
    { href: '/student/portal', label: locale === 'ar' ? 'بوابة الطالب' : 'Student portal' },
    { href: '/terms-of-use', label: t.footer.terms },
    { href: '/privacy-policy', label: t.footer.privacy },
  ];

  const contactItems = [
    { icon: Phone, text: contactPhone },
    { icon: Mail, text: contactEmail },
    { icon: MapPin, text: address },
  ];

  const socials = [
    { icon: YoutubeIcon, label: 'YouTube', href: socialLinks.youtube || '#' },
    { icon: XIcon, label: 'X (Twitter)', href: socialLinks.twitter || '#' },
    { icon: FacebookIcon, label: 'Facebook', href: socialLinks.facebook || '#' },
    { icon: InstagramIcon, label: 'Instagram', href: socialLinks.instagram || '#' },
    { icon: LinkedinIcon, label: 'LinkedIn', href: socialLinks.linkedin || '#' },
  ];

  return (
    <footer className="bg-hero text-hero-foreground">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 text-start lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <span className="border-accent/60 flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white p-0.5">
                <SiteLogo variant="header" className="size-10" />
              </span>
              <div className="leading-tight">
                <span className="block text-base font-extrabold">{brandName}</span>
                <span className="text-hero-foreground/70 block text-[11px]">{brandSub}</span>
              </div>
            </div>
            <p className="text-hero-foreground/70 mt-5 text-sm leading-relaxed">{t.footer.tagline}</p>
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="border-hero-foreground/15 text-hero-foreground/80 hover:border-accent hover:text-accent flex size-9 items-center justify-center rounded-md border transition-colors"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
            <h4 className="text-accent mt-8 text-sm font-bold">{t.footer.paymentMethods}</h4>
            <div className="mt-3 flex gap-2">
              <span className="border-hero-foreground/15 rounded-md border px-3 py-1.5 text-xs">{t.footer.bankTransfer}</span>
            </div>
          </div>

          <div>
            <h4 className="text-accent text-sm font-bold">{t.footer.quickLinks}</h4>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
              {quickLinks.map((l, idx) => (
                <li key={`${l.href}-${idx}`}>
                  <Link href={l.href} className="text-hero-foreground/75 hover:text-accent text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-accent text-sm font-bold">{t.footer.contact}</h4>
            <ul className="mt-5 grid gap-4">
              {contactItems.map((c) => (
                <li key={c.text} className="flex items-center gap-3">
                  <span className="bg-white/5 text-accent flex size-8 shrink-0 items-center justify-center rounded-md">
                    <c.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span dir="ltr" className="text-hero-foreground/75 text-sm">
                    {c.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-hero-foreground/10 border-t">
        <div className="text-hero-foreground/60 mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-xs sm:flex-row sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link href="/privacy-policy" className="hover:text-accent">
              {t.footer.privacy}
            </Link>
            <Link href="/terms-of-use" className="hover:text-accent">
              {t.footer.terms}
            </Link>
          </div>
          <p>
            {t.footer.rights} {brandName} © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
