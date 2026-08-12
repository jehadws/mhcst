import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsDepartment } from '@/types/cms';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LevelCreate({ departments }: { departments: CmsDepartment[] }) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.levels, href: '/cms/levels' },
        { label: c.levels.addTitle, href: '/cms/levels/create' },
    ]);

    const { data, setData, post, processing, errors } = useForm({
        department_id: departments[0]?.id ? String(departments[0].id) : '',
        year: '1',
        section: 'A',
        capacity: '40',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/cms/levels');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.levels.addTitle} />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">{c.levels.addHeading}</h1>
                <form onSubmit={submit} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border">
                    <div>
                        <Label htmlFor="department_id">{c.levels.department}</Label>
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
                        {errors.department_id && <p className="text-xs text-rose-500 mt-1">{errors.department_id}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="year">{c.levels.academicYearHint}</Label>
                            <Input
                                id="year"
                                type="number"
                                min="1"
                                max="10"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                            />
                            {errors.year && <p className="text-xs text-rose-500 mt-1">{errors.year}</p>}
                        </div>

                        <div>
                            <Label htmlFor="section">{c.levels.sectionHint}</Label>
                            <Input
                                id="section"
                                value={data.section}
                                onChange={(e) => setData('section', e.target.value)}
                            />
                            {errors.section && <p className="text-xs text-rose-500 mt-1">{errors.section}</p>}
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="capacity">{c.levels.capacity}</Label>
                        <Input
                            id="capacity"
                            type="number"
                            value={data.capacity}
                            onChange={(e) => setData('capacity', e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={processing}>{c.levels.saveSection}</Button>
                        <Button variant="outline" asChild><Link href="/cms/levels">{c.common.cancel}</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
