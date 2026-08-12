import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { BookOpen, Calendar, ClipboardList, FileSpreadsheet, GraduationCap, Users } from 'lucide-react';

interface TeacherClass {
    id: number;
    code: string;
    name: string;
    student_count: number;
    pending_grades: number;
}

interface ScheduleRow {
    id: number;
    start_time: string;
    end_time: string;
    room?: string;
    subject?: { name: string; code: string };
    level?: { year: number; section: string; department?: { name: string } };
}

export function TeacherDashboardView({
    locale,
    teacherProfile,
    stats,
    todaySchedules,
    teacherClasses,
}: {
    locale: string;
    teacherProfile: { name: string; specialization?: string | null };
    stats: { classes_count: number; students_count: number; pending_grades_count: number; today_classes_count: number };
    todaySchedules: ScheduleRow[];
    teacherClasses: TeacherClass[];
}) {
    const ar = locale === 'ar';

    return (
        <>
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">
                    {ar ? `مرحباً، ${teacherProfile.name}` : `Welcome, ${teacherProfile.name}`}
                </h1>
                <p className="text-muted-foreground text-sm">
                    {teacherProfile.specialization ?? (ar ? 'لوحة المعلم' : 'Teacher Dashboard')}
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: ar ? 'محاضرات اليوم' : "Today's Classes", value: stats.today_classes_count, icon: Calendar },
                    { label: ar ? 'المواد التي أدرّسها' : 'My Subjects', value: stats.classes_count, icon: BookOpen },
                    { label: ar ? 'عدد الطلاب' : 'Students', value: stats.students_count, icon: Users },
                    { label: ar ? 'درجات معلّقة' : 'Pending Grades', value: stats.pending_grades_count, icon: ClipboardList },
                ].map((card) => (
                    <Card key={card.label}>
                        <CardContent className="flex items-center justify-between p-5">
                            <div>
                                <p className="text-muted-foreground text-sm">{card.label}</p>
                                <p className="text-2xl font-bold">{card.value}</p>
                            </div>
                            <card.icon className="h-8 w-8 text-primary opacity-80" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>{ar ? 'جدول اليوم' : "Today's Schedule"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {todaySchedules.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-6">{ar ? 'لا توجد محاضرات اليوم' : 'No classes today'}</p>
                        ) : (
                            <ul className="space-y-3">
                                {todaySchedules.map((s) => (
                                    <li key={s.id} className="flex justify-between items-start border-b pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium">{s.subject?.name}</p>
                                            <p className="text-xs text-muted-foreground">{s.level?.department?.name} — {s.room}</p>
                                        </div>
                                        <span className="text-xs dir-ltr">{s.start_time}–{s.end_time}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{ar ? 'موادي الدراسية' : 'My Classes'}</CardTitle>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('cms.grades.index')}>{ar ? 'رصد الدرجات' : 'Enter Grades'}</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {teacherClasses.map((c) => (
                                <li key={c.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">{c.name}</p>
                                        <p className="text-xs text-muted-foreground">{c.code} · {c.student_count} {ar ? 'طالب' : 'students'}</p>
                                    </div>
                                    {c.pending_grades > 0 && (
                                        <Badge variant="secondary">{c.pending_grades} {ar ? 'معلّقة' : 'pending'}</Badge>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export function StudentDashboardView({
    locale,
    studentProfile,
    stats,
    todaySchedules,
    recentGrades,
    transcriptUrl,
}: {
    locale: string;
    studentProfile: { id: number; name: string; student_no: string; department?: string | null } | null;
    stats?: { enrolled_subjects: number; gpa: number | null; attendance_rate: number | null; today_classes_count: number };
    todaySchedules: ScheduleRow[];
    recentGrades: Array<{ subject?: string; code?: string; total?: number; grade_letter?: string }>;
    transcriptUrl?: string | null;
}) {
    const ar = locale === 'ar';

    if (!studentProfile) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    {ar ? 'لم يتم ربط حسابك بملف طالب أكاديمي بعد.' : 'Your account is not linked to an academic student profile yet.'}
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{ar ? `مرحباً، ${studentProfile.name}` : `Welcome, ${studentProfile.name}`}</h1>
                    <p className="text-muted-foreground text-sm font-mono">{studentProfile.student_no} · {studentProfile.department}</p>
                </div>
                {transcriptUrl && (
                    <Button variant="outline" asChild className="gap-2 shrink-0">
                        <a href={transcriptUrl} target="_blank" rel="noopener noreferrer">
                            <FileSpreadsheet className="w-4 h-4" />
                            {ar ? 'كشف درجاتي (PDF)' : 'My Transcript (PDF)'}
                        </a>
                    </Button>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: ar ? 'المواد المسجّلة' : 'Enrolled Subjects', value: stats?.enrolled_subjects ?? 0 },
                    { label: ar ? 'المعدل' : 'GPA', value: stats?.gpa ?? '—' },
                    { label: ar ? 'نسبة الحضور' : 'Attendance', value: stats?.attendance_rate != null ? `${stats.attendance_rate}%` : '—' },
                    { label: ar ? 'محاضرات اليوم' : "Today's Classes", value: stats?.today_classes_count ?? 0 },
                ].map((card) => (
                    <Card key={card.label}>
                        <CardContent className="p-5">
                            <p className="text-muted-foreground text-sm">{card.label}</p>
                            <p className="text-2xl font-bold">{card.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>{ar ? 'جدول اليوم' : "Today's Schedule"}</CardTitle></CardHeader>
                    <CardContent>
                        {todaySchedules.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-6">{ar ? 'لا توجد محاضرات' : 'No classes'}</p>
                        ) : (
                            <ul className="space-y-2">
                                {todaySchedules.map((s) => (
                                    <li key={s.id} className="flex justify-between text-sm border-b pb-2">
                                        <span className="font-medium">{s.subject?.name}</span>
                                        <span className="text-muted-foreground dir-ltr">{s.start_time}–{s.end_time}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>{ar ? 'آخر الدرجات' : 'Recent Grades'}</CardTitle></CardHeader>
                    <CardContent>
                        {recentGrades.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-6">{ar ? 'لا توجد درجات بعد' : 'No grades yet'}</p>
                        ) : (
                            <ul className="space-y-2">
                                {recentGrades.map((g, i) => (
                                    <li key={i} className="flex justify-between text-sm">
                                        <span>{g.code} — {g.subject}</span>
                                        <Badge>{g.grade_letter ?? g.total}</Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export function ContentDashboardView({
    locale,
    stats,
}: {
    locale: string;
    stats: { blog_posts_count: number; published_posts_count: number; faqs_count: number; testimonials_count: number };
}) {
    const ar = locale === 'ar';

    return (
        <>
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold">{ar ? 'لوحة المحتوى' : 'Content Dashboard'}</h1>
                <p className="text-muted-foreground text-sm">{ar ? 'إدارة الأخبار والمحتوى العام للموقع' : 'Manage site content and publications'}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: ar ? 'المقالات' : 'Blog Posts', value: stats.blog_posts_count, href: '/dashboard/blog-posts/list' },
                    { label: ar ? 'منشور' : 'Published', value: stats.published_posts_count, href: '/dashboard/blog-posts/list' },
                    { label: ar ? 'الأسئلة الشائعة' : 'FAQs', value: stats.faqs_count, href: '/dashboard/faqs/list' },
                    { label: ar ? 'الشهادات' : 'Testimonials', value: stats.testimonials_count, href: '/dashboard/testimonials/list' },
                ].map((card) => (
                    <Card key={card.label} className="hover:border-primary/40 transition-colors">
                        <Link href={card.href}>
                            <CardContent className="p-5">
                                <p className="text-muted-foreground text-sm">{card.label}</p>
                                <p className="text-2xl font-bold">{card.value}</p>
                            </CardContent>
                        </Link>
                    </Card>
                ))}
            </div>
        </>
    );
}
