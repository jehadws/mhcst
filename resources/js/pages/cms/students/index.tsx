import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs, studentStatusLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { CmsLevel, CmsStudent } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit, Eye, Users, Search } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import CmsErrorBanner from '@/components/cms/cms-error-banner';
import CmsImportExport from '@/components/cms/cms-import-export';
import CmsPagination from '@/components/cms/cms-pagination';
import { FormEventHandler, useState } from 'react';

interface Filters {
    search?: string;
    level_id?: string;
    status?: string;
}

export default function StudentsIndex({
    students,
    levels,
    filters,
}: {
    students: PaginatedData<CmsStudent>;
    levels: CmsLevel[];
    filters: Filters;
}) {
    const { c, canManage } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.students, href: '/cms/students' },
    ]);

    const [deleteItem, setDeleteItem] = useState<CmsStudent | null>(null);

    const setFilter = (patch: Filters) => {
        router.get('/cms/students', { ...filters, ...patch }, { preserveState: true });
    };

    const search: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        router.get('/cms/students', { ...filters, search: (e.target as HTMLFormElement).search.value });
    };

    const statusTabs = [
        { status: undefined, label: c.students.all },
        ...Object.entries(c.labels.studentStatus).map(([status, label]) => ({ status, label })),
    ];

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/cms/students/${deleteItem.id}`, {
            onFinish: () => setDeleteItem(null),
        });
    };

    const statusBadge = (status: string) => {
        const label = studentStatusLabel(c, status);
        switch (status) {
            case 'active':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success">{label}</span>;
            case 'pending':
            case 'suspended':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning/10 text-warning">{label}</span>;
            case 'graduated':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">{label}</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive/10 text-destructive">{label}</span>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.nav.students} />
            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <CmsErrorBanner />
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-snug">{c.students.title}</h1>
                        <p className="text-sm text-muted-foreground">{c.students.subtitle}</p>
                    </div>
                    {canManage && (
                        <Button asChild className="gap-2">
                            <Link href="/cms/students/create">
                                <Plus className="w-4 h-4" /> {c.students.add}
                            </Link>
                        </Button>
                    )}
                </div>

                {canManage && (
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold">{c.students.importExport}</span>
                        </div>
                        <CmsImportExport
                            importEndpoint="/cms/students/import"
                            templateUrl="/cms/students/import/template"
                            exportUrl="/cms/students/export?format=xlsx"
                            exportPdfUrl="/cms/students/export?format=pdf"
                        />
                    </div>
                )}

                {/* Status filter tabs + search + level filter */}
                <div className="flex flex-wrap items-center gap-2">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.status ?? 'all'}
                            type="button"
                            onClick={() => setFilter({ status: tab.status })}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                (filters.status ?? undefined) === tab.status
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'bg-card text-muted-foreground border hover:border-primary/40'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}

                    <form onSubmit={search} className="ms-auto relative w-full sm:w-72">
                        <Search className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input name="search" defaultValue={filters.search} placeholder={c.students.search} className="ps-9" />
                    </form>

                    <select
                        className="p-2.5 rounded-lg border bg-background text-sm"
                        value={filters.level_id ?? ''}
                        onChange={(e) => setFilter({ level_id: e.target.value || undefined })}
                    >
                        <option value="">{c.students.allLevels}</option>
                        {levels.map((level) => (
                            <option key={level.id} value={level.id}>
                                {c.students.levelOption
                                    .replace('{department}', level.department?.name ?? '—')
                                    .replace('{year}', String(level.year))
                                    .replace('{section}', level.section)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-card border rounded-xl overflow-x-auto shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-muted text-muted-foreground border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.students.studentNo}</th>
                                <th className="p-4 font-semibold">{c.common.name}</th>
                                <th className="p-4 font-semibold">{c.students.departmentSection}</th>
                                <th className="p-4 font-semibold">{c.students.enrollmentDate}</th>
                                <th className="p-4 font-semibold">{c.common.status}</th>
                                <th className="p-4 font-semibold text-left">{c.common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {students.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                                        {filters.search || filters.status || filters.level_id ? c.students.emptyFiltered : c.students.empty}
                                    </td>
                                </tr>
                            ) : (
                                students.data.map((student) => (
                                    <tr key={student.id} className="hover:bg-muted/50">
                                        <td className="p-4 font-bold tabular-nums text-primary">{student.student_no}</td>
                                        <td className="p-4 font-semibold">
                                            <div>{student.name}</div>
                                            <div className="text-xs text-muted-foreground font-normal">{student.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div>{student.level?.department?.name || '—'}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {c.students.yearSection
                                                    .replace('{year}', String(student.level?.year ?? ''))
                                                    .replace('{section}', String(student.level?.section ?? ''))}
                                            </div>
                                        </td>
                                        <td className="p-4">{student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString('ar-LY') : '—'}</td>
                                        <td className="p-4">{statusBadge(student.status)}</td>
                                        <td className="p-4 text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/cms/students/${student.id}`}>
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                {canManage && (
                                                    <>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/cms/students/${student.id}/edit`}>
                                                                <Edit className="w-4 h-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => setDeleteItem(student)} className="text-destructive hover:text-destructive/80">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {students.last_page > 1 && <CmsPagination paginator={students} />}

                <ConfirmationDialog
                    isOpen={!!deleteItem}
                    onClose={() => setDeleteItem(null)}
                    onConfirm={handleDelete}
                    title={c.students.deleteTitle}
                    description={c.students.deleteDescription.replace('{studentNo}', deleteItem?.student_no ?? '')}
                />
            </div>
        </AppLayout>
    );
}
