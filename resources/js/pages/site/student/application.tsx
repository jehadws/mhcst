import { SeoHead } from '@/components/seo-head';
import { InnerHero } from '@/components/site/primitives/inner-hero';
import { SiteLayout } from '@/components/site/site-layout';
import { useSite } from '@/context/site-context';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Mail, MessageCircle } from 'lucide-react';

interface ApplicationState {
    status: string;
    rejected_reason?: string | null;
    submitted_at?: string | null;
    department?: string | null;
    level?: { year: number; section: string } | null;
}

interface StudentState {
    student_no: string;
    status: string;
    department?: string | null;
}

function StepRow({
    title,
    description,
    state,
    index,
}: {
    title: string;
    description: string;
    state: 'done' | 'current' | 'todo';
    index: number;
}) {
    return (
        <li className="grid grid-cols-[58px_1fr] gap-[18px] border-b border-line py-[24px] site-md:grid-cols-[70px_1fr]">
            <span
                className={cn(
                    'font-site-latin pt-1 text-[12px] font-bold',
                    state === 'done' ? 'text-teal-dark' : state === 'current' ? 'text-coral' : 'text-ink-muted/50',
                )}
                dir="ltr"
            >
                {state === 'done' ? '✓' : String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
                <h3
                    className={cn(
                        'm-0 mb-[6px] text-[19px] font-semibold tracking-[-0.03em]',
                        state === 'todo' && 'text-ink-muted/60',
                    )}
                >
                    {title}
                </h3>
                <p className="m-0 text-[13px] leading-[1.9] text-ink-muted">{description}</p>
            </div>
        </li>
    );
}

export default function ApplicationStatus({
    application,
    student,
}: {
    application?: ApplicationState | null;
    student?: StudentState | null;
}) {
    const { t, locale } = useSite();
    const isAr = locale === 'ar';
    const { props } = usePage<{ flash?: { success?: string } }>();
    const settings = useSiteSettings();

    const status = application?.status ?? 'submitted';
    const isRejected = status === 'rejected';
    const isAccepted = status === 'accepted';
    const isUnderReview = status === 'under_review';

    const dateFormat = new Intl.DateTimeFormat(isAr ? 'ar-LY' : 'en-GB', { dateStyle: 'long' });

    const steps: Array<{ title: string; description: string }> = [
        {
            title: isAr ? 'تم استلام الطلب' : 'Application received',
            description: isAr ? 'وصلنا طلبك وهو الآن بانتظار مراجعة الإدارة.' : 'Your application has been received and is awaiting review.',
        },
        {
            title: isAr ? 'قيد المراجعة' : 'Under review',
            description: isAr ? 'تقوم الإدارة بمراجعة طلبك الآن.' : 'The administration is reviewing your application.',
        },
        isRejected
            ? {
                  title: isAr ? 'لم يتم الاعتماد' : 'Not accepted',
                  description: isAr ? 'لم يتم اعتماد الطلب هذه المرة.' : 'The application was not accepted this time.',
              }
            : {
                  title: isAr ? 'القرار النهائي' : 'Final decision',
                  description: isAr ? 'سنخطرك بالنتيجة عبر بريدك الإلكتروني وصفحة «طلبي».' : 'We will notify you of the outcome by email and on this page.',
              },
    ];

    const stepState = (index: number): 'done' | 'current' | 'todo' => {
        if (isRejected || isAccepted) {
            return index < 2 ? 'done' : 'current';
        }
        if (isUnderReview) {
            return index === 0 ? 'done' : index === 1 ? 'current' : 'todo';
        }
        return index === 0 ? 'current' : 'todo';
    };

    const statusLabel = isAr
        ? ({
              submitted: 'مُرسل — بانتظار المراجعة',
              under_review: 'قيد المراجعة',
              accepted: 'مقبول',
              rejected: 'مرفوض',
          }[status] ?? status)
        : ({
              submitted: 'Submitted',
              under_review: 'Under review',
              accepted: 'Accepted',
              rejected: 'Rejected',
          }[status] ?? status);

    return (
        <>
            <SeoHead
                title={isAr ? 'طلبي' : 'My Application'}
                description={
                    isAr
                        ? `تابع حالة طلب التسجيل في ${t.brandFull} واعرف الخطوة التالية.`
                        : `Follow your admission application at ${t.brandFull} and know your next step.`
                }
            />
            <SiteLayout headerVariant="solid">
                <InnerHero
                    index="08"
                    eyebrow={t.applicationSteps.label}
                    title={isAr ? 'طلبي' : 'My application'}
                    intro={
                        isAr
                            ? 'تابع حالة طلب التسجيل واعرف ما هي خطوتك التالية في كل مرحلة.'
                            : 'Follow your application status and know exactly what to do next at every stage.'
                    }
                />

                <section className="bg-cream py-[70px] site-md:py-[100px]">
                    <div className="site-container">
                        <div className="mx-auto max-w-[860px] space-y-6">
                            {props.flash?.success ? (
                                <p className="flex items-start gap-3 border border-teal/40 bg-white px-[22px] py-[16px] text-[13px] text-ink">
                                    <CheckCircle2 className="mt-px size-4 shrink-0 text-teal-dark" aria-hidden="true" />
                                    {props.flash.success}
                                </p>
                            ) : null}

                            {isAccepted ? (
                                <div className="border-t-2 border-teal bg-white p-[26px] site-md:p-[34px]">
                                    <h2 className="m-0 mb-3 text-[24px] font-semibold tracking-[-0.04em] text-teal-dark">
                                        {isAr ? 'مبروك! تم قبول طلبك' : 'Congratulations — your application was accepted'}
                                    </h2>
                                    <p className="m-0 text-[14px] leading-[2] text-ink-muted">
                                        {isAr
                                            ? 'حسابك الأكاديمي مفعّل الآن ويمكنك اختيار موادك الدراسية.'
                                            : 'Your academic account is active and you can now pick your subjects.'}
                                        {student?.student_no ? (
                                            <span className="font-site-latin mt-3 block text-[15px] font-bold text-ink" dir="ltr">
                                                {isAr ? 'رقم القيد' : 'Student number'}: {student.student_no}
                                            </span>
                                        ) : null}
                                    </p>
                                    <Link
                                        href={route('dashboard.subject-registration.index')}
                                        className="mt-6 inline-flex items-center gap-2 border border-transparent bg-ink px-[21px] py-[14px] text-[13px] font-bold text-white transition-colors hover:bg-ink-2"
                                    >
                                        <BookOpen className="size-4" aria-hidden="true" />
                                        {isAr ? 'اختر موادك الدراسية' : 'Pick your subjects'}
                                        {isAr ? <ArrowLeft className="size-4" aria-hidden="true" /> : <ArrowRight className="size-4" aria-hidden="true" />}
                                    </Link>
                                </div>
                            ) : null}

                            {isRejected ? (
                                <div className="border-t-2 border-coral bg-white p-[26px] site-md:p-[34px]">
                                    <h2 className="m-0 mb-3 text-[24px] font-semibold tracking-[-0.04em] text-coral">
                                        {isAr ? 'لم يتم اعتماد طلبك' : 'Your application was not accepted'}
                                    </h2>
                                    {application?.rejected_reason ? (
                                        <p className="m-0 text-[14px] leading-[2] text-ink">
                                            <span className="font-bold">{isAr ? 'السبب: ' : 'Reason: '}</span>
                                            {application.rejected_reason}
                                        </p>
                                    ) : null}
                                    <p className="m-0 mt-3 text-[14px] leading-[2] text-ink-muted">
                                        {isAr
                                            ? 'يمكنك التواصل مع إدارة الكلية للاستفسار أو إعادة التقديم في دورة القبول القادمة.'
                                            : 'You can contact the administration for details, or reapply in the next admission round.'}
                                    </p>
                                    {settings.whatsapp_number ? (
                                        <a
                                            href={`https://wa.me/${String(settings.whatsapp_number).replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-4 inline-flex items-center gap-2 border-b border-ink pb-1 text-[13px] font-bold text-ink transition-colors hover:border-coral hover:text-coral"
                                        >
                                            <MessageCircle className="size-4" aria-hidden="true" />
                                            {isAr ? 'تواصل مع الإدارة' : 'Contact the administration'}
                                        </a>
                                    ) : null}
                                </div>
                            ) : null}

                            {application ? (
                                <div className="bg-white p-[26px] site-md:p-[38px]">
                                    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
                                        <div>
                                            <h2 className="m-0 text-[22px] font-semibold tracking-[-0.04em]">
                                                {isAr ? 'حالة الطلب' : 'Application status'}
                                            </h2>
                                            {application.submitted_at ? (
                                                <p className="m-0 mt-2 text-[12px] text-ink-muted">
                                                    {isAr ? 'تاريخ التقديم: ' : 'Submitted: '}
                                                    <span dir="ltr">{dateFormat.format(new Date(application.submitted_at))}</span>
                                                </p>
                                            ) : null}
                                        </div>
                                        <span
                                            className={cn(
                                                'border px-[12px] py-[7px] text-[10px] font-bold uppercase tracking-[0.1em]',
                                                isRejected && 'border-coral text-coral',
                                                isAccepted && 'border-teal text-teal-dark',
                                                !isRejected && !isAccepted && 'border-line text-ink-muted',
                                            )}
                                        >
                                            {statusLabel}
                                        </span>
                                    </div>

                                    {(application.department || application.level) && (
                                        <div className="flex flex-wrap gap-x-8 gap-y-2 border-b border-line py-6 text-[13px]">
                                            {application.department ? (
                                                <p className="m-0">
                                                    <span className="text-ink-muted">{isAr ? 'القسم: ' : 'Department: '}</span>
                                                    <span className="font-bold">{application.department}</span>
                                                </p>
                                            ) : null}
                                            {application.level ? (
                                                <p className="m-0">
                                                    <span className="text-ink-muted">{isAr ? 'المستوى: ' : 'Level: '}</span>
                                                    <span className="font-bold">
                                                        {isAr
                                                            ? `السنة ${application.level.year} — شعبة ${application.level.section}`
                                                            : `Year ${application.level.year} — Section ${application.level.section}`}
                                                    </span>
                                                </p>
                                            ) : null}
                                        </div>
                                    )}

                                    <ul className="m-0 mt-2 list-none p-0">
                                        {steps.map((step, index) => (
                                            <StepRow
                                                key={step.title}
                                                index={index}
                                                title={step.title}
                                                description={step.description}
                                                state={stepState(index)}
                                            />
                                        ))}
                                    </ul>

                                    <div className="mt-8 bg-cream px-[22px] py-[20px]">
                                        <p className="m-0 text-[10px] font-bold uppercase tracking-[0.12em] text-coral">
                                            {isAr ? 'ما الخطوة التالية؟' : 'What happens next?'}
                                        </p>
                                        <p className="m-0 mt-3 text-[13px] leading-[2] text-ink-muted">
                                            {isAr ? (
                                                <>
                                                    {isRejected ? (
                                                        <>راجع السبب أعلاه، وتواصل مع الإدارة إن كان لديك استفسار أو أعد التقديم عند فتح باب القبول.</>
                                                    ) : isAccepted ? (
                                                        <>كل ما عليك: تسجيل الدخول ثم اختيار موادك من صفحة «تسجيل المواد» قبل انتهاء المهلة.</>
                                                    ) : isUnderReview ? (
                                                        <>لا تحتاج لأي خطوة الآن — القرار قريب وسيصلك إشعار فور صدوره.</>
                                                    ) : (
                                                        <>انتظر مراجعة الإدارة. سيصلك بريد إلكتروني عند أي تحديث، ويمكنك متابعة الحالة من هذه الصفحة.</>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    {isRejected ? (
                                                        <>Review the reason above, contact the administration, or reapply when admission reopens.</>
                                                    ) : isAccepted ? (
                                                        <>Log in and pick your subjects from the subject registration page before the deadline.</>
                                                    ) : isUnderReview ? (
                                                        <>Nothing to do right now — the decision is coming and you will be notified.</>
                                                    ) : (
                                                        <>Wait for the administration&apos;s review. You will get an email on any update; check back here anytime.</>
                                                    )}
                                                </>
                                            )}
                                        </p>
                                    </div>

                                    <p className="m-0 mt-6 flex items-start gap-2 text-[11px] leading-[1.9] text-ink-muted">
                                        <Mail className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                                        {isAr
                                            ? 'أي تغيير على طلبك سيصلك أيضاً على بريدك الإلكتروني المسجّل.'
                                            : 'Any application update is also emailed to your registered address.'}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>
            </SiteLayout>
        </>
    );
}
