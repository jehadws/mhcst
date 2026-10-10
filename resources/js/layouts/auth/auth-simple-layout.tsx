import { BrandMark } from '@/components/site/primitives/brand-mark';
import { useSite } from '@/context/site-context';
import { useBrandText } from '@/hooks/use-site-settings';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    const { t, locale, isRTL, toggleLocale } = useSite();
    const { brandName, brandSub } = useBrandText();
    const BackArrow = isRTL ? ArrowRight : ArrowLeft;

    return (
        <div
            className={cn(
                'bg-cream text-ink flex min-h-svh flex-col',
                locale === 'ar' ? 'font-site' : 'font-site-latin',
            )}
        >
            <header className="bg-ink">
                <div className="site-container flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-[14px]">
                    <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={brandName}>
                        <BrandMark />
                        <span className="leading-tight">
                            <span className="block text-[14px] font-bold">{brandName}</span>
                            {brandSub !== brandName ? (
                                <span className="font-site-latin block text-[9px] font-semibold tracking-[1px] text-white/[0.64]">
                                    {brandSub}
                                </span>
                            ) : null}
                        </span>
                    </Link>

                    <div className="flex items-center gap-5">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-[12px] font-bold text-white/76 transition-colors hover:text-white"
                        >
                            <BackArrow className="size-4" aria-hidden="true" />
                            {t.nav.home}
                        </Link>
                        <button
                            type="button"
                            onClick={toggleLocale}
                            className="font-site-latin border-white/38 text-white/82 hover:border-coral hover:text-coral border px-[12px] py-[7px] text-[11px] font-bold transition-colors"
                        >
                            {locale === 'ar' ? 'EN' : 'ع'}
                        </button>
                    </div>
                </div>
            </header>

            <main id="main-content" className="flex flex-1 items-center justify-center px-4 py-[60px] site-md:px-6 site-md:py-[90px]">
                <div className="w-full max-w-[520px] bg-white p-[26px] site-md:p-[34px]">
                    {(title || description) && (
                        <div className="mb-8">
                            {title && <h1 className="m-0 mb-3 text-[25px] font-semibold tracking-[-0.04em]">{title}</h1>}
                            {description && <p className="m-0 text-[13px] leading-[1.9] text-ink-muted">{description}</p>}
                        </div>
                    )}
                    {children}
                </div>
            </main>

            <footer className="border-t border-line">
                <div className="site-container flex flex-col-reverse items-center justify-between gap-3 py-[18px] text-[11px] text-ink-muted site-md:flex-row">
                    <p className="m-0">
                        © {new Date().getFullYear()} {brandName} — {t.auth.footerRights}
                    </p>
                    <nav className="flex items-center gap-6" aria-label={t.auth.footerLinks}>
                        <Link href={route('privacy-policy')} className="transition-colors hover:text-ink">
                            {t.auth.privacy}
                        </Link>
                        <Link href={route('terms-of-use')} className="transition-colors hover:text-ink">
                            {t.auth.terms}
                        </Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
