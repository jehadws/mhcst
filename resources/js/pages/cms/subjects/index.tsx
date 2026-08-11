import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { CmsDepartment, CmsSubject } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, BookOpen } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useState } from 'react';

export default function SubjectsIndex({ subjects, departments }: { subjects: PaginatedData<CmsSubject>; departments: CmsDepartment[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'النظام الأكاديمي', href: '/cms/dashboard' },
        { title: 'المواد الدراسية', href: '/cms/subjects' },
    ];

    const [deleteItem, setDeleteItem] = useState<CmsSubject | null>(null);

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/cms/subjects/${deleteItem.id}`, {
            onSuccess: () => setDeleteItem(null),
        });
    };

    const semesterLabel = (sem: string) => {
        switch (sem) {
            case 'first': return 'الفصل الأول';
            case 'second': return 'الفصل الثاني';
            case 'summer': return 'الفصل الصيفي';
            default: return sem;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="المواد الدراسية" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">المواد والمناهج الدراسية</h1>
                        <p className="text-sm text-slate-500">إدارة المقرر الدراسية، الساعات المعتمدة، والمعامل</p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href="/cms/subjects/create">
                            <Plus className="w-4 h-4" /> إضافة مادة جديدة
                        </Link>
                    </Button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4 font-semibold">رمز المادة</th>
                                <th className="p-4 font-semibold">اسم المادة</th>
                                <th className="p-4 font-semibold">القسم</th>
                                <th className="p-4 font-semibold">الساعات</th>
                                <th className="p-4 font-semibold">الفصل الدراسي</th>
                                <th className="p-4 font-semibold">معمل / عملي</th>
                                <th className="p-4 font-semibold text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {subjects.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-6 text-center text-slate-500">لا توجد مواد دراسية مسجلة</td>
                                </tr>
                            ) : (
                                subjects.data.map((subj) => (
                                    <tr key={subj.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{subj.code}</td>
                                        <td className="p-4 font-semibold">{subj.name}</td>
                                        <td className="p-4">{subj.department?.name || '—'}</td>
                                        <td className="p-4">{subj.credits} ساعات</td>
                                        <td className="p-4">{semesterLabel(subj.semester)}</td>
                                        <td className="p-4">
                                            {subj.has_lab ? (
                                                <span className="px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-semibold">يوجد معمل</span>
                                            ) : (
                                                <span className="text-xs text-slate-400">نظري</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/cms/subjects/${subj.id}/edit`}>
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteItem(subj)} className="text-rose-500 hover:text-rose-600">
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
                    title="حذف مادة دراسية"
                    description={`هل أنت تأكد من رغبتك في حذف المادة "${deleteItem?.name}"؟`}
                />
            </div>
        </AppLayout>
    );
}
