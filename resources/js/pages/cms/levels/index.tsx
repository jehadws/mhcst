import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { CmsDepartment, CmsLevel } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, Tag } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useState } from 'react';

export default function LevelsIndex({ levels, departments }: { levels: PaginatedData<CmsLevel>; departments: CmsDepartment[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'النظام الأكاديمي', href: '/cms/dashboard' },
        { title: 'الصفوف والشهادات', href: '/cms/levels' },
    ];

    const [deleteItem, setDeleteItem] = useState<CmsLevel | null>(null);

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/cms/levels/${deleteItem.id}`, {
            onSuccess: () => setDeleteItem(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="الصفوف والشُعب" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">الصفوف والشُعب الأكاديمية</h1>
                        <p className="text-sm text-slate-500">إدارة السنوات الدراسية، والشُعب، وسعة القاعات</p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href="/cms/levels/create">
                            <Plus className="w-4 h-4" /> إضافة شعبة جديدة
                        </Link>
                    </Button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4 font-semibold">القسم الأكاديمي</th>
                                <th className="p-4 font-semibold">السنة الدراسية</th>
                                <th className="p-4 font-semibold">الشعبة / الفصل</th>
                                <th className="p-4 font-semibold">السعة الإستيعابية</th>
                                <th className="p-4 font-semibold">عدد الطلاب</th>
                                <th className="p-4 font-semibold text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {levels.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-slate-500">لا توجد صفوف أو شعب مسجلة</td>
                                </tr>
                            ) : (
                                levels.data.map((lvl) => (
                                    <tr key={lvl.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <td className="p-4 font-semibold">{lvl.department?.name || '—'}</td>
                                        <td className="p-4">السنة {lvl.year}</td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                                شعبة {lvl.section}
                                            </span>
                                        </td>
                                        <td className="p-4">{lvl.capacity} طالب</td>
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
                    title="حذف الشعبة الدراسية"
                    description="هل أنت تأكد من رغبتك في حذف هذه الشعبة؟"
                />
            </div>
        </AppLayout>
    );
}
