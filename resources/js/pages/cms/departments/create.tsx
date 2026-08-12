import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsTeacher } from '@/types/cms';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function DepartmentCreate({ teachers }: { teachers: CmsTeacher[] }) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.departments, href: '/cms/departments' },
        { label: c.departments.addTitle, href: '/cms/departments/create' },
    ]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        head_id: '',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/cms/departments');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.departments.addTitle} />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">{c.departments.addHeading}</h1>
                <form onSubmit={submit} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border">
                    <div>
                        <Label htmlFor="name">{c.departments.name}</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={c.departments.namePlaceholder}
                        />
                        {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <Label htmlFor="head_id">{c.departments.headLabel}</Label>
                        <select
                            id="head_id"
                            className="w-full p-2.5 rounded-lg border bg-background text-sm"
                            value={data.head_id}
                            onChange={(e) => setData('head_id', e.target.value)}
                        >
                            <option value="">{c.departments.selectHead}</option>
                            {teachers.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label htmlFor="description">{c.departments.description}</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={4}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={processing}>{c.departments.saveDepartment}</Button>
                        <Button variant="outline" asChild><Link href="/cms/departments">{c.common.cancel}</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
