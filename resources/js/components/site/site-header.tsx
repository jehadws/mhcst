import { buttonVariants } from '@/components/site/primitives/button';
import { BrandMark } from '@/components/site/primitives/brand-mark';
import { useSite } from '@/context/site-context';
import { useBrandText, useSiteSettings } from '@/hooks/use-site-settings';
import { cn } from '@/lib/utils';
import type { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpLeft, ArrowUpRight, LayoutDashboard, LogIn } from 'lucide-react';
import { useState } from 'react';

type SiteHeaderProps = {
    variant?: 'overlay' | 'solid';
};

export function SiteHeader({ variant = 'overlay' }: SiteHeaderProps) {
    const { t, locale, toggleLocale, isRTL } = useSite();
    const { brandName, brandSub } = useBrandText();
    const { show_teachers_page: showTeachersPage, hide_instructor_names: hideInstructorNames } = useSiteSettings();
    const { url, props } = usePage<SharedData>();
    const { auth } = props;
    const canAccessDashboard = Boolean(auth.user && (auth.roles?.length ?? 0) > 0);
    const [open, setOpen] = useState(false);

    const links = [
        { href: '/about', label: t.nav.about },
        { href: '/departments', label: locale === 'ar' ? 'الأقسام والبرامج' : 'Departments' },
        { href: '/student/register', label: locale === 'ar' ? 'القبول والتسجيل' : 'Admissions' },
        ...(showTeachersPage && !hideInstructorNames
            ? [{ href: '/teachers', label: locale === 'ar' ? 'أعضاء هيئة التدريس' : 'Faculty' }]
            : []),
        { href: '/blog-posts', label: locale === 'ar' ? 'الأخبار' : 'News' },
        { href: '/faq', label: t.nav.faq },
    ];

    const isActive = (href: string) => url === href || url.startsWith(`${href}/`);
    const Arrow = isRTL ? ArrowUpLeft : ArrowUpRight;

    return (
        <>
            <a
                href="#main-content"
                className="bg-coral absolute start-4 -top-[100px] z-[60] px-[14px] py-[8px] text-[12px] font-bold text-white transition-[top] duration-200 focus:top-[10px]"
            >
                {locale === 'ar' ? 'تخطى إلى المحتوى' : 'Skip to content'}
            </a>
            <header
                className={cn(
                    'inset-x-0 top-0 z-10 border-b border-white/[0.14] text-white',
                    variant === 'overlay' ? 'absolute' : 'bg-ink relative',
                )}
            >
                <div className="site-container flex h-[76px] items-center justify-between gap-[30px] site-lg:h-[90px]">
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

                    <nav className="hidden items-center gap-[28px] site-lg:flex" aria-label={locale === 'ar' ? 'التنقل الرئيسي' : 'Main navigation'}>
                        {links.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive(item.href) ? 'page' : undefined}
                                className={cn(
                                    'text-[13px] font-medium transition-colors duration-250 hover:text-white',
                                    isActive(item.href) ? 'text-white' : 'text-white/[0.76]',
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-[18px]">
                        <button
                            type="button"
                            onClick={toggleLocale}
                            className="font-site-latin flex items-center gap-[8px] text-[11px] font-semibold text-white transition-colors hover:text-white"
                            aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
                        >
                            <span>{locale === 'ar' ? 'EN' : 'AR'}</span>
                            <i
                                className={cn(
                                    'relative block h-[14px] w-[24px] rounded-[20px] border border-white/40 after:absolute after:top-1/2 after:size-[8px] after:-translate-y-1/2 after:rounded-full after:bg-coral',
                                    locale === 'ar' ? 'after:end-[3px]' : 'after:start-[3px]',
                                )}
                            />
                        </button>

                        <Link
                            href="/contact"
                            className={cn(buttonVariants({ variant: 'dark', size: 'small' }), 'hidden site-md:inline-flex')}
                        >
                            {t.nav.contact}
                            <Arrow className="size-[14px]" aria-hidden="true" />
                        </Link>

                        {canAccessDashboard ? (
                            <Link
                                href="/dashboard"
                                className="hidden size-9 items-center justify-center text-white transition-colors hover:text-coral site-md:flex"
                                aria-label={t.nav.dashboard}
                            >
                                <LayoutDashboard className="size-[18px]" aria-hidden="true" />
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="hidden size-9 items-center justify-center text-white transition-colors hover:text-coral site-md:flex"
                                aria-label={t.nav.login}
                            >
                                <LogIn className="size-[18px]" aria-hidden="true" />
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            aria-expanded={open}
                            aria-controls="mobile-panel"
                            className="flex flex-col justify-center gap-[10px] py-2 site-lg:hidden"
                            aria-label={open ? (locale === 'ar' ? 'إغلاق القائمة' : 'Close menu') : locale === 'ar' ? 'فتح القائمة' : 'Open menu'}
                        >
                            <span className="block h-[2px] w-6 bg-white transition-transform duration-300" style={open ? { transform: 'translateY(6px) rotate(45deg)' } : undefined} />
                            <span className="block h-[2px] w-6 bg-white transition-transform duration-300" style={open ? { transform: 'translateY(-6px) rotate(-45deg)' } : undefined} />
                        </button>
                    </div>
                </div>

                <div
                    id="mobile-panel"
                    inert={!open}
                    className={cn(
                        'overflow-hidden bg-ink transition-[max-height,padding] duration-300 site-lg:hidden',
                        open ? 'max-h-[480px] py-[12px] pb-[18px]' : 'max-h-0 py-0',
                    )}
                >
                    <nav className="px-5" aria-label={locale === 'ar' ? 'قائمة الجوال' : 'Mobile menu'}>
                        {links.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setOpen(false)}
                                aria-current={isActive(item.href) ? 'page' : undefined}
                                className={cn(
                                    'block border-b border-white/10 px-[2px] py-[13px] text-[13px] transition-colors hover:text-white',
                                    isActive(item.href) ? 'text-white' : 'text-white/[0.8]',
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                        <div className="mt-[14px] flex items-center gap-3">
                            <Link
                                href="/contact"
                                onClick={() => setOpen(false)}
                                className={cn(buttonVariants({ variant: 'accent', size: 'small' }), 'flex-1 justify-center')}
                            >
                                {t.nav.contact}
                                <Arrow className="size-[14px]" aria-hidden="true" />
                            </Link>
                            <Link
                                href={canAccessDashboard ? '/dashboard' : '/login'}
                                onClick={() => setOpen(false)}
                                className="flex size-[38px] items-center justify-center rounded-site-button border border-white/25 text-white transition-colors hover:border-coral hover:text-coral"
                                aria-label={canAccessDashboard ? t.nav.dashboard : t.nav.login}
                            >
                                {canAccessDashboard ? <LayoutDashboard className="size-4" aria-hidden="true" /> : <LogIn className="size-4" aria-hidden="true" />}
                            </Link>
                        </div>
                    </nav>
                </div>
            </header>
        </>
    );
}
