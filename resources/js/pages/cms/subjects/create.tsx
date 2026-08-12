import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsDepartment } from '@/types/cms';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export default function SubjectCreate({ departments }: { departments: CmsDepartment[] }) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.subjects, href: '/cms/subjects' },
        { label: c.subjects.addTitle, href: '/cms/subjects/create' },
    ]);

    const { data, setData, post, processing, errors } = useForm({
        department_id: departments[0]?.id ? String(departments[0].id) : '',
        code: '',
        name: '',
        credits: '3',
        has_lab: false,
        semester: 'first',
        description: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/cms/subjects');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.subjects.addTitle} />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">{c.subjects.addHeading}</h1>
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
                            <Label htmlFor="code">{c.subjects.codeHint}</Label>
                            <Input
                                id="code"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                placeholder="CS101"
                            />
                            {errors.code && <p className="text-xs text-rose-500 mt-1">{errors.code}</p>}
                        </div>

                        <div>
                            <Label htmlFor="name">{c.subjects.name}</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder={c.subjects.namePlaceholder}
                            />
                            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="credits">{c.subjects.credits}</Label>
                            <Input
                                id="credits"
                                type="number"
                                min="1"
                                max="10"
                                value={data.credits}
                                onChange={(e) => setData('credits', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="semester">{c.subjects.usualSemester}</Label>
                            <select
                                id="semester"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.semester}
                                onChange={(e) => setData('semester', e.target.value as typeof data.semester)}
                            >
                                <option value="first">{c.labels.semesters.first}</option>
                                <option value="second">{c.labels.semesters.second}</option>
                                <option value="summer">{c.labels.semesters.summer}</option>
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
                            {c.subjects.hasLab}
                        </Label>
                    </div>

                    <div>
                        <Label htmlFor="description">{c.subjects.description}</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={processing}>{c.subjects.saveSubject}</Button>
                        <Button variant="outline" asChild><Link href="/cms/subjects">{c.common.cancel}</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
