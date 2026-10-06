import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { CmsDepartment, CmsLevel } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit, Printer, Search } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import CmsErrorBanner from '@/components/cms/cms-error-banner';
import CmsPagination from '@/components/cms/cms-pagination';
import { FormEventHandler, useState } from 'react';

interface Filters {
    search?: string;
    department_id?: string;
}

export default function LevelsIndex({
    levels,
    departments,
    filters,
}: {
    levels: PaginatedData<CmsLevel>;
    departments: CmsDepartment[];
    filters: Filters;
}) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.levels, href: '/cms/levels' },
    ]);

    const [deleteItem, setDeleteItem] = useState<CmsLevel | null>(null);

    const applyFilter = (key: string, value: string) => {
        router.get('/cms/levels', { ...filters, [key]: value || undefined }, { preserveState: true });
    };

    const search: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        router.get('/cms/levels', { ...filters, search: (e.target as HTMLFormElement).search.value });
    };

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/cms/levels/${deleteItem.id}`, {
            onFinish: () => setDeleteItem(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.nav.levels} />
            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <CmsErrorBanner />
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-snug">{c.levels.title}</h1>
                        <p className="text-sm text-muted-foreground">{c.levels.subtitle}</p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href="/cms/levels/create">
                            <Plus className="w-4 h-4" /> {c.levels.add}
                        </Link>
                    </Button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <form onSubmit={search} className="relative w-full sm:w-72">
                        <Search className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input name="search" defaultValue={filters.search} placeholder={c.levels.search} className="ps-9" />
                    </form>
                    <select
                        className="rounded-lg border bg-background px-3 py-2 text-sm"
                        value={filters.department_id ?? ''}
                        onChange={(e) => applyFilter('department_id', e.target.value)}
                    >
                        <option value="">{c.levels.allDepartments}</option>
                        {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-card border rounded-xl overflow-x-auto shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-muted text-muted-foreground border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.levels.department}</th>
                                <th className="p-4 font-semibold">{c.levels.academicYear}</th>
                                <th className="p-4 font-semibold">{c.levels.section}</th>
                                <th className="p-4 font-semibold">{c.levels.capacity}</th>
                                <th className="p-4 font-semibold">{c.levels.studentsCount}</th>
                                <th className="p-4 font-semibold text-left">{c.common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {levels.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">{c.levels.empty}</td>
                                </tr>
                            ) : (
                                levels.data.map((lvl) => (
                                    <tr key={lvl.id} className="hover:bg-muted/50">
                                        <td className="p-4 font-semibold">{lvl.department?.name || '—'}</td>
                                        <td className="p-4">{c.levels.yearLabel.replace('{year}', String(lvl.year))}</td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                                                {c.levels.sectionLabel.replace('{section}', lvl.section)}
                                            </span>
                                        </td>
                                        <td className="p-4">{lvl.capacity} {c.levels.studentsUnit}</td>
                                        <td className="p-4 font-semibold text-success">{lvl.students_count ?? 0}</td>
                                        <td className="p-4 text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" asChild title={c.levels.printList}>
                                                    <a href={`/cms/levels/${lvl.id}/students-print`} target="_blank" rel="noopener noreferrer">
                                                        <Printer className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/cms/levels/${lvl.id}/edit`}>
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteItem(lvl)} className="text-destructive hover:text-destructive/80">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <CmsPagination paginator={levels} />

                <ConfirmationDialog
                    isOpen={!!deleteItem}
                    onClose={() => setDeleteItem(null)}
                    onConfirm={handleDelete}
                    title={c.levels.deleteTitle}
                    description={c.levels.deleteDescription}
                />
            </div>
        </AppLayout>
    );
}
