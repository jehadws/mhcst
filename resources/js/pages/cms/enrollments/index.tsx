import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs, semesterLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { CmsEnrollment, CmsSubject } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Eye, Edit } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useState } from 'react';

export default function EnrollmentsIndex({ enrollments, subjects }: { enrollments: PaginatedData<CmsEnrollment>; subjects: CmsSubject[] }) {
    const { c, canManage } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.enrollments, href: '/cms/enrollments' },
    ]);

    const [deleteItem, setDeleteItem] = useState<CmsEnrollment | null>(null);

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/cms/enrollments/${deleteItem.id}`, {
            onSuccess: () => setDeleteItem(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.nav.enrollments} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{c.enrollments.title}</h1>
                        <p className="text-sm text-slate-500">{c.enrollments.subtitle}</p>
                    </div>
                    {canManage && (
                        <Button asChild className="gap-2">
                            <Link href="/cms/enrollments/create">
                                <Plus className="w-4 h-4" /> {c.enrollments.add}
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.common.student}</th>
                                <th className="p-4 font-semibold">{c.enrollments.studentNo}</th>
                                <th className="p-4 font-semibold">{c.enrollments.subject}</th>
                                <th className="p-4 font-semibold">{c.enrollments.academicYear}</th>
                                <th className="p-4 font-semibold">{c.enrollments.semester}</th>
                                <th className="p-4 font-semibold text-left">{c.common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {enrollments.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-slate-500">{c.enrollments.empty}</td>
                                </tr>
                            ) : (
                                enrollments.data.map((enr) => (
                                    <tr key={enr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <td className="p-4 font-semibold">{enr.student?.name}</td>
                                        <td className="p-4 font-mono text-xs">{enr.student?.student_no}</td>
                                        <td className="p-4 font-medium text-indigo-600 dark:text-indigo-400">
                                            {enr.subject?.name} ({enr.subject?.code})
                                        </td>
                                        <td className="p-4">{enr.academic_year}</td>
                                        <td className="p-4">{semesterLabel(c, enr.semester)}</td>
                                        <td className="p-4 text-left">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/cms/enrollments/${enr.id}`}>
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                {canManage && (
                                                    <>
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/cms/enrollments/${enr.id}/edit`}>
                                                                <Edit className="w-4 h-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => setDeleteItem(enr)} className="text-rose-500 hover:text-rose-600">
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

                <ConfirmationDialog
                    isOpen={!!deleteItem}
                    onClose={() => setDeleteItem(null)}
                    onConfirm={handleDelete}
                    title={c.enrollments.deleteTitle}
                    description={c.enrollments.deleteDescription}
                />
            </div>
        </AppLayout>
    );
}
