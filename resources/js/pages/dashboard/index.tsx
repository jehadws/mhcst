import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useSite } from '@/context/site-context';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, ChartPoint, DashboardStats, Enrollment, StatusCount, TopCourse } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, BookOpen, GraduationCap, Mail, Users, Wallet } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';

const COLORS = {
  primary: 'hsl(var(--primary))',
  emerald: 'hsl(160 84% 39%)',
  amber: 'hsl(38 92% 50%)',
  rose: 'hsl(0 72% 51%)',
  sky: 'hsl(199 89% 48%)',
  violet: 'hsl(258 90% 66%)',
  slate: 'hsl(215 20% 65%)',
};

const STATUS_COLORS: Record<string, string> = {
  pending: COLORS.amber,
  confirmed: COLORS.sky,
  completed: COLORS.emerald,
  cancelled: COLORS.rose,
};

export default function Dashboard() {
  const { stats, recentEnrollments, enrollmentsByMonth, revenueByMonth, leadsByMonth, enrollmentsByStatus, topCourses } = usePage<{
    stats: DashboardStats;
    recentEnrollments: Enrollment[];
    enrollmentsByMonth: ChartPoint[];
    revenueByMonth: ChartPoint[];
    leadsByMonth: ChartPoint[];
    enrollmentsByStatus: StatusCount[];
    topCourses: TopCourse[];
  }>().props;
  const { t, locale, isRTL } = useSite();
  const d = t.dashboard;
  const i = d.index;
  const breadcrumbs: BreadcrumbItem[] = [{ title: d.sidebar.items.dashboard, href: '/dashboard' }];

  const numberFmt = new Intl.NumberFormat(locale === 'ar' ? 'ar-LY' : 'en-GB');
  const currencyFmt = new Intl.NumberFormat(locale === 'ar' ? 'ar-LY' : 'en-GB', {
    style: 'currency',
    currency: 'LYD',
    maximumFractionDigits: 0,
  });

  const enrollmentChartConfig = {
    enrollments: { label: i.enrollmentsLabel, color: COLORS.primary },
  };
  const revenueChartConfig = {
    revenue: { label: i.revenueLabel, color: COLORS.emerald },
  };
  const leadsChartConfig = {
    leads: { label: i.leadsLabel, color: COLORS.sky },
  };
  const statusChartConfig = {
    pending: { label: d.status.pending, color: COLORS.amber },
    confirmed: { label: d.status.confirmed, color: COLORS.sky },
    completed: { label: d.status.completed, color: COLORS.emerald },
    cancelled: { label: d.status.cancelled, color: COLORS.rose },
  };
  const topCoursesConfig = {
    count: { label: i.enrollmentsLabel, color: COLORS.violet },
  };

  const statCards = [
    {
      label: i.students,
      value: numberFmt.format(stats.students_count),
      icon: Users,
      color: COLORS.primary,
      delta: stats.students_delta,
    },
    {
      label: i.enrollmentsThisMonth,
      value: numberFmt.format(stats.enrollments_this_month),
      icon: GraduationCap,
      color: COLORS.emerald,
      delta: stats.enrollments_delta,
    },
    {
      label: i.revenueThisMonth,
      value: currencyFmt.format(stats.revenue_this_month),
      icon: Wallet,
      color: COLORS.amber,
      delta: stats.revenue_delta,
    },
    {
      label: i.newLeads,
      value: numberFmt.format(stats.new_leads),
      icon: Mail,
      color: COLORS.sky,
      delta: null,
    },
  ];

  const statusData = enrollmentsByStatus.map((s) => ({
    ...s,
    fill: STATUS_COLORS[s.status] || COLORS.slate,
  }));

  const topCoursesData = isRTL ? [...topCourses].reverse() : topCourses;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={i.title} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">{i.welcome}</h1>
          <p className="text-muted-foreground text-sm">{i.overview}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                      {Math.abs(card.delta)}% {i.vsLastMonth}
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

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{i.enrollmentsChartTitle}</CardTitle>
              <CardDescription>{i.enrollmentsChartDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={enrollmentChartConfig} className="h-[260px] w-full">
                <AreaChart data={enrollmentsByMonth} margin={{ left: 12, right: 12, top: 8 }}>
                  <defs>
                    <linearGradient id="fillEnrollments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} className="stroke-border/60" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} width={30} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Area
                    dataKey="value"
                    type="natural"
                    name="enrollments"
                    stroke="var(--color-enrollments)"
                    strokeWidth={2}
                    fill="url(#fillEnrollments)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{i.revenueChartTitle}</CardTitle>
              <CardDescription>{i.revenueChartDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={revenueChartConfig} className="h-[260px] w-full">
                <BarChart data={revenueByMonth} margin={{ left: 12, right: 12, top: 8 }}>
                  <CartesianGrid vertical={false} className="stroke-border/60" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} width={45} tickFormatter={(value) => numberFmt.format(value)} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value) => currencyFmt.format(Number(value))} />} />
                  <Bar dataKey="value" name="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>{i.statusChartTitle}</CardTitle>
              <CardDescription>{i.statusChartDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={statusChartConfig} className="h-[260px] w-full">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie data={statusData} dataKey="count" nameKey="status" innerRadius={60} outerRadius={90} paddingAngle={3}>
                    {statusData.map((entry) => (
                      <Cell key={entry.status} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                </PieChart>
              </ChartContainer>
              {statusData.length === 0 && <p className="text-muted-foreground py-8 text-center text-sm">{i.noEnrollments}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{i.topCoursesTitle}</CardTitle>
              <CardDescription>{i.topCoursesDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={topCoursesConfig} className="h-[260px] w-full">
                <BarChart data={topCoursesData} layout="vertical" margin={{ left: isRTL ? 0 : 8, right: isRTL ? 8 : 0, top: 8 }}>
                  <CartesianGrid horizontal={false} className="stroke-border/60" />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    allowDecimals={false}
                    domain={isRTL ? ['dataMax', 0] : [0, 'dataMax']}
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={110}
                    orientation={isRTL ? 'right' : 'left'}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="count" name="count" fill="var(--color-count)" radius={isRTL ? [4, 0, 0, 4] : [0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
              {topCourses.length === 0 && <p className="text-muted-foreground py-8 text-center text-sm">{i.noEnrollments}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{i.leadsChartTitle}</CardTitle>
              <CardDescription>{i.leadsChartDesc}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={leadsChartConfig} className="h-[260px] w-full">
                <AreaChart data={leadsByMonth} margin={{ left: 12, right: 12, top: 8 }}>
                  <defs>
                    <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.sky} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={COLORS.sky} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} className="stroke-border/60" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} width={30} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Area dataKey="value" type="natural" name="leads" stroke="var(--color-leads)" strokeWidth={2} fill="url(#fillLeads)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>{i.recentEnrollments}</CardTitle>
              <CardDescription>{i.recentEnrollmentsDesc}</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={route('dashboard.enrollments.list')} className="gap-1">
                {i.viewAll} <BookOpen className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentEnrollments.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">{i.noEnrollments}</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-b text-left text-xs [&_th]:px-3 [&_th]:py-2">
                      <th>{d.columns.fullName}</th>
                      <th>{d.columns.course}</th>
                      <th>{d.columns.status}</th>
                      <th>{d.columns.amount}</th>
                      <th>{d.columns.date}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEnrollments.map((enrollment) => (
                      <tr key={enrollment.id} className="hover:bg-muted/40 border-b last:border-0">
                        <td className="px-3 py-2.5 font-medium">
                          <Link href={route('dashboard.enrollments.show', enrollment.id)} className="hover:underline">
                            {enrollment.full_name}
                          </Link>
                        </td>
                        <td className="px-3 py-2.5">{enrollment.course?.title_ar || enrollment.course?.title_en || '-'}</td>
                        <td className="px-3 py-2.5">
                          <Badge variant="outline">{d.status[enrollment.status as keyof typeof d.status]}</Badge>
                        </td>
                        <td className="px-3 py-2.5 tabular-nums">{currencyFmt.format(Number(enrollment.amount_due))}</td>
                        <td className="text-muted-foreground px-3 py-2.5">
                          {new Date(enrollment.created_at).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-GB')}
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
    </AppLayout>
  );
}
