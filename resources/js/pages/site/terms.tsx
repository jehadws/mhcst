import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { SeoHead } from '@/components/seo-head'
import { useSite } from '@/context/site-context'
import { FileText } from 'lucide-react'

export default function TermsPage() {
    const { locale, t } = useSite()

    return (
        <>
            <SeoHead
                title={locale === 'ar' ? 'الشروط والأحكام' : 'Terms of Use'}
                description={locale === 'ar'
                    ? `الشروط والأحكام لاستخدام موقع ${t.brandFull}`
                    : `Terms of use for the ${t.brandFull} website`}
            />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">
                    <div className="border-b border-border bg-secondary py-12">
                        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                                <FileText className="size-3.5" />
                                <span>{locale === 'ar' ? 'الشروط والأحكام' : 'Terms of Use'}</span>
                            </span>
                            <h1 className="mt-4 font-serif text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                {locale === 'ar' ? 'الشروط والأحكام' : 'Terms of Use'}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {locale === 'ar' ? 'آخر تحديث: يناير 2025' : 'Last updated: January 2025'}
                            </p>
                        </div>
                    </div>

                    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed prose-p:text-muted-foreground">
                            {locale === 'ar' ? (
                                <>
                                    <h2>قبول الشروط</h2>
                                    <p>باستخدامك لموقع {t.brandFull}، فإنك توافق على الالتزام بهذه الشروط والأحكام.</p>
                                    <h2>خدماتنا</h2>
                                    <p>نقدم برامج تدريبية وتعليمية معتمدة. يحق لنا تعديل أو إلغاء أي برنامج في أي وقت مع إشعار مناسب.</p>
                                    <h2>التسجيل والدفع</h2>
                                    <p>يُعدّ التسجيل ملزماً بعد تأكيده من قِبل فريقنا. يتم الدفع وفق السياسة المتفق عليها مع المستشار.</p>
                                    <h2>سياسة الاسترداد</h2>
                                    <p>يمكن استرداد الرسوم كاملاً في حال الإلغاء قبل 7 أيام من بدء البرنامج. لا يحق الاسترداد بعد بدء الدورة.</p>
                                    <h2>الملكية الفكرية</h2>
                                    <p>جميع المحتويات والمواد التدريبية هي ملك حصري لـ{t.brandShort} ولا يجوز نسخها أو توزيعها دون إذن مسبق.</p>
                                    <h2>حدود المسؤولية</h2>
                                    <p>لا تتحمل {t.brandShort} مسؤولية أي أضرار غير مباشرة ناجمة عن استخدام خدماتنا.</p>
                                    <h2>التعديلات</h2>
                                    <p>نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إعلامكم بأي تغييرات جوهرية.</p>
                                    <h2>القانون المطبّق</h2>
                                    <p>تخضع هذه الشروط لأحكام القانون الليبي وتختص المحاكم الليبية بالنظر في أي نزاع.</p>
                                </>
                            ) : (
                                <>
                                    <h2>Acceptance of Terms</h2>
                                    <p>By using the {t.brandFull} website, you agree to be bound by these Terms of Use.</p>
                                    <h2>Our Services</h2>
                                    <p>We provide accredited training and educational programs. We reserve the right to modify or cancel any program with appropriate notice.</p>
                                    <h2>Registration & Payment</h2>
                                    <p>Registration is binding once confirmed by our team. Payment is made according to the policy agreed upon with your advisor.</p>
                                    <h2>Refund Policy</h2>
                                    <p>Full refunds are available if cancellation is made at least 7 days before the program starts. No refunds after a course has begun.</p>
                                    <h2>Intellectual Property</h2>
                                    <p>All content and training materials are the exclusive property of {t.brandShort} and may not be copied or distributed without prior permission.</p>
                                    <h2>Limitation of Liability</h2>
                                    <p>{t.brandShort} is not liable for any indirect damages resulting from the use of our services.</p>
                                    <h2>Modifications</h2>
                                    <p>We reserve the right to modify these terms at any time. You will be notified of any material changes.</p>
                                    <h2>Governing Law</h2>
                                    <p>These terms are governed by Libyan law and Libyan courts shall have jurisdiction over any disputes.</p>
                                </>
                            )}
                        </div>
                    </div>
                </main>
                <SiteFooter />
            </div>
        </>
    )
}
