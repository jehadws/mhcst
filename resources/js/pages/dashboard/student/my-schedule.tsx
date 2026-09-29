import {
  PendingApprovalBanner,
  StudentNotLinkedCard,
  StudentProfileHeader,
  StudentScheduleList,
  type StudentProfile,
  type StudentScheduleSession,
} from '@/components/dashboard/student';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSite } from '@/context/site-context';
import AppLayout from '@/layouts/app-layout';
import { dayLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CalendarDays } from 'lucide-react';

interface MyScheduleProps {
  student: StudentProfile | null;
  sessions: StudentScheduleSession[];
}

export default function MySchedule({ student, sessions }: MyScheduleProps) {
  const { t, locale } = useSite();
  const c = t.cms;

  const dayGroups = Object.keys(c.labels.days)
    .map((day) => ({ day, daySessions: sessions.filter((session) => session.day === day) }))
    .filter((group) => group.daySessions.length > 0);

  const breadcrumbs: BreadcrumbItem[] = [
    { title: t.dashboard.sidebar.items.dashboard, href: '/dashboard' },
    { title: c.myStudies.schedule, href: '/dashboard/my-schedule' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={c.myStudies.schedule} />
      <div className="space-y-6 px-4 py-6">
        {student === null ? (
          <StudentNotLinkedCard locale={locale} />
        ) : (
          <div className="space-y-6">
            {student.status === 'pending' && <PendingApprovalBanner locale={locale} />}
            <StudentProfileHeader locale={locale} student={student} transcriptUrl={route('dashboard.my-transcript')} />

            {dayGroups.length === 0 ? (
              <Card>
                <CardContent className="text-muted-foreground flex flex-col items-center gap-2 p-8 text-center">
                  <CalendarDays className="h-8 w-8 opacity-50" />
                  {c.myStudies.noClasses}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                {dayGroups.map(({ day, daySessions }) => (
                  <Card key={day}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <CalendarDays className="h-4 w-4" />
                        {dayLabel(c, day)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StudentScheduleList sessions={daySessions} locale={locale} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
