import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Trophy } from 'lucide-react';

export default function TopStudentsReport({ topStudents }: { topStudents: any[] }) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.reports, href: '/cms/reports' },
        { label: c.reports.topStudents.pageTitle, href: '/cms/reports/top-students' },
    ]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.reports.topStudents.pageTitle} />
            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-snug flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-warning" /> {c.reports.topStudents.pageTitle}
                        </h1>
                        <p className="text-sm text-muted-foreground">{c.reports.topStudents.pageSubtitle}</p>
                    </div>
                </div>

                <div className="bg-card border rounded-xl overflow-x-auto shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-muted text-muted-foreground border-b">
                            <tr>
                                <th className="p-4 font-semibold w-16 text-center">{c.reports.topStudents.rank}</th>
                                <th className="p-4 font-semibold">{c.reports.topStudents.studentName}</th>
                                <th className="p-4 font-semibold">{c.reports.topStudents.studentNo}</th>
                                <th className="p-4 font-semibold">{c.reports.topStudents.departmentSection}</th>
                                <th className="p-4 font-semibold text-center">{c.reports.topStudents.gpa}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {topStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">{c.reports.topStudents.empty}</td>
                                </tr>
                            ) : (
                                topStudents.map((s, idx) => (
                                    <tr key={s.id} className="hover:bg-muted/50">
                                        <td className="p-4 text-center font-bold">
                                            <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                                                idx === 0 ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'
                                            }`}>
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-base">{s.name}</td>
                                        <td className="p-4 text-xs text-muted-foreground tabular-nums">{s.student_no}</td>
                                        <td className="p-4">
                                            {s.level?.department?.name} ({c.students.yearSection
                                                .replace('{year}', String(s.level?.year ?? ''))
                                                .replace('{section}', String(s.level?.section ?? ''))})
                                        </td>
                                        <td className="p-4 text-center font-bold text-base tabular-nums">{s.gpa_average}%</td>
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
