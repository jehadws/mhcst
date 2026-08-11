import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CmsLevel, CmsSubject, CmsTeacher } from '@/types/cms';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ScheduleCreate({
    subjects,
    teachers,
    levels,
}: {
    subjects: CmsSubject[];
    teachers: CmsTeacher[];
    levels: CmsLevel[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'الجدول الدراسي', href: '/cms/schedules' },
        { title: 'إضافة حصة مجدولة', href: '/cms/schedules/create' },
    ];

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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="جدولة محاضرة دراسية" />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">إضافة حصة دراسية جديدة للجدول</h1>

                {errors.conflict && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
                        ⚠️ تعارض في الجدول الدراسي: {errors.conflict}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border">
                    <div>
                        <Label htmlFor="subject_id">المادة الدراسية</Label>
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
                            <Label htmlFor="teacher_id">أستاذ المادة</Label>
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
                            <Label htmlFor="level_id">الشعبة المستهدفة</Label>
                            <select
                                id="level_id"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.level_id}
                                onChange={(e) => setData('level_id', e.target.value)}
                            >
                                {levels.map((lvl) => (
                                    <option key={lvl.id} value={lvl.id}>
                                        {lvl.department?.name} (سنة {lvl.year} - شعبة {lvl.section})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="day">اليوم</Label>
                            <select
                                id="day"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.day}
                                onChange={(e) => setData('day', e.target.value as any)}
                            >
                                <option value="saturday">السبت</option>
                                <option value="sunday">الأحد</option>
                                <option value="monday">الإثنين</option>
                                <option value="tuesday">الثلاثاء</option>
                                <option value="wednesday">الأربعاء</option>
                                <option value="thursday">الخميس</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="start_time">وقت البدء</Label>
                            <Input
                                id="start_time"
                                type="time"
                                value={data.start_time}
                                onChange={(e) => setData('start_time', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="end_time">وقت الانتهاء</Label>
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
                            <Label htmlFor="room">رقم القاعة / المعمل</Label>
                            <Input
                                id="room"
                                value={data.room}
                                onChange={(e) => setData('room', e.target.value)}
                                placeholder="Lab 1 / Hall 202"
                            />
                        </div>

                        <div>
                            <Label htmlFor="type">نوع الحصة</Label>
                            <select
                                id="type"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value as any)}
                            >
                                <option value="lecture">محاضرة نظرية</option>
                                <option value="lab">معمل عملي</option>
                                <option value="seminar">حلقة دراسية (Seminar)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={processing}>حفظ الحصة المجدولة</Button>
                        <Button variant="outline" asChild><Link href="/cms/schedules">إلغاء</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
