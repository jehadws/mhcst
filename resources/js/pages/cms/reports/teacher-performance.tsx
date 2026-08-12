import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { UserCheck } from 'lucide-react';

interface TeacherRow {
    id: number;
    name: string;
    specialization?: string;
    classes_count: number;
    students_count: number;
    avg_grade: number | null;
    attendance_rate: number | null;
}

export default function TeacherPerformanceReport({ teachers }: { teachers: TeacherRow[] }) {
    const { c } = useCms();
    const r = c.reports.teacherPerformance;

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.reports, href: '/cms/reports' },
        { label: r.pageTitle, href: '/cms/reports/teacher-performance' },
    ]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={r.pageTitle} />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-indigo-600" /> {r.pageTitle}
                    </h1>
                    <p className="text-sm text-slate-500">{r.pageSubtitle}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.common.name}</th>
                                <th className="p-4 font-semibold">{c.teachers.specialization}</th>
                                <th className="p-4 font-semibold text-center">{r.classes}</th>
                                <th className="p-4 font-semibold text-center">{r.students}</th>
                                <th className="p-4 font-semibold text-center">{r.avgGrade}</th>
                                <th className="p-4 font-semibold text-center">{r.attendanceRate}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {teachers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-slate-500">{r.empty}</td>
                                </tr>
                            ) : (
                                teachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <td className="p-4 font-semibold">{teacher.name}</td>
                                        <td className="p-4">{teacher.specialization || '—'}</td>
                                        <td className="p-4 text-center">{teacher.classes_count}</td>
                                        <td className="p-4 text-center">{teacher.students_count}</td>
                                        <td className="p-4 text-center">{teacher.avg_grade ?? '—'}</td>
                                        <td className="p-4 text-center">{teacher.attendance_rate != null ? `${teacher.attendance_rate}%` : '—'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
