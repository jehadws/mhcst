import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CmsDepartment, CmsSubject } from '@/types/cms';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export default function SubjectEdit({ subject, departments }: { subject: CmsSubject; departments: CmsDepartment[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'المواد الدراسية', href: '/cms/subjects' },
        { title: 'تعديل مادة', href: `/cms/subjects/${subject.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        department_id: String(subject.department_id),
        code: subject.code,
        name: subject.name,
        credits: String(subject.credits),
        has_lab: subject.has_lab,
        semester: subject.semester,
        description: subject.description || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/cms/subjects/${subject.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`تعديل مادة ${subject.name}`} />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">تعديل المادة الدراسية</h1>
                <form onSubmit={submit} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border">
                    <div>
                        <Label htmlFor="department_id">القسم الأكاديمي</Label>
                        <select
                            id="department_id"
                            className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                            value={data.department_id}
                            onChange={(e) => setData('department_id', e.target.value)}
                        >
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="code">رمز المادة *</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                            />
                            {errors.code && <p className="text-xs text-rose-500 mt-1">{errors.code}</p>}
                        </div>

                        <div>
                            <Label htmlFor="name">اسم المادة *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="credits">عدد الساعات المعتمدة</Label>
                            <Input
                                id="credits"
                                type="number"
                                value={data.credits}
                                onChange={(e) => setData('credits', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="semester">الفصل الدراسي</Label>
                            <select
                                id="semester"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.semester}
                                onChange={(e) => setData('semester', e.target.value as any)}
                            >
                                <option value="first">الفصل الأول</option>
                                <option value="second">الفصل الثاني</option>
                                <option value="summer">الفصل الصيفي</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <Checkbox
                            id="has_lab"
                            checked={data.has_lab}
                            onCheckedChange={(checked) => setData('has_lab', !!checked)}
                        />
                        <Label htmlFor="has_lab" className="cursor-pointer font-medium">
                            تحتوي المادة على جزء عملي / معمل (Lab)
                        </Label>
                    </div>

                    <div>
                        <Label htmlFor="description">وصف وتفاصيل المادة</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={processing}>حفظ التغييرات</Button>
                        <Button variant="outline" asChild><Link href="/cms/subjects">إلغاء</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
