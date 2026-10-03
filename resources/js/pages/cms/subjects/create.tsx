import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCms } from '@/hooks/use-cms';
import AppLayout from '@/layouts/app-layout';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsDepartment } from '@/types/cms';
import { Head, Link, useForm } from '@inertiajs/react';

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
      <div className="p-6">
        <h1 className="font-display mb-6 text-3xl leading-snug font-extrabold">{c.subjects.addHeading}</h1>
        <form onSubmit={submit} className="bg-card space-y-5 rounded-xl border p-6">
          <div>
            <Label htmlFor="department_id">{c.levels.department}</Label>
            <select
              id="department_id"
              className="bg-background mt-1 w-full rounded-lg border p-2.5 text-sm"
              value={data.department_id}
              onChange={(e) => setData('department_id', e.target.value)}
            >
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">{c.subjects.codeHint}</Label>
              <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} placeholder="CS101" />
              {errors.code && <p className="text-destructive mt-1 text-xs">{errors.code}</p>}
            </div>

            <div>
              <Label htmlFor="name">{c.subjects.name}</Label>
              <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder={c.subjects.namePlaceholder} />
              {errors.name && <p className="text-destructive mt-1 text-xs">{errors.name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="credits">{c.subjects.credits}</Label>
              <Input id="credits" type="number" min="1" max="10" value={data.credits} onChange={(e) => setData('credits', e.target.value)} />
            </div>

            <div>
              <Label htmlFor="semester">{c.subjects.usualSemester}</Label>
              <select
                id="semester"
                className="bg-background mt-1 w-full rounded-lg border p-2.5 text-sm"
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
            <Checkbox id="has_lab" checked={data.has_lab} onCheckedChange={(checked) => setData('has_lab', !!checked)} />
            <Label htmlFor="has_lab" className="cursor-pointer font-medium">
              {c.subjects.hasLab}
            </Label>
          </div>

          <div>
            <Label htmlFor="description">{c.subjects.description}</Label>
            <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={3} />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={processing}>
              {c.subjects.saveSubject}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cms/subjects">{c.common.cancel}</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
