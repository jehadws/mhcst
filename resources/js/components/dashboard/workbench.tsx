import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Workbench } from '@/types/cms';
import { Link } from '@inertiajs/react';
import { AlarmClock, AlertTriangle, CalendarClock, ClipboardList, FileStack, UserX } from 'lucide-react';

interface WorkbenchSectionProps {
    workbench: Workbench;
    locale: string;
}

/**
 * The admin workbench (phase 4): everything needing a decision on one
 * screen — queue cards with counts, the over-capacity tripwire, students
 * without enrollment this term, and the term's deadlines.
 */
export function WorkbenchSection({ workbench, locale }: WorkbenchSectionProps) {
    const ar = locale === 'ar';
    const numberFmt = new Intl.NumberFormat(ar ? 'ar-LY' : 'en-GB');

    const deadlines = workbench.deadlines.map((deadline) => {
        const label =
            deadline.key === 'registration_ends_at'
                ? ar
                    ? 'نهاية التسجيل'
                    : 'Registration ends'
                : deadline.key === 'add_drop_deadline'
                    ? ar
                        ? 'موعد الإضافة والحذف'
                        : 'Add/drop deadline'
                    : ar
                        ? 'موعد رصد الدرجات'
                        : 'Grade entry deadline';

        return { ...deadline, label };
    });

    const queues = [
        {
            label: ar ? 'طلبات جديدة' : 'New applications',
            hint: ar ? 'مُرسلة / قيد المراجعة' : 'submitted / under review',
            count: workbench.applications_submitted + workbench.applications_under_review,
            detail: `${numberFmt.format(workbench.applications_submitted)} + ${numberFmt.format(workbench.applications_under_review)}`,
            href: '/cms/applications',
            icon: FileStack,
            color: 'var(--color-info)',
        },
        {
            label: ar ? 'اختيارات بانتظار الاعتماد' : 'Pending enrollment picks',
            hint: ar ? 'بانتظار مراجعة الإدارة' : 'awaiting approval',
            count: workbench.pending_enrollments,
            detail: null,
            href: '/cms/enrollments?status=pending',
            icon: ClipboardList,
            color: 'var(--color-warning)',
        },
        {
            label: ar ? 'بدون تسجيل هذا الفصل' : 'No enrollment this term',
            hint: ar ? 'طلاب نشطون لم يسجلوا بعد' : 'active students with no picks yet',
            count: workbench.students_without_enrollment_count,
            detail: null,
            href: '/cms/students',
            icon: UserX,
            color: 'var(--color-primary)',
        },
    ];

    const daysLeft = (deadline: (typeof deadlines)[number]) => {
        if (deadline.date === null) {
            return ar ? 'غير محدد' : 'Not set';
        }

        if (deadline.passed) {
            return ar ? 'انقضى' : 'Passed';
        }

        if (deadline.days_remaining === 0) {
            return ar ? 'اليوم' : 'Today';
        }

        return (ar ? `متبقٍ ${numberFmt.format(deadline.days_remaining ?? 0)} يوماً` : `${numberFmt.format(deadline.days_remaining ?? 0)} days left`);
    };

    return (
        <div className="flex flex-col gap-6" data-testid="workbench">
            <div className="flex flex-col gap-1">
                <h2 className="font-display text-2xl font-extrabold leading-snug tracking-tight">
                    {ar ? 'يتطلب إجراءً' : 'Needs action'}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {workbench.term.academic_year && workbench.term.semester
                        ? (ar
                            ? `الفصل الحالي: ${workbench.term.academic_year} / ${workbench.term.semester}`
                            : `Active term: ${workbench.term.academic_year} / ${workbench.term.semester}`)
                        : (ar
                            ? 'لا يوجد فصل دراسي مفعّل — احفظ الإعدادات الأكاديمية لتفعيل فصل.'
                            : 'No active term configured — save the academic settings to activate one.')}
                </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
                {queues.map((queue) => (
                    <Card key={queue.label} className="relative overflow-hidden">
                        <CardContent className="flex items-center justify-between p-5">
                            <div className="space-y-1.5">
                                <p className="text-sm font-medium text-muted-foreground">{queue.label}</p>
                                <p className="font-display text-3xl font-extrabold leading-snug tabular-nums">
                                    {numberFmt.format(queue.count)}
                                </p>
                                <p className="text-xs text-muted-foreground">{queue.hint}</p>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                <div className="rounded-xl p-3" style={{ backgroundColor: `${queue.color}1a`, color: queue.color }}>
                                    <queue.icon className="h-6 w-6" />
                                </div>
                                {queue.href && (
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={queue.href}>{ar ? 'فتح القائمة' : 'Open queue'}</Link>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {workbench.over_capacity_count > 0 ? (
                <Card className="border-destructive/40">
                    <CardHeader className="gap-2">
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            {ar ? 'تحذير: شعب فوق الطاقة الاستيعابية' : 'Over-capacity tripwire'}
                            <Badge variant="destructive">{numberFmt.format(workbench.over_capacity_count)}</Badge>
                        </CardTitle>
                        <CardDescription>
                            {ar
                                ? 'عدد المسجلين الفعليين يتجاوز طاقة الشعبة — تم تجاوز حد المقاعد ويلزم تدخل الإدارة.'
                                : 'Active enrollments exceed the section seats — capacity was bypassed and a human must intervene.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-start text-xs text-muted-foreground [&_th]:px-3 [&_th]:py-2.5">
                                        <th className="text-start">{ar ? 'الشعبة' : 'Section'}</th>
                                        <th className="text-start">{ar ? 'المادة' : 'Subject'}</th>
                                        <th className="text-start">{ar ? 'الفصل' : 'Term'}</th>
                                        <th className="text-start">{ar ? 'المسجلون / السعة' : 'Enrolled / seats'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {workbench.over_capacity.map((row, index) => (
                                        <tr key={`${row.subject}-${row.term}-${index}`} className="border-b last:border-0">
                                            <td className="px-3 py-2.5 font-medium">
                                                {ar ? `سنة ${row.level_year} - شعبة ${row.level_section}` : `Year ${row.level_year} - Section ${row.level_section}`}
                                            </td>
                                            <td className="px-3 py-2.5">{row.subject}</td>
                                            <td className="px-3 py-2.5 text-xs text-muted-foreground">{row.term}</td>
                                            <td className="px-3 py-2.5 font-semibold tabular-nums text-destructive">
                                                {numberFmt.format(row.enrolled)} / {numberFmt.format(row.capacity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
                    <AlertTriangle className="h-4 w-4" />
                    {ar ? 'لا توجد شعب فوق الطاقة الاستيعابية' : 'No over-capacity sections'}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader className="gap-2">
                        <CardTitle className="flex items-center gap-2">
                            <AlarmClock className="h-5 w-5 text-primary" />
                            {ar ? 'المواعيد النهائية' : 'Deadlines'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                        {deadlines.map((deadline) => (
                            <div key={deadline.key} className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">{deadline.label}</span>
                                    <span className="text-xs tabular-nums text-muted-foreground" dir="ltr">
                                        {deadline.date ?? '—'}
                                    </span>
                                </div>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                        deadline.date === null
                                            ? 'bg-muted text-muted-foreground'
                                            : deadline.passed
                                                ? 'bg-muted text-muted-foreground line-through'
                                                : (deadline.days_remaining ?? 0) <= 3
                                                    ? 'bg-destructive/10 text-destructive'
                                                    : 'bg-warning/10 text-warning'
                                    }`}
                                >
                                    {daysLeft(deadline)}
                                </span>
                            </div>
                        ))}
                        <Button variant="ghost" size="sm" asChild className="self-start">
                            <Link href="/cms/settings">
                                <CalendarClock className="h-4 w-4" />
                                {ar ? 'الإعدادات الأكاديمية' : 'Academic settings'}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                        <div className="space-y-1.5">
                            <CardTitle>{ar ? 'طلاب بدون تسجيل في الفصل الحالي' : 'Students without enrollment this term'}</CardTitle>
                            <CardDescription>
                                {numberFmt.format(workbench.students_without_enrollment_count)} {ar ? 'طالباً' : 'students'}
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/cms/students">{ar ? 'عرض الكل' : 'View all'}</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {workbench.students_without_enrollment.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">
                                {ar ? 'كل الطلاب النشطين سجلوا مواد هذا الفصل.' : 'Every active student is enrolled this term.'}
                            </p>
                        ) : (
                            <ul className="flex flex-col divide-y">
                                {workbench.students_without_enrollment.map((student) => (
                                    <li key={student.id} className="flex items-center justify-between gap-3 py-2.5">
                                        <Link href={`/cms/students/${student.id}`} className="text-sm font-medium hover:underline">
                                            {student.name}
                                        </Link>
                                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="tabular-nums">{student.student_no}</span>
                                            {student.level && <span className="hidden sm:inline">{student.level}</span>}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default WorkbenchSection;
