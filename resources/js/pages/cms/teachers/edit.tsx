import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CmsTeacher } from '@/types/cms';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TeacherEdit({ teacher }: { teacher: CmsTeacher }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'أعضاء هيئة التدريس', href: '/cms/teachers' },
        { title: 'تعديل بيانات أستاذ', href: `/cms/teachers/${teacher.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: teacher.name,
        email: teacher.email || '',
        phone: teacher.phone || '',
        specialization: teacher.specialization || '',
        qualification: teacher.qualification || '',
        join_date: teacher.join_date ? teacher.join_date.substring(0, 10) : '',
        status: teacher.status,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/cms/teachers/${teacher.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`تعديل الأستاذ ${teacher.name}`} />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">تعديل بيانات الأستاذ</h1>
                <form onSubmit={submit} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border">
                    <div>
                        <Label htmlFor="name">الاسم الكامل *</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
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
                            <Label htmlFor="specialization">التخصص الأكاديمي</Label>
                            <Input
                                id="specialization"
                                value={data.specialization}
                                onChange={(e) => setData('specialization', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="qualification">المؤهل الأكاديمي</Label>
                            <Input
                                id="qualification"
                                value={data.qualification}
                                onChange={(e) => setData('qualification', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="join_date">تاريخ التعيين</Label>
                            <Input
                                id="join_date"
                                type="date"
                                value={data.join_date}
                                onChange={(e) => setData('join_date', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">الحالة الوظيفية</Label>
                            <select
                                id="status"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as any)}
                            >
                                <option value="active">نشط</option>
                                <option value="suspended">موقوف</option>
                                <option value="resigned">مستقيل</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={processing}>حفظ التغييرات</Button>
                        <Button variant="outline" asChild><Link href="/cms/teachers">إلغاء</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
