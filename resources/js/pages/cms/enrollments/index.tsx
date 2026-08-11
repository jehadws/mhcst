import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { CmsEnrollment, CmsSubject } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, GraduationCap } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useState } from 'react';

export default function EnrollmentsIndex({ enrollments, subjects }: { enrollments: PaginatedData<CmsEnrollment>; subjects: CmsSubject[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'النظام الأكاديمي', href: '/cms/dashboard' },
        { title: 'التسجيلات الأكاديمية', href: '/cms/enrollments' },
    ];

    const [deleteItem, setDeleteItem] = useState<CmsEnrollment | null>(null);

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/cms/enrollments/${deleteItem.id}`, {
            onSuccess: () => setDeleteItem(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="التسجيلات الأكاديمية" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">تسجيل الطلاب في المواد</h1>
                        <p className="text-sm text-slate-500">تسجيل الطلاب الفردي والجماعي في المقرر الأكاديمية</p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href="/cms/enrollments/create">
                            <Plus className="w-4 h-4" /> تسجيل جديد
                        </Link>
                    </Button>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4 font-semibold">الطالب</th>
                                <th className="p-4 font-semibold">رقم القيد</th>
                                <th className="p-4 font-semibold">المادة الدراسية</th>
                                <th className="p-4 font-semibold">العام الدراسي</th>
                                <th className="p-4 font-semibold">الفصل</th>
                                <th className="p-4 font-semibold text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {enrollments.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-slate-500">لا توجد تسجيلات أ كاديمية حتى الآن</td>
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
                                        <td className="p-4">{enr.semester}</td>
                                        <td className="p-4 text-left">
                                            <Button variant="ghost" size="sm" onClick={() => setDeleteItem(enr)} className="text-rose-500 hover:text-rose-600">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
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
                    title="حذف التسجيل"
                    description="هل أنت تأكد من إسقاط هذا التسجيل؟"
                />
            </div>
        </AppLayout>
    );
}
