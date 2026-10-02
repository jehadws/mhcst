import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';

interface DepartmentStat {
    id: number;
    name: string;
    active_students: number;
    active_enrollments: number;
    dropped_enrollments: number;
    completed_enrollments: number;
}

export default function EnrollmentStatsReport({
    departments,
    monthly,
}: {
    departments: DepartmentStat[];
    monthly: Array<{ month: string; total: number }>;
}) {
    const { c } = useCms();
    const r = c.reports.enrollmentStats;

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.reports, href: '/cms/reports' },
        { label: r.pageTitle, href: '/cms/reports/enrollment-stats' },
    ]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={r.pageTitle} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="font-display text-3xl font-extrabold leading-snug flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-primary" /> {r.pageTitle}
                    </h1>
                    <p className="text-sm text-muted-foreground">{r.pageSubtitle}</p>
                </div>

                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-muted text-muted-foreground border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.common.department}</th>
                                <th className="p-4 font-semibold text-center">{r.activeStudents}</th>
                                <th className="p-4 font-semibold text-center">{r.activeEnrollments}</th>
                                <th className="p-4 font-semibold text-center">{r.dropped}</th>
                                <th className="p-4 font-semibold text-center">{r.completed}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {departments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">{r.empty}</td>
                                </tr>
                            ) : (
                                departments.map((dept) => (
                                    <tr key={dept.id} className="hover:bg-muted/50">
                                        <td className="p-4 font-semibold">{dept.name}</td>
                                        <td className="p-4 text-center">{dept.active_students}</td>
                                        <td className="p-4 text-center">{dept.active_enrollments}</td>
                                        <td className="p-4 text-center">{dept.dropped_enrollments}</td>
                                        <td className="p-4 text-center">{dept.completed_enrollments}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {monthly.length > 0 && (
                    <div className="bg-card border rounded-xl p-6 shadow-sm">
                        <h2 className="font-display text-2xl font-extrabold leading-snug mb-4">{r.monthlyTrend}</h2>
                        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                            {monthly.map((row) => (
                                <div key={row.month} className="rounded-xl border p-3 text-center">
                                    <div className="text-xs text-muted-foreground">{row.month}</div>
                                    <div className="font-display text-lg font-extrabold leading-tight tabular-nums">{row.total}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
