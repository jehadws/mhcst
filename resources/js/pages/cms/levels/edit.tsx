import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsDepartment, CmsLevel } from '@/types/cms';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LevelEdit({ level, departments }: { level: CmsLevel; departments: CmsDepartment[] }) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.levels, href: '/cms/levels' },
        { label: c.levels.editTitle, href: `/cms/levels/${level.id}/edit` },
    ]);

    const { data, setData, put, processing, errors } = useForm({
        department_id: String(level.department_id),
        year: String(level.year),
        section: level.section,
        capacity: String(level.capacity),
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/cms/levels/${level.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.levels.editTitle} />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">{c.levels.editHeading}</h1>
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
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="year">{c.levels.academicYear}</Label>
                            <Input
                                id="year"
                                type="number"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="section">{c.levels.section}</Label>
                            <Input
                                id="section"
                                value={data.section}
                                onChange={(e) => setData('section', e.target.value)}
                            />
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
                        <Button type="submit" disabled={processing}>{c.common.saveChanges}</Button>
                        <Button variant="outline" asChild><Link href="/cms/levels">{c.common.cancel}</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
