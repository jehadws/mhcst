import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { CmsDepartment } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Trash2, Edit } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useState } from 'react';

export default function DepartmentsIndex({ departments }: { departments: PaginatedData<CmsDepartment> }) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.departments, href: '/cms/departments' },
    ]);

    const [deleteItem, setDeleteItem] = useState<CmsDepartment | null>(null);

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/cms/departments/${deleteItem.id}`, {
            onSuccess: () => setDeleteItem(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.departments.title} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{c.departments.title}</h1>
                        <p className="text-sm text-slate-500">{c.departments.subtitle}</p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href="/cms/departments/create">
                            <Plus className="w-4 h-4" /> {c.departments.add}
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.data.map((dept) => (
                        <div key={dept.id} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-indigo-600" />
                                        <h3 className="font-bold text-lg">{dept.name}</h3>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 mb-4">{dept.description || c.common.noDescription}</p>
                                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                                    <div>{c.departments.head}: <span className="font-medium text-slate-900 dark:text-slate-200">{dept.head?.name || c.departments.unassigned}</span></div>
                                    <div>{c.departments.levelsCount}: <span className="font-medium">{dept.levels_count ?? 0}</span></div>
                                    <div>{c.departments.subjectsCount}: <span className="font-medium">{dept.subjects_count ?? 0}</span></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/cms/departments/${dept.id}/edit`}>
                                        <Edit className="w-3.5 h-3.5 ms-1" /> {c.common.edit}
                                    </Link>
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => setDeleteItem(dept)}>
                                    <Trash2 className="w-3.5 h-3.5 ms-1" /> {c.common.delete}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <ConfirmationDialog
                    isOpen={!!deleteItem}
                    onClose={() => setDeleteItem(null)}
                    onConfirm={handleDelete}
                    title={c.departments.deleteTitle}
                    description={c.departments.deleteDescription.replace('{name}', deleteItem?.name ?? '')}
                />
            </div>
        </AppLayout>
    );
}
