import { SiteLogo } from '@/components/site/site-logo';
import { useSite } from '@/context/site-context';
import { useBrandText } from '@/hooks/use-site-settings';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
  const { t, locale, toggleLocale } = useSite();
  const { brandName, brandSub } = useBrandText();

  return (
    <main className="bg-background text-foreground flex min-h-svh flex-col">
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside
          className="bg-hero text-hero-foreground relative order-2 flex min-h-[240px] flex-col overflow-hidden [background-image:linear-gradient(160deg,var(--hero)_0%,color-mix(in_oklab,var(--hero)_52%,var(--background))_48%,var(--background)_100%)] p-8 lg:order-1 lg:min-h-0 lg:w-[41%]"
          aria-label={brandName}
        >
          <div className="border-hero-foreground/25 pointer-events-none absolute -end-44 top-[22%] size-[30rem] rounded-full" />
          <div className="border-hero-foreground/25 bg-hero-foreground/[0.07] pointer-events-none absolute -end-32 -bottom-20 size-[17rem] rounded-full" />

          <div className="relative z-10 flex items-center gap-3">
            <span className="border-hero-foreground/40 flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white p-0.5">
              <SiteLogo variant="footer" className="size-12" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-extrabold">{brandName}</span>
              <span className="text-hero-foreground/75 block text-[11px] font-medium">{brandSub}</span>
            </span>
          </div>

          <span
            aria-hidden="true"
            className="text-hero-foreground/10 pointer-events-none absolute -start-12 -bottom-8 [transform:rotate(-18deg)] text-[clamp(2.5rem,9vw,7rem)] leading-[0.78] font-black select-none"
          >
            {brandName}
          </span>
        </aside>

        <section className="order-1 flex min-w-0 flex-1 items-center justify-center px-6 py-12 sm:px-12 lg:order-2 lg:px-[8vw] lg:py-20">
          <div className="w-full max-w-[596px]">
            {(title || description) && (
              <div className="mb-8 space-y-2">
                {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
                {description && <p className="text-muted-foreground text-sm">{description}</p>}
              </div>
            )}
            {children}
          </div>
        </section>
      </div>

      <footer className="text-muted-foreground bg-card flex flex-col-reverse items-center justify-between gap-3 border-t px-5 py-4 text-xs sm:flex-row sm:px-[4vw]">
        <p className="m-0">
          © {new Date().getFullYear()} {brandName} — {t.auth.footerRights}
        </p>
        <nav className="flex items-center gap-6" aria-label={t.auth.footerLinks}>
          <Link href={route('privacy-policy')} className="hover:text-foreground transition-colors">
            {t.auth.privacy}
          </Link>
          <Link href={route('terms-of-use')} className="hover:text-foreground transition-colors">
            {t.auth.terms}
          </Link>
          <button type="button" onClick={toggleLocale} className="hover:text-foreground transition-colors" aria-label="Toggle language">
            {locale === 'ar' ? 'English' : 'العربية'}
          </button>
        </nav>
      </footer>
    </main>
  );
}
