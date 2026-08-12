import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Building2, Download } from 'lucide-react';

interface DepartmentRow {
    id: number;
    name: string;
    description?: string | null;
    head_name?: string | null;
    levels_count: number;
    subjects_count: number;
    students_count: number;
    teachers_count: number;
}

export default function DepartmentsReport({ departments }: { departments: DepartmentRow[] }) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.reports, href: '/cms/reports' },
        { label: c.reports.departments.title, href: '/cms/reports/departments' },
    ]);

    const pdfUrl = `/cms/reports/departments?format=pdf&title=${encodeURIComponent(c.reports.departments.title)}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.reports.departments.title} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">{c.reports.departments.title}</h1>
                        <p className="text-sm text-muted-foreground">{c.reports.departments.subtitle}</p>
                    </div>
                    <Button variant="outline" asChild className="gap-2">
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" /> {c.reports.departments.exportPdf}
                        </a>
                    </Button>
                </div>

                <div className="bg-card border rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground border-b">
                            <tr>
                                <th className="p-4 text-start font-semibold">{c.departments.name}</th>
                                <th className="p-4 text-start font-semibold">{c.departments.head}</th>
                                <th className="p-4 text-center font-semibold">{c.departments.levelsCount}</th>
                                <th className="p-4 text-center font-semibold">{c.departments.subjectsCount}</th>
                                <th className="p-4 text-center font-semibold">{c.departments.studentsCount}</th>
                                <th className="p-4 text-center font-semibold">{c.departments.teachersCount}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {departments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">{c.common.noRecords}</td>
                                </tr>
                            ) : (
                                departments.map((dept) => (
                                    <tr key={dept.id} className="hover:bg-muted/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 font-medium">
                                                <Building2 className="w-4 h-4 text-primary" />
                                                {dept.name}
                                            </div>
                                            {dept.description && (
                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{dept.description}</p>
                                            )}
                                        </td>
                                        <td className="p-4">{dept.head_name ?? c.departments.unassigned}</td>
                                        <td className="p-4 text-center">{dept.levels_count}</td>
                                        <td className="p-4 text-center">{dept.subjects_count}</td>
                                        <td className="p-4 text-center">{dept.students_count}</td>
                                        <td className="p-4 text-center">{dept.teachers_count}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <Button variant="outline" asChild>
                    <Link href="/cms/reports">{c.common.back}</Link>
                </Button>
            </div>
        </AppLayout>
    );
}
