import { SeoHead } from '@/components/seo-head';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { PageHero } from '@/components/site/page-hero';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite } from '@/context/site-context';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MessageCircle,
  XCircle,
} from 'lucide-react';
import { ReactNode } from 'react';

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
  icon,
  title,
  description,
  state,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  state: 'done' | 'current' | 'todo';
}) {
  return (
    <li className="flex items-start gap-4">
      <div
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full border-2',
          state === 'done' && 'border-success bg-success text-success-foreground',
          state === 'current' && 'border-warning bg-warning/10 text-warning',
          state === 'todo' && 'border-muted-foreground/30 text-muted-foreground/50'
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 pt-1">
        <p
          className={cn(
            'text-sm font-bold',
            state === 'todo' ? 'text-muted-foreground/70' : 'text-foreground'
          )}
        >
          {title}
        </p>
        <p className="text-muted-foreground mt-0.5 text-sm leading-normal">{description}</p>
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

  const dateFormat = new Intl.DateTimeFormat(isAr ? 'ar-LY' : 'en-GB', {
    dateStyle: 'long',
  });

  const steps: Array<{
    icon: ReactNode;
    title: string;
    description: string;
  }> = [
    {
      icon: <FileText className="size-4" />,
      title: isAr ? 'تم استلام الطلب' : 'Application received',
      description: isAr
        ? 'وصلنا طلبك وهو الآن بانتظار مراجعة الإدارة.'
        : 'Your application has been received and is awaiting review.',
    },
    {
      icon: <Clock className="size-4" />,
      title: isAr ? 'قيد المراجعة' : 'Under review',
      description: isAr
        ? 'تقوم الإدارة بمراجعة طلبك الآن.'
        : 'The administration is reviewing your application.',
    },
    isRejected
      ? {
          icon: <XCircle className="size-4" />,
          title: isAr ? 'لم يتم الاعتماد' : 'Not accepted',
          description: isAr
            ? 'لم يتم اعتماد الطلب هذه المرة.'
            : 'The application was not accepted this time.',
        }
      : {
          icon: <CheckCircle2 className="size-4" />,
          title: isAr ? 'القرار النهائي' : 'Final decision',
          description: isAr
            ? 'سنخطرك بالنتيجة عبر بريدك الإلكتروني وصفحة «طلبي».'
            : 'We will notify you of the outcome by email and on this page.',
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
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageHero
            title={isAr ? 'طلبي' : 'My application'}
            description={
              isAr
                ? 'تابع حالة طلب التسجيل واعرف ما هي خطوتك التالية في كل مرحلة.'
                : 'Follow your application status and know exactly what to do next at every stage.'
            }
            crumbs={[{ label: isAr ? 'طلبي' : 'My application', href: '/student/application' }]}
          />

          <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            {props.flash?.success && (
              <div className="border-success/20 bg-success/10 text-success mb-6 flex items-start gap-3 rounded-xl border p-4 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <p className="font-medium">{props.flash.success}</p>
              </div>
            )}

            {/* Decision cards */}
            {isAccepted && (
              <div className="border-success/30 bg-success/10 mb-6 rounded-2xl border p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 size-5 shrink-0 text-success" />
                  <div>
                    <h2 className="font-display text-lg font-extrabold text-success">
                      {isAr ? 'مبروك! تم قبول طلبك' : 'Congratulations — your application was accepted'}
                    </h2>
                    <p className="text-foreground/80 mt-2 text-sm leading-normal">
                      {isAr
                        ? 'حسابك الأكاديمي مفعّل الآن ويمكنك اختيار موادك الدراسية.'
                        : 'Your academic account is active and you can now pick your subjects.'}
                      {student?.student_no && (
                        <span className="tabular-nums mt-2 block font-bold">
                          {isAr ? 'رقم القيد: ' : 'Student number: '}
                          {student.student_no}
                        </span>
                      )}
                    </p>
                    <Link
                      href={route('dashboard.subject-registration.index')}
                      className="bg-success text-success-foreground mt-4 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold shadow-md transition-transform hover:-translate-y-0.5"
                    >
                      <BookOpen className="size-4" />
                      {isAr ? 'اختر موادك الدراسية' : 'Pick your subjects'}
                      {isAr ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {isRejected && (
              <div className="border-destructive/30 bg-destructive/10 mb-6 rounded-2xl border p-6">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-1 size-5 shrink-0 text-destructive" />
                  <div>
                    <h2 className="font-display text-lg font-extrabold text-destructive">
                      {isAr ? 'لم يتم اعتماد طلبك' : 'Your application was not accepted'}
                    </h2>
                    {application?.rejected_reason && (
                      <p className="text-foreground/80 mt-2 text-sm leading-normal">
                        <span className="font-bold">{isAr ? 'السبب: ' : 'Reason: '}</span>
                        {application.rejected_reason}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-3 text-sm leading-normal">
                      {isAr
                        ? 'يمكنك التواصل مع إدارة الكلية للاستفسار أو إعادة التقديم في دورة القبول القادمة.'
                        : 'You can contact the administration for details, or reapply in the next admission round.'}
                    </p>
                    {settings.whatsapp_number && (
                      <a
                        href={`https://wa.me/${String(settings.whatsapp_number).replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary mt-3 inline-flex items-center gap-2 text-sm font-bold hover:underline"
                      >
                        <MessageCircle className="size-4" />
                        {isAr ? 'تواصل مع الإدارة' : 'Contact the administration'}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Application summary */}
            {application && (
              <div className="border-border bg-card rounded-2xl border p-6 shadow-md sm:p-10">
                <div className="border-border flex flex-wrap items-center justify-between gap-4 border-b pb-6">
                  <div>
                    <h2 className="font-display text-xl font-extrabold">
                      {isAr ? 'حالة الطلب' : 'Application status'}
                    </h2>
                    {application.submitted_at && (
                      <p className="text-muted-foreground mt-1 text-sm">
                        {isAr ? 'تاريخ التقديم: ' : 'Submitted: '}
                        <span className="tabular-nums">{dateFormat.format(new Date(application.submitted_at))}</span>
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold',
                      isRejected && 'bg-destructive/10 text-destructive',
                      isAccepted && 'bg-success/10 text-success',
                      isUnderReview && 'bg-warning/10 text-warning',
                      !isRejected && !isAccepted && !isUnderReview && 'bg-primary/10 text-primary'
                    )}
                  >
                    {isRejected && <XCircle className="size-3.5" />}
                    {isAccepted && <CheckCircle2 className="size-3.5" />}
                    {isUnderReview && <Clock className="size-3.5" />}
                    {!isRejected && !isAccepted && !isUnderReview && <FileText className="size-3.5" />}
                    {isAr
                      ? {
                          submitted: 'مُرسل — بانتظار المراجعة',
                          under_review: 'قيد المراجعة',
                          accepted: 'مقبول',
                          rejected: 'مرفوض',
                        }[status] ?? status
                      : {
                          submitted: 'Submitted',
                          under_review: 'Under review',
                          accepted: 'Accepted',
                          rejected: 'Rejected',
                        }[status] ?? status}
                  </span>
                </div>

                {(application.department || application.level) && (
                  <div className="border-border mt-6 flex flex-wrap gap-x-8 gap-y-2 border-b pb-6 text-sm">
                    {application.department && (
                      <p>
                        <span className="text-muted-foreground">{isAr ? 'القسم: ' : 'Department: '}</span>
                        <span className="font-bold">{application.department}</span>
                      </p>
                    )}
                    {application.level && (
                      <p>
                        <span className="text-muted-foreground">{isAr ? 'المستوى: ' : 'Level: '}</span>
                        <span className="font-bold">
                          {isAr
                            ? `السنة ${application.level.year} — شعبة ${application.level.section}`
                            : `Year ${application.level.year} — Section ${application.level.section}`}
                        </span>
                      </p>
                    )}
                  </div>
                )}

                {/* Progress timeline */}
                <ol className="mt-6 space-y-5">
                  {steps.map((step, index) => (
                    <StepRow key={step.title} icon={step.icon} title={step.title} description={step.description} state={stepState(index)} />
                  ))}
                </ol>

                {/* Next action per state */}
                <div className="bg-muted/50 mt-8 rounded-xl p-5">
                  <p className="text-muted-foreground text-xs font-bold uppercase tracking-wide">
                    {isAr ? 'ما الخطوة التالية؟' : 'What happens next?'}
                  </p>
                  <p className="text-foreground mt-2 text-sm leading-normal">
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
                          <>Wait for the administration's review. You will get an email on any update; check back here anytime.</>
                        )}
                      </>
                    )}
                  </p>
                </div>

                <p className="text-muted-foreground mt-6 flex items-center gap-2 text-xs">
                  <Mail className="size-3.5 shrink-0" />
                  {isAr
                    ? 'أي تغيير على طلبك سيصلك أيضاً على بريدك الإلكتروني المسجّل.'
                    : 'Any application update is also emailed to your registered address.'}
                </p>
              </div>
            )}
          </section>
        </main>
        <SiteFooter />
        <FloatingButtons />
      </div>
    </>
  );
}
