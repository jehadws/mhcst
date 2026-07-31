import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { SeoHead } from '@/components/seo-head'
import { useSite } from '@/context/site-context'
import { Shield } from 'lucide-react'

export default function PrivacyPage() {
    const { locale } = useSite()

    return (
        <>
            <SeoHead
                title={locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                description={locale === 'ar'
                    ? 'سياسة الخصوصية وحماية البيانات في المعهد الحديث العالي للعلوم والتكنولوجيا'
                    : 'Privacy policy and data protection at MHCST'}
            />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">
                    <div className="border-b border-border/60 bg-gradient-to-b from-primary/10 via-background to-background py-12">
                        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                                <Shield className="size-3.5" />
                                <span>{locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
                            </span>
                            <h1 className="mt-4 font-serif text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                                {locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
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
                                    <h2>مقدمة</h2>
                                    <p>تلتزم المعايير الحديثة للتعليم والتدريب بحماية خصوصيتك وبياناتك الشخصية. تشرح هذه السياسة كيفية جمع معلوماتك واستخدامها وحمايتها.</p>
                                    <h2>المعلومات التي نجمعها</h2>
                                    <p>قد نجمع المعلومات التالية عند تسجيلك أو تواصلك معنا: الاسم الكامل، رقم الهاتف، البريد الإلكتروني، وبيانات التسجيل في الدورات.</p>
                                    <h2>كيفية استخدام المعلومات</h2>
                                    <p>نستخدم معلوماتك لمعالجة طلبات التسجيل، التواصل معك بشأن البرامج والخدمات، وتحسين تجربتك معنا.</p>
                                    <h2>حماية البيانات</h2>
                                    <p>نطبّق إجراءات أمان صارمة لحماية بياناتك من الوصول غير المصرح به أو الإفصاح أو التغيير أو التدمير.</p>
                                    <h2>مشاركة البيانات</h2>
                                    <p>لا نبيع أو نؤجر أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا بموافقتك أو وفق ما يقتضيه القانون.</p>
                                    <h2>حقوقك</h2>
                                    <p>يحق لك الوصول إلى بياناتك الشخصية وتصحيحها أو طلب حذفها في أي وقت. تواصل معنا عبر البريد الإلكتروني للحصول على المساعدة.</p>
                                    <h2>التواصل معنا</h2>
                                    <p>إذا كان لديك أي استفسار حول سياسة الخصوصية، يرجى التواصل معنا على: info@mset.ly</p>
                                </>
                            ) : (
                                <>
                                    <h2>Introduction</h2>
                                    <p>Modern Standards for Education & Training is committed to protecting your privacy and personal data. This policy explains how we collect, use, and safeguard your information.</p>
                                    <h2>Information We Collect</h2>
                                    <p>We may collect the following information when you register or contact us: full name, phone number, email address, and course enrollment data.</p>
                                    <h2>How We Use Your Information</h2>
                                    <p>We use your information to process enrollment requests, communicate about programs and services, and improve your experience with us.</p>
                                    <h2>Data Security</h2>
                                    <p>We implement strict security measures to protect your data from unauthorized access, disclosure, alteration, or destruction.</p>
                                    <h2>Data Sharing</h2>
                                    <p>We do not sell, rent, or share your personal information with third parties except with your consent or as required by law.</p>
                                    <h2>Your Rights</h2>
                                    <p>You have the right to access, correct, or request deletion of your personal data at any time. Contact us by email for assistance.</p>
                                    <h2>Contact Us</h2>
                                    <p>If you have any questions about this Privacy Policy, please contact us at: info@mset.ly</p>
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
