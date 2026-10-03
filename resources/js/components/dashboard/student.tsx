import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cmsBilingual, sessionTypeLabel } from '@/lib/cms-helpers';
import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, CalendarDays, CalendarRange, ClipboardList, FileSpreadsheet, FileText, XCircle } from 'lucide-react';

export interface StudentScheduleSession {
  id: number;
  start_time: string;
  end_time: string;
  room?: string | null;
  type?: string;
  day?: string;
  subject?: { id?: number; name: string; code?: string } | null;
  teacher?: { id?: number; name: string } | null;
}

export interface StudentProfile {
  id: number;
  name: string;
  student_no: string;
  status?: string;
  department?: string | null;
  level?: { year: number; section: string } | null;
}

/**
 * Shown when a dashboard user has no linked CmsStudent profile.
 */
export function StudentNotLinkedCard({ locale }: { locale: string }) {
  return (
    <Card>
      <CardContent className="text-muted-foreground flex flex-col items-center gap-2 p-8 text-center">
        <BookOpen className="h-8 w-8 opacity-50" />
        {cmsBilingual(locale).myStudies.notLinked}
      </CardContent>
    </Card>
  );
}

/**
 * Forward-compatible banner for the 5.3/5.4 registration approval flow:
 * rendered when the linked student profile has status 'pending'.
 */
export function PendingApprovalBanner({ locale }: { locale: string }) {
  const c = cmsBilingual(locale);

  return (
    <div className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
      <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
      <div>
        <p className="font-medium">{c.myStudies.pendingApproval}</p>
        <p className="mt-1 opacity-90">{c.myStudies.pendingApprovalHint}</p>
      </div>
    </div>
  );
}

export interface ApplicationSummary {
  status: string;
  rejected_reason?: string | null;
}

/**
 * The applicant's "طلبي" banner on the dashboard: current admission state and
 * a link to the dedicated status page. Covers the phase-2 flow where the
 * applicant may not have a cms_students row yet at all.
 */
export function ApplicationStatusBanner({ locale, application }: { locale: string; application: ApplicationSummary }) {
  const ar = locale === 'ar';
  const rejected = application.status === 'rejected';

  const stateLabel = ar
    ? {
        submitted: 'طلبك مُرسل وبانتظار مراجعة الإدارة',
        under_review: 'طلبك قيد المراجعة الآن',
        rejected: 'لم يتم اعتماد طلبك',
      }[application.status] ?? 'طلبك قيد المتابعة'
    : {
        submitted: 'Your application is submitted and awaiting review',
        under_review: 'Your application is under review',
        rejected: 'Your application was not accepted',
      }[application.status] ?? 'Application in progress';

  return (
    <div
      className={
        rejected
          ? 'border-destructive/30 bg-destructive/10 flex items-start gap-3 rounded-xl border p-4 text-sm text-destructive'
          : 'border-warning/20 bg-warning/10 flex items-start gap-3 rounded-xl border p-4 text-sm text-warning'
      }
    >
      {rejected ? <XCircle className="mt-1 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />}
      <div className="min-w-0 flex-1">
        <p className="font-medium">{stateLabel}</p>
        {rejected && application.rejected_reason && (
          <p className="mt-1 opacity-90">
            {ar ? 'السبب: ' : 'Reason: '}
            {application.rejected_reason}
          </p>
        )}
        <Link
          href="/student/application"
          className="mt-2 inline-flex items-center gap-1.5 font-bold underline-offset-4 hover:underline"
        >
          <FileText className="h-4 w-4" />
          {ar ? 'تابع طلبك — «طلبي»' : 'Follow your application'}
        </Link>
      </div>
    </div>
  );
}

/**
 * Shown on the dashboard for a logged-in applicant whose application has not
 * been accepted yet (no cms_students row, or still pending after backfill).
 */
export function ApplicantDashboardCard({ locale, application }: { locale: string; application: ApplicationSummary }) {
  const ar = locale === 'ar';

  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-3 p-8">
        <div className="text-primary bg-primary/10 flex size-12 items-center justify-center rounded-full">
          <FileText className="h-6 w-6" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold leading-snug">
            {ar ? 'طلب تسجيلك قيد المتابعة' : 'Your admission application'}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {ar
              ? 'بمجرد اعتماد الإدارة سيصبح حسابك حساب طالب كامل مع تسجيل المواد والدرجات والجدول.'
              : 'Once the administration accepts it, your account becomes a full student account with subjects, grades, and schedule.'}
          </p>
        </div>
        <ApplicationStatusBanner locale={locale} application={application} />
        <Button asChild className="mt-2 gap-2">
          <Link href="/student/application">
            {ar ? 'فتح صفحة «طلبي»' : 'Open my application'}
            {ar ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Shared header for the student "my studies" pages and the dashboard
 * overview: name, student number, department, year/section, and the
 * transcript download button.
 */
export function StudentProfileHeader({ locale, student, transcriptUrl }: { locale: string; student: StudentProfile; transcriptUrl?: string | null }) {
  const c = cmsBilingual(locale);
  const yearSection = student.level
    ? c.student.yearSectionValue.replace('{year}', String(student.level.year)).replace('{section}', student.level.section)
    : null;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-extrabold leading-snug tracking-tight">{student.name}</h1>
        <p className="text-muted-foreground tabular-nums text-sm">
          {student.student_no}
          {student.department ? ` · ${student.department}` : ''}
          {yearSection ? ` · ${yearSection}` : ''}
        </p>
      </div>
      {transcriptUrl && (
        <Button variant="outline" asChild className="shrink-0 gap-2">
          <a href={transcriptUrl} target="_blank" rel="noopener noreferrer">
            <FileSpreadsheet className="h-4 w-4" />
            {c.myStudies.transcript}
          </a>
        </Button>
      )}
    </div>
  );
}

/**
 * Compact schedule rows shared by the dashboard "today" card and the
 * weekly my-schedule page.
 */
export function StudentScheduleRow({ session, locale }: { session: StudentScheduleSession; locale: string }) {
  const c = cmsBilingual(locale);

  return (
    <li className="flex items-start justify-between gap-3 border-b pb-2 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{session.subject?.name ?? c.common.notSpecified}</p>
        <p className="text-muted-foreground text-xs">
          {session.teacher?.name ?? c.common.unassigned}
          {session.room ? ` · ${session.room}` : ''}
          {session.type ? ` · ${sessionTypeLabel(c, session.type)}` : ''}
        </p>
      </div>
      <span className="text-muted-foreground dir-ltr shrink-0 text-sm">
        {session.start_time}–{session.end_time}
      </span>
    </li>
  );
}

export function StudentScheduleList({ sessions, locale, emptyLabel }: { sessions: StudentScheduleSession[]; locale: string; emptyLabel?: string }) {
  const c = cmsBilingual(locale);

  if (sessions.length === 0) {
    return <p className="text-muted-foreground py-10 text-center text-sm">{emptyLabel ?? c.myStudies.noClasses}</p>;
  }

  return (
    <ul className="space-y-2">
      {sessions.map((session) => (
        <StudentScheduleRow key={session.id} session={session} locale={locale} />
      ))}
    </ul>
  );
}

/**
 * Quick-navigation strip for the student dashboard overview.
 */
export function StudentQuickLinks({ locale }: { locale: string }) {
  const c = cmsBilingual(locale);

  return (
    <div className="flex flex-wrap gap-2">
      {[
        { title: c.myTerm.title, url: route('dashboard.my-term'), icon: CalendarRange },
        { title: c.myStudies.courses, url: route('dashboard.my-courses'), icon: BookOpen },
        { title: c.myStudies.schedule, url: route('dashboard.my-schedule'), icon: CalendarDays },
        { title: c.myStudies.grades, url: route('dashboard.my-grades'), icon: ClipboardList },
        { title: c.nav.subjectRegistration, url: route('dashboard.subject-registration.index'), icon: ClipboardList },
      ].map((item) => (
        <Button key={item.url} variant="outline" size="sm" asChild className="gap-2">
          <Link href={item.url}>
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        </Button>
      ))}
    </div>
  );
}

export function StudentViewAllLink({ locale, href }: { locale: string; href: string }) {
  return (
    <Link href={href} className="text-primary text-sm hover:underline">
      {cmsBilingual(locale).common.viewAll}
    </Link>
  );
}
