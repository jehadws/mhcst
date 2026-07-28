import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Course, Enrollment, Student } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
    enrollment?: Enrollment;
    courses: Array<{ id: number; title_ar: string }>;
    students: Array<{ id: number; full_name: string }>;
}

export function EnrollmentForm({ enrollment, courses = [], students = [] }: Props) {
    const isEditing = !!enrollment;

    const { data, setData, post, put, processing, errors } = useForm({
        course_id: enrollment?.course_id ? String(enrollment.course_id) : '',
        student_id: enrollment?.student_id ? String(enrollment.student_id) : '',
        full_name: enrollment?.full_name || '',
        email: enrollment?.email || '',
        phone: enrollment?.phone || '',
        status: enrollment?.status || 'pending',
        payment_status: enrollment?.payment_status || 'unpaid',
        amount_due: enrollment?.amount_due || 0,
        amount_paid: enrollment?.amount_paid || 0,
        source: enrollment?.source || 'dashboard',
        notes: enrollment?.notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('dashboard.enrollments.update', enrollment!.id));
        } else {
            post(route('dashboard.enrollments.store'));
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'التسجيلات', href: '/dashboard/enrollments/list' },
        { title: isEditing ? 'تعديل' : 'إضافة', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'تعديل تسجيل' : 'تسجيل جديد'} />
            <div className="mx-auto flex h-full flex-1 max-w-3xl flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'تعديل طلب التسجيل' : 'تسجيل جديد'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="course_id">الدورة التدريبية *</Label>
                                    <Select
                                        value={data.course_id}
                                        onValueChange={(v) => setData('course_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر الدورة" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {courses.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.title_ar}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.course_id && <p className="mt-1 text-sm text-red-500">{errors.course_id}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="student_id">المتدرب (اختياري)</Label>
                                    <Select
                                        value={data.student_id}
                                        onValueChange={(v) => setData('student_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر متدرب مسجل" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((s) => (
                                                <SelectItem key={s.id} value={String(s.id)}>
                                                    {s.full_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="full_name">الاسم الكامل *</Label>
                                <Input
                                    id="full_name"
                                    value={data.full_name}
                                    onChange={(e) => setData('full_name', e.target.value)}
                                />
                                {errors.full_name && <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="email">البريد الإلكتروني *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="phone">رقم الهاتف *</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="status">حالة التسجيل</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(v) => setData('status', v as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">قيد الانتظار</SelectItem>
                                            <SelectItem value="confirmed">مؤكد</SelectItem>
                                            <SelectItem value="completed">مكتمل</SelectItem>
                                            <SelectItem value="cancelled">ملغى</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="payment_status">حالة الدفع</Label>
                                    <Select
                                        value={data.payment_status}
                                        onValueChange={(v) => setData('payment_status', v as any)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unpaid">غير مدفوع</SelectItem>
                                            <SelectItem value="partial">مدفوع جزئياً</SelectItem>
                                            <SelectItem value="paid">مدفوع بالكامل</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="amount_due">المبلغ المستحق (د.ل)</Label>
                                    <Input
                                        id="amount_due"
                                        type="number"
                                        step="0.01"
                                        value={data.amount_due}
                                        onChange={(e) => setData('amount_due', Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="amount_paid">المبلغ المدفوع (د.ل)</Label>
                                    <Input
                                        id="amount_paid"
                                        type="number"
                                        step="0.01"
                                        value={data.amount_paid}
                                        onChange={(e) => setData('amount_paid', Number(e.target.value))}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="notes">ملاحظات</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.get(route('dashboard.enrollments.list'))}
                                >
                                    إلغاء
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'جاري...' : isEditing ? 'تحديث' : 'حفظ'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default function CreateEnrollmentPage({ courses, students }: Props) {
    return <EnrollmentForm courses={courses} students={students} />;
}
