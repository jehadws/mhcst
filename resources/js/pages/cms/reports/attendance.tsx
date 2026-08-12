import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsEnrollment, CmsSubject } from '@/types/cms';
import { Head, router } from '@inertiajs/react';

export default function AttendanceReport({
    enrollments,
    subjects,
    filters,
}: {
    enrollments: CmsEnrollment[];
    subjects: CmsSubject[];
    filters: any;
}) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.reports, href: '/cms/reports' },
        { label: c.reports.attendance.pageTitle, href: '/cms/reports/attendance' },
    ]);

    const filterChange = (val: string) => {
        router.get('/cms/reports/attendance', { subject_id: val }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.reports.attendance.pageTitle} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{c.reports.attendance.pageTitle}</h1>
                        <p className="text-sm text-slate-500">{c.reports.attendance.pageSubtitle}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border flex items-center gap-4">
                    <label className="text-xs font-semibold text-slate-500">{c.reports.attendance.selectSubject}</label>
                    <select
                        className="p-2.5 rounded-lg border bg-background text-sm min-w-[250px]"
                        value={filters.subject_id || ''}
                        onChange={(e) => filterChange(e.target.value)}
                    >
                        <option value="">{c.common.allSubjects}</option>
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                    </select>
                </div>

                <div className="bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.attendance.studentName}</th>
                                <th className="p-4 font-semibold">{c.common.subject}</th>
                                <th className="p-4 font-semibold text-center">{c.reports.attendance.presentDays}</th>
                                <th className="p-4 font-semibold text-center">{c.reports.attendance.absentDays}</th>
                                <th className="p-4 font-semibold text-center">{c.reports.attendance.attendanceRate}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center text-slate-500">{c.reports.attendance.empty}</td>
                                </tr>
                            ) : (
                                enrollments.map((enr) => {
                                    const records = enr.attendance || [];
                                    const total = records.length;
                                    const present = records.filter((r) => r.status === 'present').length;
                                    const absent = records.filter((r) => r.status === 'absent').length;
                                    const rate = total > 0 ? Math.round((present / total) * 100) : 100;

                                    return (
                                        <tr key={enr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="p-4 font-semibold">{enr.student?.name}</td>
                                            <td className="p-4">{enr.subject?.name}</td>
                                            <td className="p-4 text-center text-emerald-600 font-semibold">{present} {c.reports.attendance.daysUnit}</td>
                                            <td className="p-4 text-center text-rose-600 font-semibold">{absent} {c.reports.attendance.daysUnit}</td>
                                            <td className="p-4 text-center font-bold">{rate}%</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
