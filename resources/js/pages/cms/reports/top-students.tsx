import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CmsStudent } from '@/types/cms';
import { Head } from '@inertiajs/react';
import { Trophy } from 'lucide-react';

export default function TopStudentsReport({ topStudents }: { topStudents: any[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'التقارير الأكاديمية', href: '/cms/reports' },
        { title: 'الطلاب الأوائل', href: '/cms/reports/top-students' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="الطلاب الأوائل المتفوقون" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-amber-500" /> لوحة الطلاب المتفوقين (Top Students)
                        </h1>
                        <p className="text-sm text-slate-500">ترتيب أفضل الطلاب أداءً حسـب المتوسط التراكمي للدرجات</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4 font-semibold w-16 text-center">الترتيب</th>
                                <th className="p-4 font-semibold">اسم الطالب المتفوق</th>
                                <th className="p-4 font-semibold">رقم القيد</th>
                                <th className="p-4 font-semibold">القسم والشعبة</th>
                                <th className="p-4 font-semibold text-center">المعدل التراكمي</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {topStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-6 text-center text-slate-500">لا يوجد بيانات كافية لحساب متفوقي الكلية حالياً</td>
                                </tr>
                            ) : (
                                topStudents.map((s, idx) => (
                                    <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        <td className="p-4 text-center font-bold">
                                            <span className={`w-7 h-7 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                                                idx === 0 ? 'bg-amber-400 text-amber-950' :
                                                idx === 1 ? 'bg-slate-300 text-slate-900' :
                                                idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                            }`}>
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-base">{s.name}</td>
                                        <td className="p-4 font-mono text-xs text-slate-500">{s.student_no}</td>
                                        <td className="p-4">{s.level?.department?.name} (سنة {s.level?.year} - {s.level?.section})</td>
                                        <td className="p-4 text-center font-bold text-indigo-600 text-base">{s.gpa_average}%</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
