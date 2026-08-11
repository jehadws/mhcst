import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Award, Calendar, FileText, Trophy, ChevronLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ReportsIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'النظام الأكاديمي', href: '/cms/dashboard' },
        { title: 'التقارير الأكاديمية', href: '/cms/reports' },
    ];

    const reports = [
        {
            title: 'تقارير الدرجات والنتائج',
            desc: 'عرض درجات الطلاب حسب المادة أو الطالب مع احتساب المعدل الفصلي والتقديرات الحرفية.',
            href: '/cms/reports/grades',
            icon: Award,
            color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40',
        },
        {
            title: 'تقارير الحضور والغياب',
            desc: 'ملخص نسب حضور الطلاب والغياب المتكرر وتجاوز السقف المسموح لكل مادة.',
            href: '/cms/reports/attendance',
            icon: Calendar,
            color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40',
        },
        {
            title: 'قائمة الطلاب الأوائل (Top Students)',
            desc: 'ترتيب الطلاب المتفوقين حسـب المعدل التراكمي العام GPA والأداء الأكاديمي.',
            href: '/cms/reports/top-students',
            icon: Trophy,
            color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="التقارير الأكاديمية" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold">مركز التقارير والإحصائيات الأكاديمية</h1>
                    <p className="text-sm text-slate-500">استخراج وتصدير التقارير الأكاديمية والتنفيذية</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reports.map((r, i) => {
                        const Icon = r.icon;
                        return (
                            <Link key={i} href={r.href} className="group">
                                <Card className="h-full border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                                        <div className={`p-3 rounded-2xl ${r.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition" />
                                    </CardHeader>
                                    <CardContent>
                                        <CardTitle className="text-lg font-bold mb-2">{r.title}</CardTitle>
                                        <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
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
