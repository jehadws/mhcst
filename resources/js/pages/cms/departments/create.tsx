import ImageUploader from '@/components/image-uploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCms } from '@/hooks/use-cms';
import AppLayout from '@/layouts/app-layout';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsTeacher } from '@/types/cms';
import { Head, Link, useForm } from '@inertiajs/react';

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
    image: null as string | null,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/cms/departments');
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={c.departments.addTitle} />
      <div className="mx-auto max-w-2xl p-6">
        <h1 className="mb-6 font-display text-3xl font-extrabold leading-snug">{c.departments.addHeading}</h1>
        <form onSubmit={submit} className="space-y-5 rounded-xl border bg-card p-6">
          <div>
            <Label htmlFor="name">{c.departments.name}</Label>
            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder={c.departments.namePlaceholder} />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="head_id">{c.departments.headLabel}</Label>
            <select
              id="head_id"
              className="bg-background w-full rounded-lg border p-2.5 text-sm"
              value={data.head_id}
              onChange={(e) => setData('head_id', e.target.value)}
            >
              <option value="">{c.departments.selectHead}</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="description">{c.departments.description}</Label>
            <Textarea id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} rows={4} />
          </div>

          <div>
            <ImageUploader value={data.image} onChange={(path) => setData('image', path)} folder="departments" label={c.departments.image} />
            {errors.image && <p className="mt-1 text-xs text-destructive">{errors.image}</p>}
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={processing}>
              {c.departments.saveDepartment}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cms/departments">{c.common.cancel}</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
