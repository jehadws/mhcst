import { SeoHead } from '@/components/seo-head';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite } from '@/context/site-context';
import { Link, router } from '@inertiajs/react';
import { Award, BadgeCheck, Calendar, CheckCircle2, FileBadge, Search, ShieldCheck, User, XCircle } from 'lucide-react';
import { useState } from 'react';

interface VerifiedCertificate {
  certificate_number: string;
  issued_at?: string;
  download_url?: string;
  course?: { title_ar: string; title_en?: string; slug?: string };
  student?: { full_name: string };
  issuer?: { name: string };
}

interface Props {
  number?: string | null;
  certificate?: VerifiedCertificate | null;
  notFound?: boolean;
}

export default function VerifyCertificate({ number = '', certificate = null, notFound = false }: Props) {
  const { t, locale } = useSite();
  const [value, setValue] = useState(number ?? '');
  const [searching, setSearching] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSearching(true);
    router.get(
      route('verify-certificate'),
      { number: value.trim() },
      {
        preserveState: false,
        onFinish: () => setSearching(false),
      },
    );
  };

  const formatDate = (d?: string) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const courseTitle = certificate?.course
    ? locale === 'ar'
      ? certificate.course.title_ar
      : certificate.course.title_en || certificate.course.title_ar
    : '';

  return (
    <>
      <SeoHead
        title={locale === 'ar' ? 'التحقق من الشهادات' : 'Certificate Verification'}
        description={
          locale === 'ar'
            ? `تحقق من صحة الشهادات الصادرة عن ${t.brandFull}`
            : `Verify the authenticity of certificates issued by ${t.brandFull}`
        }
      />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          {/* Hero */}
          <div className="border-border bg-secondary relative border-b py-14 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              <span className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold">
                <ShieldCheck className="size-3.5" />
                <span>{locale === 'ar' ? 'خدمة موثوقة' : 'Trusted Verification'}</span>
              </span>
              <h1 className="text-foreground mt-4 font-serif text-4xl font-extrabold tracking-tight sm:text-5xl">
                {locale === 'ar' ? 'التحقق من صحة الشهادات' : 'Certificate Verification'}
              </h1>
              <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm sm:text-base">
                {locale === 'ar' ? 'أدخل رقم الشهادة للتحقق من صحتها وسلامتها' : 'Enter the certificate number to verify its authenticity'}
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="border-border/80 bg-card rounded-3xl border p-6 shadow-xl sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute start-3.5 top-1/2 size-4 -translate-y-1/2" />
                  <input
                    type="text"
                    dir="ltr"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={locale === 'ar' ? 'مثال: MHCST-2026-00001' : 'e.g. MHCST-2026-00001'}
                    className="border-input bg-background focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-3 ps-10 pe-4 text-sm transition-colors outline-none focus:ring-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searching || !value.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all disabled:opacity-50"
                >
                  <Search className="size-4" />
                  {searching ? t.enroll.submitting : locale === 'ar' ? 'تحقق' : 'Verify'}
                </button>
              </div>
            </form>

            {/* Not Found */}
            {notFound && (
              <div className="border-destructive/30 bg-destructive/5 mt-8 flex flex-col items-center rounded-3xl border p-10 text-center">
                <span className="bg-destructive/10 text-destructive flex size-16 items-center justify-center rounded-full">
                  <XCircle className="size-8" />
                </span>
                <h2 className="text-foreground mt-4 font-serif text-xl font-bold">
                  {locale === 'ar' ? 'لم يتم العثور على الشهادة' : 'Certificate Not Found'}
                </h2>
                <p className="text-muted-foreground mt-2 max-w-md text-sm">
                  {locale === 'ar'
                    ? 'لا توجد شهادة مطابقة لهذا الرقم. يرجى التأكد من الرقم والمحاولة مرة أخرى.'
                    : 'No certificate matches this number. Please check the number and try again.'}
                </p>
              </div>
            )}

            {/* Result */}
            {certificate && !notFound && (
              <div className="bg-card mt-8 overflow-hidden rounded-3xl border border-emerald-500/30 shadow-xl">
                <div className="border-border/60 flex items-center justify-between border-b bg-emerald-500/10 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-foreground font-serif text-lg font-bold">{locale === 'ar' ? 'شهادة صحيحة' : 'Valid Certificate'}</p>
                      <p className="text-muted-foreground text-xs">
                        {locale === 'ar' ? 'تم التحقق من صحة هذه الشهادة' : 'This certificate has been verified as authentic'}
                      </p>
                    </div>
                  </div>
                  <a
                    href={certificate.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-md transition-colors"
                  >
                    <span>{locale === 'ar' ? 'طباعة / تحصيل الشهادة' : 'Print / Download Certificate'}</span>
                  </a>
                </div>
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col items-center text-center">
                    <span className="bg-primary/10 text-primary flex size-20 items-center justify-center rounded-2xl">
                      <Award className="size-10" />
                    </span>
                    <p className="text-foreground mt-4 font-serif text-xl font-bold">
                      {locale === 'ar' ? 'شهادة إتمام تدريب' : 'Certificate of Completion'}
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {locale === 'ar' ? 'صادرة عن' : 'Issued by'} {t.brandFull}
                    </p>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2">
                    <div className="border-border/80 bg-background rounded-2xl border p-5">
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <User className="size-3.5" />
                        <span>{locale === 'ar' ? 'اسم المتدرب' : 'Student Name'}</span>
                      </div>
                      <p className="text-foreground mt-1.5 font-semibold">{certificate.student?.full_name ?? '-'}</p>
                    </div>
                    <div className="border-border/80 bg-background rounded-2xl border p-5">
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <FileBadge className="size-3.5" />
                        <span>{locale === 'ar' ? 'رقم الشهادة' : 'Certificate Number'}</span>
                      </div>
                      <p className="text-foreground mt-1.5 font-semibold" dir="ltr">
                        {certificate.certificate_number}
                      </p>
                    </div>
                    <div className="border-border/80 bg-background rounded-2xl border p-5 sm:col-span-2">
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Award className="size-3.5" />
                        <span>{locale === 'ar' ? 'اسم الدورة' : 'Course Name'}</span>
                      </div>
                      {certificate.course?.slug ? (
                        <Link href={`/courses/${certificate.course.slug}`} className="text-primary mt-1.5 block font-semibold hover:underline">
                          {courseTitle}
                        </Link>
                      ) : (
                        <p className="text-foreground mt-1.5 font-semibold">{courseTitle}</p>
                      )}
                    </div>
                    <div className="border-border/80 bg-background rounded-2xl border p-5">
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <Calendar className="size-3.5" />
                        <span>{locale === 'ar' ? 'تاريخ الإصدار' : 'Issue Date'}</span>
                      </div>
                      <p className="text-foreground mt-1.5 font-semibold">{formatDate(certificate.issued_at)}</p>
                    </div>
                    <div className="border-border/80 bg-background rounded-2xl border p-5">
                      <div className="text-muted-foreground flex items-center gap-2 text-xs">
                        <ShieldCheck className="size-3.5" />
                        <span>{locale === 'ar' ? 'المُصدر' : 'Issued By'}</span>
                      </div>
                      <p className="text-foreground mt-1.5 font-semibold">{certificate.issuer?.name ?? t.brandShort}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Initial state */}
            {!number && !certificate && !notFound && (
              <div className="border-border/80 bg-card text-muted-foreground mt-8 flex items-start gap-3 rounded-2xl border p-5 text-sm">
                <CheckCircle2 className="text-primary mt-0.5 size-4 shrink-0" />
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
  );
}
