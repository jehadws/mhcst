import {
  PendingApprovalBanner,
  StudentNotLinkedCard,
  StudentProfileHeader,
  StudentScheduleList,
  type StudentProfile,
  type StudentScheduleSession,
} from '@/components/dashboard/student';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSite } from '@/context/site-context';
import AppLayout from '@/layouts/app-layout';
import { dayLabel, enrollmentStatusLabel, semesterLabel, termLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, CalendarCheck, CalendarDays, ClipboardList, Clock3, Info } from 'lucide-react';

interface TermSubject {
  id: number;
  code: string;
  name: string;
  credits: number;
  has_lab: boolean;
}

interface TermEnrollment {
  id: number;
  status: string;
  source: string;
  withdrawn_reason?: string | null;
  subject: TermSubject | null;
  grade?: { total: number | null; grade_letter: string | null } | null;
  attendance: { total: number; absent: number; rate: number | null };
}

interface MyTermProps {
  student: StudentProfile | null;
  term: { academic_year: string | null; semester: string | null };
  registration_window: {
    open: boolean;
    student_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
    add_drop_deadline: string | null;
    self_drop_open: boolean;
  };
  enrollments: TermEnrollment[];
  sessions: StudentScheduleSession[];
}

export default function MyTerm({ student, term, registration_window: registrationWindow, enrollments, sessions }: MyTermProps) {
  const { t, locale } = useSite();
  const c = t.cms;
  const termC = c.myTerm;

  const termConfigured = term.academic_year !== null && term.semester !== null;
  const pending = enrollments.filter((enrollment) => enrollment.status === 'pending');

  const dayGroups = Object.keys(c.labels.days)
    .map((day) => ({ day, daySessions: sessions.filter((session) => session.day === day) }))
    .filter((group) => group.daySessions.length > 0);

  const statusBadge = (status: string) => {
    const label = enrollmentStatusLabel(c, status);
    switch (status) {
      case 'pending':
        return <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">{label}</span>;
      case 'active':
        return <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">{label}</span>;
      case 'completed':
        return <span className="rounded-full bg-info/10 px-2.5 py-0.5 text-xs font-semibold text-info">{label}</span>;
      case 'dropped':
      case 'withdrawn':
        return <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">{label}</span>;
      default:
        return <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">{label}</span>;
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t.dashboard.sidebar.items.dashboard, href: '/dashboard' },
    { title: termC.title, href: '/dashboard/my-term' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={termC.title} />
      <div className="space-y-6 px-4 py-6">
        {student === null ? (
          <StudentNotLinkedCard locale={locale} />
        ) : (
          <div className="space-y-6">
            {student.status === 'pending' && <PendingApprovalBanner locale={locale} />}
            <StudentProfileHeader locale={locale} student={student} transcriptUrl={route('dashboard.my-transcript')} />

            <div className="flex flex-col gap-2">
              <h2 className="font-display text-2xl font-extrabold leading-snug tracking-tight">{termC.title}</h2>
              <p className="text-sm text-muted-foreground">{termC.subtitle}</p>
            </div>

            {!termConfigured ? (
              <div className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
                <Info className="mt-1 h-4 w-4 shrink-0" />
                <p>{termC.termNotConfigured}</p>
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex-row items-center justify-between space-y-0">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CalendarDays className="h-4 w-4" />
                        {c.myStudies.currentTerm}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {termLabel(c, term)} • {semesterLabel(c, term.semester ?? '')}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild className="gap-2">
                      <Link href="/dashboard/subject-registration">
                        <ClipboardList className="h-4 w-4" />
                        {termC.registerCta}
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
                    {registrationWindow.add_drop_deadline && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="h-3.5 w-3.5" />
                        {c.registration.deadlineLabel.replace('{date}', registrationWindow.add_drop_deadline)}
                      </span>
                    )}
                    {!registrationWindow.open && (
                      <span className="text-warning">{c.registration.blockedClosed}</span>
                    )}
                  </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-5">
                  <Card className="lg:col-span-3">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {termC.enrolledSubjects}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {enrollments.length === 0 ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">{termC.noSubjects}</p>
                      ) : (
                        enrollments.map((enrollment) => (
                          <div key={enrollment.id} className="rounded-xl border p-3 text-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate font-medium">
                                  {enrollment.subject ? `${enrollment.subject.name} (${enrollment.subject.code})` : c.common.notSpecified}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {enrollment.subject ? `${enrollment.subject.credits} ${c.registration.credits}` : ''}
                                  {enrollment.subject?.has_lab ? ` • ${c.registration.lab}` : ''}
                                </p>
                              </div>
                              {statusBadge(enrollment.status)}
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-2 text-xs text-muted-foreground">
                              <span>
                                {termC.grade}:{' '}
                                {enrollment.grade?.total !== null && enrollment.grade?.total !== undefined
                                  ? <span className="tabular-nums font-semibold text-foreground">{enrollment.grade.total}{enrollment.grade.grade_letter ? ` (${enrollment.grade.grade_letter})` : ''}</span>
                                  : c.myStudies.notGraded}
                              </span>
                              {enrollment.attendance.total > 0 && (
                                <span>
                                  {termC.attendance}:{' '}
                                  <span className="tabular-nums">
                                    {termC.attendanceRate.replace('{rate}', String(enrollment.attendance.rate ?? 0))}
                                  </span>
                                  {enrollment.attendance.absent > 0
                                    ? ` • ${termC.attendanceAbsent.replace('{count}', String(enrollment.attendance.absent))}`
                                    : ''}
                                </span>
                              )}
                            </div>
                            {enrollment.status === 'withdrawn' && enrollment.withdrawn_reason && (
                              <p className="mt-2 border-t pt-2 text-xs text-destructive">
                                {termC.withdrawnReason}: {enrollment.withdrawn_reason}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <div className="space-y-6 lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CalendarCheck className="h-4 w-4" />
                          {termC.pendingRequests}
                        </CardTitle>
                        <CardDescription>{termC.pendingRequestsHint}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {pending.length === 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">{c.common.noRecords}</p>
                        ) : (
                          pending.map((enrollment) => (
                            <div key={enrollment.id} className="flex items-center justify-between gap-3 rounded-xl border p-3 text-sm">
                              <p className="min-w-0 truncate">
                                {enrollment.subject ? `${enrollment.subject.name} (${enrollment.subject.code})` : c.common.notSpecified}
                              </p>
                              {statusBadge(enrollment.status)}
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          {termC.schedule}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {dayGroups.length === 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">{c.myStudies.noClasses}</p>
                        ) : (
                          dayGroups.map(({ day, daySessions }) => (
                            <div key={day}>
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{dayLabel(c, day)}</p>
                              <StudentScheduleList sessions={daySessions} locale={locale} />
                            </div>
                          ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
