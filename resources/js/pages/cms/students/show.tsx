import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CmsStudent } from '@/types/cms';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { GraduationCap, Award, Calendar, UserCheck, Edit, IdCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function StudentShow({ student }: { student: CmsStudent }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'الطلاب الأكاديميون', href: '/cms/students' },
        { title: student.name, href: `/cms/students/${student.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`الملف الأكاديمي - ${student.name}`} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl">
                            {student.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{student.name}</h1>
                            <p className="text-sm text-slate-500 font-mono">رقم القيد: {student.student_no} | {student.level?.department?.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" asChild className="gap-2">
                            <a href={`/cms/students/${student.id}/id-card`} target="_blank" rel="noopener noreferrer">
                                <IdCard className="w-4 h-4 ms-2" /> طباعة البطاقة الأكاديمية
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <Link href={`/cms/students/${student.id}/edit`}>
                                <Edit className="w-4 h-4 ms-2" /> تعديل البيانات
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Student Info Card */}
                    <Card className="border">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">البيانات الشخصية والأكاديمية</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-slate-500">القسم:</span>
                                <span className="font-semibold">{student.level?.department?.name}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-slate-500">السنة والشعبة:</span>
                                <span className="font-semibold">السنة {student.level?.year} - شعبة {student.level?.section}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-slate-500">البريد الإلكتروني:</span>
                                <span className="font-semibold">{student.email || '—'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-slate-500">الهاتف:</span>
                                <span className="font-semibold">{student.phone || '—'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-slate-500">الجنس:</span>
                                <span className="font-semibold">{student.gender === 'male' ? 'ذكر' : 'أنثى'}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b">
                                <span className="text-slate-500">تاريخ التسجيل:</span>
                                <span className="font-semibold">{student.enrollment_date}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Enrolled Courses & Grades */}
                    <Card className="md:col-span-2 border">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-600" /> المواد والدرجات الأكاديمية
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {!student.enrollments || student.enrollments.length === 0 ? (
                                <p className="text-sm text-slate-500 py-6 text-center">لا توجد مواد مسجلة لهذا الطالب حالياً</p>
                            ) : (
                                <div className="space-y-4">
                                    {student.enrollments.map((enr) => (
                                        <div key={enr.id} className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-sm">{enr.subject?.name} ({enr.subject?.code})</div>
                                                <div className="text-xs text-slate-500">الساعات: {enr.subject?.credits} | العام: {enr.academic_year} ({enr.semester})</div>
                                            </div>
                                            <div className="text-left">
                                                {enr.grade ? (
                                                    <div>
                                                        <span className="text-xl font-bold text-indigo-600">{enr.grade.total ?? '—'}</span>
                                                        <span className="ms-2 px-2 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800">{enr.grade.grade_letter}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">غير مرصود</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
