import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CmsLevel, CmsSchedule, CmsTeacher } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Calendar } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useState } from 'react';

const DAYS = [
    { key: 'saturday', label: 'السبت' },
    { key: 'sunday', label: 'الأحد' },
    { key: 'monday', label: 'الإثنين' },
    { key: 'tuesday', label: 'الثلاثاء' },
    { key: 'wednesday', label: 'الأربعاء' },
    { key: 'thursday', label: 'الخميس' },
];

export default function SchedulesIndex({
    schedules,
    levels,
    teachers,
}: {
    schedules: CmsSchedule[];
    levels: CmsLevel[];
    teachers: CmsTeacher[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'النظام الأكاديمي', href: '/cms/dashboard' },
        { title: 'الجدول الدراسي الأسبوعي', href: '/cms/schedules' },
    ];

    const [deleteItem, setDeleteItem] = useState<CmsSchedule | null>(null);

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/cms/schedules/${deleteItem.id}`, {
            onSuccess: () => setDeleteItem(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="الجدول الدراسي الأسبوعي" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">الجدول الدراسي الأسبوعي (Timetable)</h1>
                        <p className="text-sm text-slate-500">تنظيم وتوزيع المحاضرات والمعامل والقاعات دون تضارب</p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href="/cms/schedules/create">
                            <Plus className="w-4 h-4" /> إضافة حصة / محاضرة
                        </Link>
                    </Button>
                </div>

                {/* Timetable Grid view by Day */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DAYS.map((day) => {
                        const daySchedules = schedules.filter((s) => s.day === day.key);

                        return (
                            <div key={day.key} className="bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                                <div className="font-bold text-base border-b pb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-indigo-600" /> {day.label}
                                    </span>
                                    <span className="text-xs text-slate-400 font-normal">{daySchedules.length} محاضرات</span>
                                </div>

                                {daySchedules.length === 0 ? (
                                    <p className="text-xs text-slate-400 py-6 text-center">لا توجد محاضرات في هذا اليوم</p>
                                ) : (
                                    daySchedules.map((s) => (
                                        <div key={s.id} className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/40 relative group">
                                            <button
                                                onClick={() => setDeleteItem(s)}
                                                className="absolute top-2 left-2 p-1 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{s.subject?.name}</div>
                                            <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                                الأستاذ: {s.teacher?.name}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                الشعبة: {s.level?.department?.name} (سنة {s.level?.year} - {s.level?.section})
                                            </div>
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs">
                                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                    {s.start_time} - {s.end_time}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-medium">
                                                    قاعة: {s.room || '—'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        );
                    })}
                </div>

                <ConfirmationDialog
                    isOpen={!!deleteItem}
                    onClose={() => setDeleteItem(null)}
                    onConfirm={handleDelete}
                    title="حذف المحاضرة المجدولة"
                    description="هل أنت تأكد من رغبتك في حذف هذه المحاضرة من الجدول؟"
                />
            </div>
        </AppLayout>
    );
}
