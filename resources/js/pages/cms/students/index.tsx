import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { CmsLevel, CmsStudent } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, Eye, Users } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import CmsImportExport from '@/components/cms/cms-import-export';
import { useState } from 'react';

export default function StudentsIndex({ students, levels }: { students: PaginatedData<CmsStudent>; levels: CmsLevel[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'النظام الأكاديمي', href: '/cms/dashboard' },
        { title: 'الطلاب الأكاديميون', href: '/cms/students' },
    ];

    const [deleteItem, setDeleteItem] = useState<CmsStudent | null>(null);

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/cms/students/${deleteItem.id}`, {
            onSuccess: () => setDeleteItem(null),
        });
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">مستمر</span>;
            case 'suspended':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">موقف</span>;
            case 'graduated':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">خريج</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">منسحب</span>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="الطلاب الأكاديميون" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">الطلاب الأكاديميون (CMS)</h1>
                        <p className="text-sm text-slate-500">إدارة السجلات الأكاديمية للطلاب وأرقام القيد</p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href="/cms/students/create">
                            <Plus className="w-4 h-4" /> تسجيل طالب جديد
                        </Link>
                    </Button>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-indigo-600" />
                        <span className="text-sm font-semibold">استيراد وتصدير بيانات الطلاب</span>
                    </div>
                    <CmsImportExport
                        importEndpoint="/cms/students/import"
                        templateUrl="/cms/students/import/template"
                        exportUrl="/cms/students/export?format=xlsx"
                        exportPdfUrl="/cms/students/export?format=pdf"
                    />
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4 font-semibold">رقم القيد</th>
                                <th className="p-4 font-semibold">اسم الطالب</th>
                                <th className="p-4 font-semibold">القسم والشعبة</th>
                                <th className="p-4 font-semibold">تاريخ التسجيل</th>
                                <th className="p-4 font-semibold">الحالة</th>
                                <th className="p-4 font-semibold text-left">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {students.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-6 text-center text-slate-500">لا يوجد طلاب أكاديميون مسجلون حالياً</td>
                                </tr>
                            ) : (
                                students.data.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <td className="p-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{student.student_no}</td>
                                        <td className="p-4 font-semibold">
                                            <div>{student.name}</div>
                                            <div className="text-xs text-slate-400 font-normal">{student.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <div>{student.level?.department?.name || '—'}</div>
                                            <div className="text-xs text-slate-500">السنة {student.level?.year} - شعبة {student.level?.section}</div>
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
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/cms/students/${student.id}/edit`}>
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteItem(student)} className="text-rose-500 hover:text-rose-600">
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
                    title="حذف ملف الطالب"
                    description={`هل أنت تأكد من رغبتك في حذف طالب القيد رقم "${deleteItem?.student_no}"؟`}
                />
            </div>
        </AppLayout>
    );
}
