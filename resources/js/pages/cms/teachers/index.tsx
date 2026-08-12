import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { CmsTeacher } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useState } from 'react';

export default function TeachersIndex({ teachers }: { teachers: PaginatedData<CmsTeacher> }) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.teachers, href: '/cms/teachers' },
    ]);

    const [deleteItem, setDeleteItem] = useState<CmsTeacher | null>(null);

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/cms/teachers/${deleteItem.id}`, {
            onSuccess: () => setDeleteItem(null),
        });
    };

    const statusBadge = (status: string) => {
        const label = c.labels.teacherStatus[status as keyof typeof c.labels.teacherStatus] ?? status;
        switch (status) {
            case 'active':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{label}</span>;
            case 'suspended':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">{label}</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{label}</span>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.nav.teachers} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{c.teachers.title}</h1>
                        <p className="text-sm text-slate-500">{c.teachers.subtitle}</p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href="/cms/teachers/create">
                            <Plus className="w-4 h-4" /> {c.teachers.add}
                        </Link>
                    </Button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.common.teacher}</th>
                                <th className="p-4 font-semibold">{c.teachers.specialization}</th>
                                <th className="p-4 font-semibold">{c.teachers.qualification}</th>
                                <th className="p-4 font-semibold">{c.common.status}</th>
                                <th className="p-4 font-semibold">{c.teachers.systemAccount}</th>
                                <th className="p-4 font-semibold text-left">{c.common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {teachers.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-slate-500">{c.teachers.empty}</td>
                                </tr>
                            ) : (
                                teachers.data.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <td className="p-4 font-semibold">
                                            <div>{teacher.name}</div>
                                            <div className="text-xs text-slate-400 font-normal">{teacher.email}</div>
                                        </td>
                                        <td className="p-4">{teacher.specialization || c.common.notSpecified}</td>
                                        <td className="p-4">{teacher.qualification || c.common.notSpecified}</td>
                                        <td className="p-4">{statusBadge(teacher.status)}</td>
                                        <td className="p-4">
                                            {teacher.user ? (
                                                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{c.teachers.linkedAccount}</span>
                                            ) : (
                                                <span className="text-xs text-slate-400">{c.teachers.notLinked}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/cms/teachers/${teacher.id}/edit`}>
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteItem(teacher)} className="text-rose-500 hover:text-rose-600">
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
                    title={c.teachers.deleteTitle}
                    description={c.teachers.deleteDescription.replace('{name}', deleteItem?.name ?? '')}
                />
            </div>
        </AppLayout>
    );
}
