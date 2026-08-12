import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs, dayLabel, sessionTypeLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsLevel, CmsSubject, CmsTeacher } from '@/types/cms';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DAY_KEYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] as const;

export default function ScheduleCreate({
    subjects,
    teachers,
    levels,
}: {
    subjects: CmsSubject[];
    teachers: CmsTeacher[];
    levels: CmsLevel[];
}) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.schedules, href: '/cms/schedules' },
        { label: c.schedules.addTitle, href: '/cms/schedules/create' },
    ]);

    const { data, setData, post, processing, errors } = useForm({
        subject_id: subjects[0]?.id ? String(subjects[0].id) : '',
        teacher_id: teachers[0]?.id ? String(teachers[0].id) : '',
        level_id: levels[0]?.id ? String(levels[0].id) : '',
        day: 'saturday',
        start_time: '09:00',
        end_time: '10:30',
        room: 'Lab 1',
        type: 'lecture',
        academic_year: '2025-2026',
        semester: 'first',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/cms/schedules');
    };

    const levelOptionLabel = (lvl: CmsLevel) =>
        c.students.levelOption
            .replace('{department}', lvl.department?.name ?? '')
            .replace('{year}', String(lvl.year))
            .replace('{section}', lvl.section);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.schedules.addTitle} />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">{c.schedules.addHeading}</h1>

                {errors.conflict && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
                        {c.schedules.conflictWarning.replace('{message}', errors.conflict)}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border">
                    <div>
                        <Label htmlFor="subject_id">{c.schedules.subject}</Label>
                        <select
                            id="subject_id"
                            className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                            value={data.subject_id}
                            onChange={(e) => setData('subject_id', e.target.value)}
                        >
                            {subjects.map((sub) => (
                                <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="teacher_id">{c.schedules.teacher}</Label>
                            <select
                                id="teacher_id"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.teacher_id}
                                onChange={(e) => setData('teacher_id', e.target.value)}
                            >
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="level_id">{c.schedules.targetSection}</Label>
                            <select
                                id="level_id"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.level_id}
                                onChange={(e) => setData('level_id', e.target.value)}
                            >
                                {levels.map((lvl) => (
                                    <option key={lvl.id} value={lvl.id}>
                                        {levelOptionLabel(lvl)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="day">{c.common.day}</Label>
                            <select
                                id="day"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.day}
                                onChange={(e) => setData('day', e.target.value as typeof data.day)}
                            >
                                {DAY_KEYS.map((dayKey) => (
                                    <option key={dayKey} value={dayKey}>{dayLabel(c, dayKey)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="start_time">{c.schedules.startTime}</Label>
                            <Input
                                id="start_time"
                                type="time"
                                value={data.start_time}
                                onChange={(e) => setData('start_time', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="end_time">{c.schedules.endTime}</Label>
                            <Input
                                id="end_time"
                                type="time"
                                value={data.end_time}
                                onChange={(e) => setData('end_time', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="room">{c.schedules.room}</Label>
                            <Input
                                id="room"
                                value={data.room}
                                onChange={(e) => setData('room', e.target.value)}
                                placeholder={c.schedules.roomPlaceholder}
                            />
                        </div>

                        <div>
                            <Label htmlFor="type">{c.schedules.sessionType}</Label>
                            <select
                                id="type"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value as typeof data.type)}
                            >
                                <option value="lecture">{sessionTypeLabel(c, 'lecture')}</option>
                                <option value="lab">{sessionTypeLabel(c, 'lab')}</option>
                                <option value="seminar">{sessionTypeLabel(c, 'seminar')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={processing}>{c.schedules.saveSession}</Button>
                        <Button variant="outline" asChild><Link href="/cms/schedules">{c.common.cancel}</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
