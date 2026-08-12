import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useSite } from '@/context/site-context';
import AppLayout from '@/layouts/app-layout';
import { ContentDashboardView, StudentDashboardView, TeacherDashboardView } from '@/components/dashboard/role-dashboards';
import { BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, BookOpen, Building2, Calendar, CalendarCheck, ClipboardList, GraduationCap, Users, UserCheck } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

const COLORS = {
  primary: 'hsl(var(--primary))',
  emerald: 'hsl(160 84% 39%)',
  amber: 'hsl(38 92% 50%)',
  sky: 'hsl(199 89% 48%)',
  violet: 'hsl(258 90% 66%)',
};

interface CmsStudent {
  id: number;
  student_no: string;
  name: string;
  email?: string;
  created_at: string;
  level?: {
    year: number;
    section: string;
    department?: {
      name: string;
    };
  };
}

interface CmsGrade {
  id: number;
  total?: number;
  grade_letter?: string;
  entered_at?: string;
  enrollment?: {
    student?: { id: number; name: string; student_no: string };
    subject?: { id: number; code: string; name: string };
  };
}

interface CmsSchedule {
  id: number;
  day: string;
  start_time: string;
  end_time: string;
  room?: string;
  subject?: {
    name: string;
    code: string;
  };
  teacher?: {
    name: string;
  };
  level?: {
    year: number;
    section: string;
    department?: {
      name: string;
    };
  };
}

export default function Dashboard() {
  const pageProps = usePage<{
    dashboardRole?: 'admin' | 'teacher' | 'student' | 'content';
    stats?: Record<string, number | null>;
    studentsByDepartment?: Array<{ name: string; count: number }>;
    recentStudents?: CmsStudent[];
    recentGrades?: CmsGrade[] | Array<{ subject?: string; code?: string; total?: number; grade_letter?: string }>;
    todaySchedules?: CmsSchedule[];
    attendanceByMonth?: Array<{ month: string; value: number }>;
    teacherProfile?: { name: string; specialization?: string | null };
    teacherClasses?: Array<{ id: number; code: string; name: string; student_count: number; pending_grades: number }>;
    studentProfile?: { id: number; name: string; student_no: string; department?: string | null } | null;
    transcriptUrl?: string | null;
  }>().props;

  const {
    dashboardRole = 'admin',
    stats = {},
    studentsByDepartment = [],
    recentStudents = [],
    recentGrades = [],
    todaySchedules = [],
    attendanceByMonth = [],
    teacherProfile,
    teacherClasses = [],
    studentProfile,
    transcriptUrl,
  } = pageProps;

  const { t, locale } = useSite();
  const d = t.dashboard;
  const breadcrumbs: BreadcrumbItem[] = [{ title: d.sidebar.items.dashboard, href: '/dashboard' }];

  const numberFmt = new Intl.NumberFormat(locale === 'ar' ? 'ar-LY' : 'en-GB');

  const attendanceChartConfig = {
    records: { label: locale === 'ar' ? 'سجلات الحضور' : 'Attendance Records', color: COLORS.emerald },
  };
  const deptChartConfig = {
    students: { label: locale === 'ar' ? 'الطلاب' : 'Students', color: COLORS.primary },
  };

  const statCards = [
    {
      label: locale === 'ar' ? 'الطلاب الأكاديميون' : 'Academic Students',
      value: numberFmt.format((stats.students_count as number) ?? 0),
      icon: GraduationCap,
      color: COLORS.primary,
      delta: stats.students_delta as number | null | undefined,
    },
    {
      label: locale === 'ar' ? 'أعضاء هيئة التدريس' : 'Teaching Staff',
      value: numberFmt.format((stats.teachers_count as number) ?? 0),
      icon: UserCheck,
      color: COLORS.emerald,
      delta: null,
    },
    {
      label: locale === 'ar' ? 'الأقسام الأكاديمية' : 'Departments',
      value: numberFmt.format((stats.departments_count as number) ?? 0),
      icon: Building2,
      color: COLORS.amber,
      delta: null,
    },
    {
      label: locale === 'ar' ? 'المواد الدراسية' : 'Subjects',
      value: numberFmt.format((stats.subjects_count as number) ?? 0),
      icon: BookOpen,
      color: COLORS.sky,
      delta: null,
    },
    {
      label: locale === 'ar' ? 'التسجيلات الفعالة' : 'Active Enrollments',
      value: numberFmt.format((stats.enrollments_count as number) ?? 0),
      icon: ClipboardList,
      color: COLORS.violet,
      delta: null,
    },
    {
      label: locale === 'ar' ? 'حضور اليوم' : "Today's Attendance",
      value: numberFmt.format((stats.attendance_today_count as number) ?? 0),
      icon: CalendarCheck,
      color: COLORS.amber,
      delta: null,
    },
  ];

  const renderRoleView = () => {
    if (dashboardRole === 'teacher' && teacherProfile) {
      return (
        <TeacherDashboardView
          locale={locale}
          teacherProfile={teacherProfile}
          stats={{
            classes_count: (stats.classes_count as number) ?? 0,
            students_count: (stats.students_count as number) ?? 0,
            pending_grades_count: (stats.pending_grades_count as number) ?? 0,
            today_classes_count: (stats.today_classes_count as number) ?? 0,
          }}
          todaySchedules={todaySchedules}
          teacherClasses={teacherClasses}
        />
      );
    }

    if (dashboardRole === 'student') {
      return (
        <StudentDashboardView
          locale={locale}
          studentProfile={studentProfile ?? null}
          stats={{
            enrolled_subjects: (stats.enrolled_subjects as number) ?? 0,
            gpa: stats.gpa as number | null,
            attendance_rate: stats.attendance_rate as number | null,
            today_classes_count: (stats.today_classes_count as number) ?? 0,
          }}
          todaySchedules={todaySchedules}
          recentGrades={recentGrades as Array<{ subject?: string; code?: string; total?: number; grade_letter?: string }>}
          transcriptUrl={transcriptUrl}
        />
      );
    }

    if (dashboardRole === 'content') {
      return (
        <ContentDashboardView
          locale={locale}
          stats={{
            blog_posts_count: (stats.blog_posts_count as number) ?? 0,
            published_posts_count: (stats.published_posts_count as number) ?? 0,
            faqs_count: (stats.faqs_count as number) ?? 0,
            testimonials_count: (stats.testimonials_count as number) ?? 0,
          }}
        />
      );
    }

    return null;
  };

  const adminView = renderRoleView() === null;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={locale === 'ar' ? 'لوحة التحكم الكلية' : 'College Dashboard'} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        {adminView ? (
          <>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {locale === 'ar' ? 'مرحباً بك في النظام الأكاديمي' : 'Welcome to Academic Dashboard'}
          </h1>
          <p className="text-muted-foreground text-sm">
            {locale === 'ar' ? 'نظرة عامة على الكلية والأحصائيات الأكاديمية' : 'Overview of college statistics and schedules'}
          </p>
        </div>

        {/* ─── Stat Cards ─── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((card) => (
            <Card key={card.label} className="relative overflow-hidden">
              <CardContent className="flex items-center justify-between p-5">
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-sm font-medium">{card.label}</p>
                  <p className="text-2xl font-bold tabular-nums">{card.value}</p>
                  {card.delta !== null && card.delta !== undefined && (
                    <p
                      className={`flex items-center gap-1 text-xs font-medium ${card.delta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}
                    >
                      <ArrowUpRight className={`h-3.5 w-3.5 ${card.delta < 0 ? 'rotate-90' : ''}`} />
                      {Math.abs(card.delta)}% {locale === 'ar' ? 'مقارنة بالشهر الماضي' : 'vs last month'}
                    </p>
                  )}
                </div>
                <div className="rounded-xl p-3" style={{ backgroundColor: `${card.color}1a`, color: card.color }}>
                  <card.icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ─── Charts ─── */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Department Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'ar' ? 'توزيع الطلاب حسب القسم' : 'Students per Department'}</CardTitle>
              <CardDescription>{locale === 'ar' ? 'عدد الطلاب المقيدين بكل قسم أكاديمي' : 'Registered student breakdown by department'}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={deptChartConfig} className="h-[260px] w-full">
                <BarChart data={studentsByDepartment} margin={{ left: 12, right: 12, top: 8 }}>
                  <CartesianGrid vertical={false} className="stroke-border/60" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} width={30} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="count" name="count" fill="var(--color-students)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Attendance Trend */}
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'ar' ? 'سجل الحضور الشهري' : 'Monthly Attendance Records'}</CardTitle>
              <CardDescription>{locale === 'ar' ? 'معدل تسجيل الحضور والغياب خلال الأشهر الماضية' : 'Monthly recorded attendance activity'}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={attendanceChartConfig} className="h-[260px] w-full">
                <AreaChart data={attendanceByMonth} margin={{ left: 12, right: 12, top: 8 }}>
                  <defs>
                    <linearGradient id="fillAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.emerald} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.emerald} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} className="stroke-border/60" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} width={30} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Area
                    dataKey="value"
                    type="natural"
                    name="records"
                    stroke="var(--color-records)"
                    strokeWidth={2}
                    fill="url(#fillAttendance)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* ─── Tables ─── */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Today's Schedule Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle>{locale === 'ar' ? 'الجدول الدراسي اليومي' : "Today's Schedule"}</CardTitle>
                <CardDescription>{locale === 'ar' ? 'المحاضرات والمعامل المقررة اليوم' : 'Classes and labs scheduled'}</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={route('cms.schedules.index')} className="gap-1">
                  {locale === 'ar' ? 'عرض الكل' : 'View All'} <Calendar className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {todaySchedules.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  {locale === 'ar' ? 'لا توجد محاضرات في الجدول حالياً' : 'No schedules available'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground border-b text-left text-xs [&_th]:px-3 [&_th]:py-2">
                        <th>{locale === 'ar' ? 'المادة' : 'Subject'}</th>
                        <th>{locale === 'ar' ? 'الأستاذ' : 'Teacher'}</th>
                        <th>{locale === 'ar' ? 'القاعة' : 'Room'}</th>
                        <th>{locale === 'ar' ? 'التوقيت' : 'Time'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {todaySchedules.map((schedule) => (
                        <tr key={schedule.id} className="hover:bg-muted/40 border-b last:border-0">
                          <td className="px-3 py-2.5 font-medium">{schedule.subject?.name || '-'}</td>
                          <td className="px-3 py-2.5">{schedule.teacher?.name || '-'}</td>
                          <td className="px-3 py-2.5">
                            <Badge variant="outline">{schedule.room || '—'}</Badge>
                          </td>
                          <td className="text-muted-foreground px-3 py-2.5 text-xs dir-ltr">
                            {schedule.start_time} - {schedule.end_time}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Registered Students */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle>{locale === 'ar' ? 'آخر الطلاب المسجلين' : 'Recently Registered Students'}</CardTitle>
                <CardDescription>{locale === 'ar' ? 'أحدث الطلبة الانضمام للكلية' : 'Latest enrolled CMS students'}</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={route('cms.students.index')} className="gap-1">
                  {locale === 'ar' ? 'عرض الكل' : 'View All'} <Users className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentStudents.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  {locale === 'ar' ? 'لا يوجد طلاب مسجلون حديثاً' : 'No recent students found'}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground border-b text-left text-xs [&_th]:px-3 [&_th]:py-2">
                        <th>{locale === 'ar' ? 'الرقم الدراسي' : 'Student No'}</th>
                        <th>{locale === 'ar' ? 'الاسم' : 'Name'}</th>
                        <th>{locale === 'ar' ? 'القسم' : 'Department'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-muted/40 border-b last:border-0">
                          <td className="px-3 py-2.5 font-mono text-xs font-semibold">{student.student_no}</td>
                          <td className="px-3 py-2.5 font-medium">
                            <Link href={route('cms.students.show', student.id)} className="hover:underline">
                              {student.name}
                            </Link>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground">
                            {student.level?.department?.name || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Recent Grades ─── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>{locale === 'ar' ? 'آخر الدرجات المسجلة' : 'Recently Recorded Grades'}</CardTitle>
              <CardDescription>{locale === 'ar' ? 'أحدث عمليات رصد الدرجات في النظام' : 'Latest grade entries across subjects'}</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={route('cms.grades.index')} className="gap-1">
                {locale === 'ar' ? 'رصد الدرجات' : 'Grades'} <GraduationCap className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentGrades.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                {locale === 'ar' ? 'لم يتم رصد أي درجات بعد' : 'No grades recorded yet'}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b text-left text-xs [&_th]:px-3 [&_th]:py-2">
                      <th>{locale === 'ar' ? 'الطالب' : 'Student'}</th>
                      <th>{locale === 'ar' ? 'المادة' : 'Subject'}</th>
                      <th>{locale === 'ar' ? 'المجموع' : 'Total'}</th>
                      <th>{locale === 'ar' ? 'التقدير' : 'Grade'}</th>
                      <th>{locale === 'ar' ? 'التاريخ' : 'Date'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentGrades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-muted/40 border-b last:border-0">
                        <td className="px-3 py-2.5 font-medium">
                          <Link
                            href={route('cms.students.show', grade.enrollment?.student?.id)}
                            className="hover:underline"
                          >
                            {grade.enrollment?.student?.name || '-'}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5">
                          {grade.enrollment?.subject?.code || '-'} - {grade.enrollment?.subject?.name || ''}
                        </td>
                        <td className="px-3 py-2.5 font-semibold tabular-nums">{grade.total ?? '-'}</td>
                        <td className="px-3 py-2.5">
                          {grade.grade_letter ? (
                            <Badge>{grade.grade_letter}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-muted-foreground px-3 py-2.5 text-xs">
                          {grade.entered_at
                            ? new Date(grade.entered_at).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-GB')
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
          </>
        ) : (
          renderRoleView()
        )}
      </div>
    </AppLayout>
  );
}

