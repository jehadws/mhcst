import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs, dayLabel, sessionTypeLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsLevel, CmsSchedule, CmsSubject, CmsTeacher } from '@/types/cms';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DAY_KEYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday'] as const;

function formatTime(value: string): string {
    return value?.slice(0, 5) ?? '';
}

export default function ScheduleEdit({
    schedule,
    subjects,
    teachers,
    levels,
}: {
    schedule: CmsSchedule;
    subjects: CmsSubject[];
    teachers: CmsTeacher[];
    levels: CmsLevel[];
}) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.schedules, href: '/cms/schedules' },
        { label: c.schedules.editTitle, href: `/cms/schedules/${schedule.id}/edit` },
    ]);

    const { data, setData, put, processing, errors } = useForm({
        subject_id: String(schedule.subject_id),
        teacher_id: String(schedule.teacher_id),
        level_id: String(schedule.level_id),
        day: schedule.day,
        start_time: formatTime(schedule.start_time),
        end_time: formatTime(schedule.end_time),
        room: schedule.room ?? '',
        type: schedule.type,
        academic_year: schedule.academic_year,
        semester: schedule.semester,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/cms/schedules/${schedule.id}`);
    };

    const levelOptionLabel = (lvl: CmsLevel) =>
        c.students.levelOption
            .replace('{department}', lvl.department?.name ?? '')
            .replace('{year}', String(lvl.year))
            .replace('{section}', lvl.section);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.schedules.editTitle} />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">{c.schedules.editHeading}</h1>

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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="academic_year">{c.enrollments.academicYear}</Label>
                            <Input
                                id="academic_year"
                                value={data.academic_year}
                                onChange={(e) => setData('academic_year', e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="semester">{c.enrollments.semester}</Label>
                            <select
                                id="semester"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.semester}
                                onChange={(e) => setData('semester', e.target.value as typeof data.semester)}
                            >
                                <option value="first">{c.labels.semesters.first}</option>
                                <option value="second">{c.labels.semesters.second}</option>
                                <option value="summer">{c.labels.semesters.summer}</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={processing}>{c.common.saveChanges}</Button>
                        <Button variant="outline" asChild><Link href="/cms/schedules">{c.common.cancel}</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
