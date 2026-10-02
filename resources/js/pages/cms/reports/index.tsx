import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Award, BarChart3, Building2, Calendar, FileSpreadsheet, Trophy, ChevronLeft, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsIndex() {
    const { c, isRTL } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.reports, href: '/cms/reports' },
    ]);

    const reports = [
        {
            title: c.reports.grades.title,
            desc: c.reports.grades.desc,
            href: '/cms/reports/grades',
            icon: Award,
            color: 'text-primary bg-primary/10',
        },
        {
            title: c.reports.attendance.title,
            desc: c.reports.attendance.desc,
            href: '/cms/reports/attendance',
            icon: Calendar,
            color: 'text-success bg-success/10',
        },
        {
            title: c.reports.topStudents.title,
            desc: c.reports.topStudents.desc,
            href: '/cms/reports/top-students',
            icon: Trophy,
            color: 'text-warning bg-warning/10',
        },
        {
            title: c.reports.departments.title,
            desc: c.reports.departments.subtitle,
            href: '/cms/reports/departments',
            icon: Building2,
            color: 'text-info bg-info/10',
        },
        {
            title: c.reports.teacherPerformance.title,
            desc: c.reports.teacherPerformance.desc,
            href: '/cms/reports/teacher-performance',
            icon: UserCheck,
            color: 'text-accent bg-accent/10',
        },
        {
            title: c.reports.enrollmentStats.title,
            desc: c.reports.enrollmentStats.desc,
            href: '/cms/reports/enrollment-stats',
            icon: BarChart3,
            color: 'text-primary bg-primary/10',
        },
        {
            title: c.reports.schedule.title,
            desc: c.reports.schedule.desc,
            href: '/cms/reports/schedule',
            icon: Calendar,
            color: 'text-success bg-success/10',
        },
        {
            title: c.reports.transcripts.title,
            desc: c.reports.transcripts.desc,
            href: '/cms/students',
            icon: FileSpreadsheet,
            color: 'text-warning bg-warning/10',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.reports.title} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="font-display text-3xl font-extrabold leading-snug">{c.reports.title}</h1>
                    <p className="text-sm text-muted-foreground">{c.reports.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {reports.map((r) => {
                        const Icon = r.icon;
                        return (
                            <Link key={r.href + r.title} href={r.href} className="group">
                                <Card className="h-full hover:border-primary/50 hover:shadow-lg transition shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                                        <div className={`p-3 rounded-xl ${r.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <ChevronLeft className={`w-5 h-5 text-muted-foreground group-hover:text-primary transition ${isRTL ? '' : 'rotate-180'}`} />
                                    </CardHeader>
                                    <CardContent>
                                        <CardTitle className="mb-3">{r.title}</CardTitle>
                                        <p className="text-xs text-muted-foreground leading-normal">{r.desc}</p>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </AppLayout>
    );
}
