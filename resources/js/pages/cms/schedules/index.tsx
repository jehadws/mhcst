import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs, dayLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsLevel, CmsSchedule, CmsTeacher } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Calendar, Edit } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useState } from 'react';

const DAY_KEYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] as const;

export default function SchedulesIndex({
    schedules,
    levels,
    teachers,
}: {
    schedules: CmsSchedule[];
    levels: CmsLevel[];
    teachers: CmsTeacher[];
}) {
    const { c, canManage } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.schedules, href: '/cms/schedules' },
    ]);

    const [deleteItem, setDeleteItem] = useState<CmsSchedule | null>(null);

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/cms/schedules/${deleteItem.id}`, {
            onSuccess: () => setDeleteItem(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.schedules.title} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{c.schedules.title}</h1>
                        <p className="text-sm text-slate-500">{c.schedules.subtitle}</p>
                    </div>
                    {canManage && (
                        <Button asChild className="gap-2">
                            <Link href="/cms/schedules/create">
                                <Plus className="w-4 h-4" /> {c.schedules.add}
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DAY_KEYS.map((dayKey) => {
                        const daySchedules = schedules.filter((s) => s.day === dayKey);
                        const dayName = dayLabel(c, dayKey);

                        return (
                            <div key={dayKey} className="bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm flex flex-col gap-3">
                                <div className="font-bold text-base border-b pb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-indigo-600" /> {dayName}
                                    </span>
                                    <span className="text-xs text-slate-400 font-normal">
                                        {c.schedules.lecturesCount.replace('{count}', String(daySchedules.length))}
                                    </span>
                                </div>

                                {daySchedules.length === 0 ? (
                                    <p className="text-xs text-slate-400 py-6 text-center">{c.schedules.noLectures}</p>
                                ) : (
                                    daySchedules.map((s) => (
                                        <div key={s.id} className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/40 relative group">
                                            {canManage && (
                                                <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                                    <Link
                                                        href={`/cms/schedules/${s.id}/edit`}
                                                        className="p-1 text-slate-400 hover:text-indigo-600"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => setDeleteItem(s)}
                                                        className="p-1 text-slate-400 hover:text-rose-600"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                            <div className="font-bold text-sm text-indigo-600 dark:text-indigo-400">{s.subject?.name}</div>
                                            <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                                {c.schedules.teacherLabel.replace('{name}', s.teacher?.name ?? '')}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                {c.schedules.sectionLabel
                                                    .replace('{department}', s.level?.department?.name ?? '')
                                                    .replace('{year}', String(s.level?.year ?? ''))
                                                    .replace('{section}', String(s.level?.section ?? ''))}
                                            </div>
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs">
                                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                                    {s.start_time} - {s.end_time}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-medium">
                                                    {c.schedules.roomLabel.replace('{room}', s.room || '—')}
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
                    title={c.schedules.deleteTitle}
                    description={c.schedules.deleteDescription}
                />
            </div>
        </AppLayout>
    );
}
