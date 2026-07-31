import { useState } from 'react'
import { Link, router } from '@inertiajs/react'
import { Award, BadgeCheck, Calendar, CheckCircle2, FileBadge, Search, ShieldCheck, User, XCircle } from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { SeoHead } from '@/components/seo-head'
import { useSite } from '@/context/site-context'

interface VerifiedCertificate {
    id: number
    certificate_number: string
    issued_at?: string
    course?: { title_ar: string; title_en?: string; slug?: string }
    student?: { full_name: string; email?: string }
    issuer?: { name: string }
}

interface Props {
    number?: string | null
    certificate?: VerifiedCertificate | null
    notFound?: boolean
}

export default function VerifyCertificate({ number = '', certificate = null, notFound = false }: Props) {
    const { t, locale } = useSite()
    const [value, setValue] = useState(number ?? '')
    const [searching, setSearching] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!value.trim()) return
        setSearching(true)
        router.get(route('verify-certificate'), { number: value.trim() }, {
            preserveState: false,
            onFinish: () => setSearching(false),
        })
    }

    const formatDate = (d?: string) => {
        if (!d) return '-'
        return new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const courseTitle = certificate?.course
        ? (locale === 'ar' ? certificate.course.title_ar : certificate.course.title_en || certificate.course.title_ar)
        : ''

    return (
        <>
            <SeoHead
                title={locale === 'ar' ? 'التحقق من الشهادات' : 'Certificate Verification'}
                description={locale === 'ar'
                    ? 'تحقق من صحة الشهادات الصادرة عن المعهد الحديث العالي للعلوم والتكنولوجيا'
                    : 'Verify the authenticity of certificates issued by MHCST'}
            />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">
                    {/* Hero */}
                    <div className="relative border-b border-border/60 bg-gradient-to-b from-primary/10 via-background to-background py-14 sm:py-16">
                        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                                <ShieldCheck className="size-3.5" />
                                <span>{locale === 'ar' ? 'خدمة موثوقة' : 'Trusted Verification'}</span>
                            </span>
                            <h1 className="mt-4 font-serif text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                                {locale === 'ar' ? 'التحقق من صحة الشهادات' : 'Certificate Verification'}
                            </h1>
                            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
                                {locale === 'ar'
                                    ? 'أدخل رقم الشهادة للتحقق من صحتها وسلامتها'
                                    : 'Enter the certificate number to verify its authenticity'}
                            </p>
                        </div>
                    </div>

                    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                        {/* Search Form */}
                        <form onSubmit={handleSubmit} className="rounded-3xl border border-border/80 bg-card p-6 shadow-xl sm:p-8">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        dir="ltr"
                                        value={value}
                                        onChange={(e) => setValue(e.target.value)}
                                        placeholder={locale === 'ar' ? 'مثال: MHCST-2026-00001' : 'e.g. MHCST-2026-00001'}
                                        className="w-full rounded-xl border border-input bg-background py-3 pe-4 ps-10 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={searching || !value.trim()}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50"
                                >
                                    <Search className="size-4" />
                                    {searching ? t.enroll.submitting : locale === 'ar' ? 'تحقق' : 'Verify'}
                                </button>
                            </div>
                        </form>

                        {/* Not Found */}
                        {notFound && (
                            <div className="mt-8 flex flex-col items-center rounded-3xl border border-destructive/30 bg-destructive/5 p-10 text-center">
                                <span className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                                    <XCircle className="size-8" />
                                </span>
                                <h2 className="mt-4 font-serif text-xl font-bold text-foreground">
                                    {locale === 'ar' ? 'لم يتم العثور على الشهادة' : 'Certificate Not Found'}
                                </h2>
                                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                    {locale === 'ar'
                                        ? 'لا توجد شهادة مطابقة لهذا الرقم. يرجى التأكد من الرقم والمحاولة مرة أخرى.'
                                        : 'No certificate matches this number. Please check the number and try again.'}
                                </p>
                            </div>
                        )}

                        {/* Result */}
                        {certificate && !notFound && (
                            <div className="mt-8 overflow-hidden rounded-3xl border border-emerald-500/30 bg-card shadow-xl">
                                <div className="flex items-center justify-between border-b border-border/60 bg-emerald-500/10 px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <BadgeCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
                                        <div>
                                            <p className="font-serif text-lg font-bold text-foreground">
                                                {locale === 'ar' ? 'شهادة صحيحة' : 'Valid Certificate'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {locale === 'ar' ? 'تم التحقق من صحة هذه الشهادة' : 'This certificate has been verified as authentic'}
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={`/verify-certificate/${certificate.certificate_number}/download`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-md transition-colors hover:bg-primary/90"
                                    >
                                        <span>{locale === 'ar' ? 'طباعة / تحصيل الشهادة' : 'Print / Download Certificate'}</span>
                                    </a>
                                </div>
                                <div className="p-6 sm:p-8">
                                    <div className="flex flex-col items-center text-center">
                                        <span className="flex size-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                            <Award className="size-10" />
                                        </span>
                                        <p className="mt-4 font-serif text-xl font-bold text-foreground">
                                            {locale === 'ar' ? 'شهادة إتمام تدريب' : 'Certificate of Completion'}
                                        </p>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {locale === 'ar' ? 'صادرة عن' : 'Issued by'} {t.brandFull}
                                        </p>
                                    </div>

                                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                                        <div className="rounded-2xl border border-border/80 bg-background p-5">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <User className="size-3.5" />
                                                <span>{locale === 'ar' ? 'اسم المتدرب' : 'Student Name'}</span>
                                            </div>
                                            <p className="mt-1.5 font-semibold text-foreground">{certificate.student?.full_name ?? '-'}</p>
                                        </div>
                                        <div className="rounded-2xl border border-border/80 bg-background p-5">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <FileBadge className="size-3.5" />
                                                <span>{locale === 'ar' ? 'رقم الشهادة' : 'Certificate Number'}</span>
                                            </div>
                                            <p className="mt-1.5 font-semibold text-foreground" dir="ltr">{certificate.certificate_number}</p>
                                        </div>
                                        <div className="rounded-2xl border border-border/80 bg-background p-5 sm:col-span-2">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Award className="size-3.5" />
                                                <span>{locale === 'ar' ? 'اسم الدورة' : 'Course Name'}</span>
                                            </div>
                                            {certificate.course?.slug ? (
                                                <Link href={`/courses/${certificate.course.slug}`} className="mt-1.5 block font-semibold text-primary hover:underline">
                                                    {courseTitle}
                                                </Link>
                                            ) : (
                                                <p className="mt-1.5 font-semibold text-foreground">{courseTitle}</p>
                                            )}
                                        </div>
                                        <div className="rounded-2xl border border-border/80 bg-background p-5">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="size-3.5" />
                                                <span>{locale === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}</span>
                                            </div>
                                            <p className="mt-1.5 font-semibold text-foreground">{formatDate(certificate.issued_at)}</p>
                                        </div>
                                        <div className="rounded-2xl border border-border/80 bg-background p-5">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <ShieldCheck className="size-3.5" />
                                                <span>{locale === 'ar' ? 'المُصدر' : 'Issued By'}</span>
                                            </div>
                                            <p className="mt-1.5 font-semibold text-foreground">{certificate.issuer?.name ?? t.brandShort}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Initial state */}
                        {!number && !certificate && !notFound && (
                            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border/80 bg-card p-5 text-sm text-muted-foreground">
                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                                <p>
                                    {locale === 'ar'
                                        ? 'يمكنك التحقق من أي شهادة صادرة عن مركزنا باستخدام الرقم المطبوع على الشهادة.'
                                        : 'You can verify any certificate issued by our center using the number printed on the certificate.'}
                                </p>
                            </div>
                        )}
                    </div>
                </main>
                <SiteFooter />
            </div>
        </>
    )
}
