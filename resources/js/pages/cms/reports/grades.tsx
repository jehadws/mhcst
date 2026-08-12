import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsEnrollment, CmsStudent, CmsSubject } from '@/types/cms';
import { Head, router } from '@inertiajs/react';

export default function GradeReport({
    enrollments,
    students,
    subjects,
    filters,
}: {
    enrollments: CmsEnrollment[];
    students: CmsStudent[];
    subjects: CmsSubject[];
    filters: any;
}) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.reports, href: '/cms/reports' },
        { label: c.reports.grades.pageTitle, href: '/cms/reports/grades' },
    ]);

    const filterChange = (key: string, val: string) => {
        router.get('/cms/reports/grades', { ...filters, [key]: val }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.reports.grades.pageTitle} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{c.reports.grades.pageTitle}</h1>
                        <p className="text-sm text-slate-500">{c.reports.grades.pageSubtitle}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border flex flex-wrap gap-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">{c.reports.grades.filterBySubject}</label>
                        <select
                            className="p-2.5 rounded-lg border bg-background text-sm min-w-[200px]"
                            value={filters.subject_id || ''}
                            onChange={(e) => filterChange('subject_id', e.target.value)}
                        >
                            <option value="">{c.common.allSubjects}</option>
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">{c.reports.grades.filterByStudent}</label>
                        <select
                            className="p-2.5 rounded-lg border bg-background text-sm min-w-[200px]"
                            value={filters.student_id || ''}
                            onChange={(e) => filterChange('student_id', e.target.value)}
                        >
                            <option value="">{c.common.allStudents}</option>
                            {students.map((s) => (
                                <option key={s.id} value={s.id}>{s.name} ({s.student_no})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.gradesPage.studentName}</th>
                                <th className="p-4 font-semibold">{c.gradesPage.studentNo}</th>
                                <th className="p-4 font-semibold">{c.enrollments.subject}</th>
                                <th className="p-4 font-semibold text-center">{c.reports.grades.midterm}</th>
                                <th className="p-4 font-semibold text-center">{c.reports.grades.final}</th>
                                <th className="p-4 font-semibold text-center">{c.reports.grades.total}</th>
                                <th className="p-4 font-semibold text-center">{c.reports.grades.letterGrade}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-6 text-center text-slate-500">{c.reports.grades.empty}</td>
                                </tr>
                            ) : (
                                enrollments.map((enr) => (
                                    <tr key={enr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <td className="p-4 font-semibold">{enr.student?.name}</td>
                                        <td className="p-4 font-mono text-xs">{enr.student?.student_no}</td>
                                        <td className="p-4">{enr.subject?.name}</td>
                                        <td className="p-4 text-center">{enr.grade?.midterm ?? '—'}</td>
                                        <td className="p-4 text-center">{enr.grade?.final ?? '—'}</td>
                                        <td className="p-4 text-center font-bold text-indigo-600 dark:text-indigo-400">{enr.grade?.total ?? '—'}</td>
                                        <td className="p-4 text-center font-bold">{enr.grade?.grade_letter ?? '—'}</td>
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
