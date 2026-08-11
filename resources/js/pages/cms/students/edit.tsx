import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CmsLevel, CmsStudent } from '@/types/cms';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StudentEdit({ student, levels }: { student: CmsStudent; levels: CmsLevel[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'الطلاب الأكاديميون', href: '/cms/students' },
        { title: 'تعديل بيانات طالب', href: `/cms/students/${student.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        student_no: student.student_no,
        name: student.name,
        email: student.email || '',
        phone: student.phone || '',
        level_id: String(student.level_id),
        enrollment_date: student.enrollment_date ? student.enrollment_date.substring(0, 10) : '',
        status: student.status,
        gender: student.gender || 'male',
        birth_date: student.birth_date ? student.birth_date.substring(0, 10) : '',
        address: student.address || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/cms/students/${student.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`تعديل الطالب ${student.name}`} />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">تعديل بيانات الطالب</h1>
                <form onSubmit={submit} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="student_no">رقم القيد الجامعي *</Label>
                            <Input
                                id="student_no"
                                value={data.student_no}
                                onChange={(e) => setData('student_no', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="name">اسم الطالب *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">رقم الهاتف</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="level_id">القسم والشعبة</Label>
                            <select
                                id="level_id"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.level_id}
                                onChange={(e) => setData('level_id', e.target.value)}
                            >
                                {levels.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.department?.name} (سنة {l.year} - شعبة {l.section})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="status">الحالة الأكاديمية</Label>
                            <select
                                id="status"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as any)}
                            >
                                <option value="active">مستمر</option>
                                <option value="suspended">موقف</option>
                                <option value="graduated">خريج</option>
                                <option value="withdrawn">منسحب</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={processing}>حفظ التغييرات</Button>
                        <Button variant="outline" asChild><Link href="/cms/students">إلغاء</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
