import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CmsDepartment, CmsTeacher } from '@/types/cms';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function DepartmentEdit({ department, teachers }: { department: CmsDepartment; teachers: CmsTeacher[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'الأقسام الأكاديمية', href: '/cms/departments' },
        { title: 'تعديل قسم', href: `/cms/departments/${department.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: department.name,
        head_id: department.head_id ? String(department.head_id) : '',
        description: department.description || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/cms/departments/${department.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`تعديل قسم ${department.name}`} />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">تعديل القسم الأكاديمي</h1>
                <form onSubmit={submit} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border">
                    <div>
                        <Label htmlFor="name">اسم القسم</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <Label htmlFor="head_id">رئيس القسم (أستاذ)</Label>
                        <select
                            id="head_id"
                            className="w-full p-2.5 rounded-lg border bg-background text-sm"
                            value={data.head_id}
                            onChange={(e) => setData('head_id', e.target.value)}
                        >
                            <option value="">-- اختر أستاذ القسم --</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="description">وصف القسم</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={processing}>حفظ التغييرات</Button>
                        <Button variant="outline" asChild><Link href="/cms/departments">إلغاء</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
