import { PendingApprovalBanner, StudentNotLinkedCard, StudentProfileHeader, type StudentProfile } from '@/components/dashboard/student';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSite } from '@/context/site-context';
import AppLayout from '@/layouts/app-layout';
import { enrollmentStatusLabel, semesterLabel, termLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, ClipboardList, Info } from 'lucide-react';

interface CourseSubject {
  id: number;
  code: string;
  name: string;
  credits: number;
  has_lab: boolean;
}

interface CourseEnrollment {
  id: number;
  status: string;
  academic_year: string;
  semester: string;
  subject: CourseSubject | null;
}

interface MyCoursesProps {
  student: StudentProfile | null;
  enrollments: CourseEnrollment[];
  term: { academic_year: string | null; semester: string | null };
  registration_window: { open: boolean; student_active: boolean };
}

export default function MyCourses({ student, enrollments, term, registration_window: registrationWindow }: MyCoursesProps) {
  const { t, locale } = useSite();
  const c = t.cms;
  const reg = c.registration;

  const termConfigured = term.academic_year !== null && term.semester !== null;
  const canRegister = termConfigured && registrationWindow.open && registrationWindow.student_active;

  const termGroups = new Map<string, CourseEnrollment[]>();
  for (const enrollment of enrollments) {
    const key = `${enrollment.academic_year} · ${semesterLabel(c, enrollment.semester)}`;
    termGroups.set(key, [...(termGroups.get(key) ?? []), enrollment]);
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t.dashboard.sidebar.items.dashboard, href: '/dashboard' },
    { title: c.myStudies.courses, href: '/dashboard/my-courses' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={c.myStudies.courses} />
      <div className="space-y-6 px-4 py-6">
        {student === null ? (
          <StudentNotLinkedCard locale={locale} />
        ) : (
          <div className="space-y-6">
            {student.status === 'pending' && <PendingApprovalBanner locale={locale} />}
            <StudentProfileHeader locale={locale} student={student} transcriptUrl={route('dashboard.my-transcript')} />

            <Card>
              <CardHeader>
                <CardTitle className="text-base">{c.myStudies.currentTerm}</CardTitle>
                <CardDescription>{termLabel(c, term)}</CardDescription>
              </CardHeader>
              <CardContent>
                {canRegister ? (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted-foreground text-sm">{c.myStudies.pickSubjects}</p>
                    <Button asChild className="shrink-0 gap-2">
                      <Link href={route('dashboard.subject-registration.index')}>
                        <ClipboardList className="h-4 w-4" />
                        {reg.title}
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 shrink-0" />
                    {termConfigured ? reg.noWindow : reg.blockedNoTerm}
                  </p>
                )}
              </CardContent>
            </Card>

            {termGroups.size === 0 ? (
              <Card>
                <CardContent className="text-muted-foreground flex flex-col items-center gap-2 p-8 text-center">
                  <BookOpen className="h-8 w-8 opacity-50" />
                  {c.common.noRecords}
                </CardContent>
              </Card>
            ) : (
              [...termGroups.entries()].map(([termKey, termEnrollments]) => (
                <Card key={termKey}>
                  <CardHeader>
                    <CardTitle className="text-base">{termKey}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="divide-y">
                      {termEnrollments.map((enrollment) => (
                        <li
                          key={enrollment.id}
                          className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{enrollment.subject?.name ?? c.common.notSpecified}</p>
                            <p className="text-muted-foreground text-xs">
                              {enrollment.subject?.code}
                              {enrollment.subject ? ` · ${enrollment.subject.credits} ${reg.credits}` : ''}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {enrollment.subject?.has_lab && <Badge variant="outline">{reg.lab}</Badge>}
                            <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                              {enrollmentStatusLabel(c, enrollment.status)}
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
