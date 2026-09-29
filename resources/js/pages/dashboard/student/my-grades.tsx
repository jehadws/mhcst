import { PendingApprovalBanner, StudentNotLinkedCard, StudentProfileHeader, type StudentProfile } from '@/components/dashboard/student';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSite } from '@/context/site-context';
import AppLayout from '@/layouts/app-layout';
import { enrollmentStatusLabel, semesterLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Award, FileText } from 'lucide-react';

interface GradeDetails {
  midterm: string | null;
  final: string | null;
  assignments: string | null;
  projects: string | null;
  participation: string | null;
  total: string | null;
  grade_letter: string | null;
  entered_at: string | null;
}

interface GradeRow {
  id: number;
  status: string;
  academic_year: string;
  semester: string;
  subject: { id: number; code: string; name: string; credits: number } | null;
  grade: GradeDetails | null;
}

interface MyGradesProps {
  student: StudentProfile | null;
  grades: GradeRow[];
  gpa: number | null;
}

export default function MyGrades({ student, grades, gpa }: MyGradesProps) {
  const { t, locale } = useSite();
  const c = t.cms;

  const termGroups = new Map<string, GradeRow[]>();
  for (const row of grades) {
    const key = `${row.academic_year} · ${semesterLabel(c, row.semester)}`;
    termGroups.set(key, [...(termGroups.get(key) ?? []), row]);
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t.dashboard.sidebar.items.dashboard, href: '/dashboard' },
    { title: c.myStudies.grades, href: '/dashboard/my-grades' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={c.myStudies.grades} />
      <div className="space-y-6 px-4 py-6">
        {student === null ? (
          <StudentNotLinkedCard locale={locale} />
        ) : (
          <div className="space-y-6">
            {student.status === 'pending' && <PendingApprovalBanner locale={locale} />}
            <StudentProfileHeader locale={locale} student={student} transcriptUrl={route('dashboard.my-transcript')} />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-4 w-4" />
                  {c.transcript.gpa}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{gpa === null ? '—' : gpa.toFixed(2)}</p>
              </CardContent>
            </Card>

            {termGroups.size === 0 ? (
              <Card>
                <CardContent className="text-muted-foreground flex flex-col items-center gap-2 p-8 text-center">
                  <FileText className="h-8 w-8 opacity-50" />
                  {c.common.noRecords}
                </CardContent>
              </Card>
            ) : (
              [...termGroups.entries()].map(([termKey, termGrades]) => (
                <Card key={termKey}>
                  <CardHeader>
                    <CardTitle className="text-base">{termKey}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="divide-y">
                      {termGrades.map((row) => (
                        <li key={row.id} className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{row.subject?.name ?? c.common.notSpecified}</p>
                            <p className="text-muted-foreground text-xs">{row.subject?.code}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge variant={row.status === 'completed' ? 'secondary' : 'outline'}>{enrollmentStatusLabel(c, row.status)}</Badge>
                            {row.grade?.total ? (
                              <>
                                <span className="dir-ltr text-sm font-semibold">{Number(row.grade.total)}</span>
                                {row.grade.grade_letter && <Badge>{row.grade.grade_letter}</Badge>}
                              </>
                            ) : (
                              <span className="text-muted-foreground text-sm">{c.myStudies.notGraded}</span>
                            )}
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
