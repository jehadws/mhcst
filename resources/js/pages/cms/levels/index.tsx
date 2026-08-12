import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { CmsDepartment, CmsLevel } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useState } from 'react';

export default function LevelsIndex({ levels, departments }: { levels: PaginatedData<CmsLevel>; departments: CmsDepartment[] }) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.levels, href: '/cms/levels' },
    ]);

    const [deleteItem, setDeleteItem] = useState<CmsLevel | null>(null);

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/cms/levels/${deleteItem.id}`, {
            onSuccess: () => setDeleteItem(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.nav.levels} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{c.levels.title}</h1>
                        <p className="text-sm text-slate-500">{c.levels.subtitle}</p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href="/cms/levels/create">
                            <Plus className="w-4 h-4" /> {c.levels.add}
                        </Link>
                    </Button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.levels.department}</th>
                                <th className="p-4 font-semibold">{c.levels.academicYear}</th>
                                <th className="p-4 font-semibold">{c.levels.section}</th>
                                <th className="p-4 font-semibold">{c.levels.capacity}</th>
                                <th className="p-4 font-semibold">{c.levels.studentsCount}</th>
                                <th className="p-4 font-semibold text-left">{c.common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {levels.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-slate-500">{c.levels.empty}</td>
                                </tr>
                            ) : (
                                levels.data.map((lvl) => (
                                    <tr key={lvl.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <td className="p-4 font-semibold">{lvl.department?.name || '—'}</td>
                                        <td className="p-4">{c.levels.yearLabel.replace('{year}', String(lvl.year))}</td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                                {c.levels.sectionLabel.replace('{section}', lvl.section)}
                                            </span>
                                        </td>
                                        <td className="p-4">{lvl.capacity} {c.levels.studentsUnit}</td>
                                        <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">{lvl.students_count ?? 0}</td>
                                        <td className="p-4 text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/cms/levels/${lvl.id}/edit`}>
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteItem(lvl)} className="text-rose-500 hover:text-rose-600">
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
