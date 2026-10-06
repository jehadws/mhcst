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
            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-snug flex items-center gap-2">
                        <UserCheck className="w-6 h-6 text-accent" /> {r.pageTitle}
                    </h1>
                    <p className="text-sm text-muted-foreground">{r.pageSubtitle}</p>
                </div>

                <div className="bg-card border rounded-xl overflow-x-auto shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-muted text-muted-foreground border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.common.name}</th>
                                <th className="p-4 font-semibold">{c.teachers.specialization}</th>
                                <th className="p-4 font-semibold text-center">{r.classes}</th>
                                <th className="p-4 font-semibold text-center">{r.students}</th>
                                <th className="p-4 font-semibold text-center">{r.avgGrade}</th>
                                <th className="p-4 font-semibold text-center">{r.attendanceRate}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {teachers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">{r.empty}</td>
                                </tr>
                            ) : (
                                teachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-muted/50">
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
