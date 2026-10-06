import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCms } from '@/hooks/use-cms';
import AppLayout from '@/layouts/app-layout';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsTeacher } from '@/types/cms';
import { Head, Link, useForm } from '@inertiajs/react';

export default function TeacherEdit({ teacher }: { teacher: CmsTeacher }) {
  const { c } = useCms();

  const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
    { label: c.nav.teachers, href: '/cms/teachers' },
    { label: c.teachers.editTitle, href: `/cms/teachers/${teacher.id}/edit` },
  ]);

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
      <Head title={`${c.teachers.editTitle} ${teacher.name}`} />
      <div className="p-4 sm:p-6">
        <h1 className="font-display mb-6 text-3xl leading-snug font-extrabold">{c.teachers.editHeading}</h1>
        <form onSubmit={submit} className="bg-card space-y-5 rounded-xl border p-4 sm:p-6">
          <div>
            <Label htmlFor="name">{c.teachers.fullName}</Label>
            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
            {errors.name && <p className="text-destructive mt-1 text-xs">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">{c.common.email}</Label>
              <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
            </div>

            <div>
              <Label htmlFor="phone">{c.common.phone}</Label>
              <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="specialization">{c.teachers.specialization}</Label>
              <Input id="specialization" value={data.specialization} onChange={(e) => setData('specialization', e.target.value)} />
            </div>

            <div>
              <Label htmlFor="qualification">{c.teachers.qualification}</Label>
              <Input id="qualification" value={data.qualification} onChange={(e) => setData('qualification', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="join_date">{c.teachers.joinDate}</Label>
              <Input id="join_date" type="date" value={data.join_date} onChange={(e) => setData('join_date', e.target.value)} />
            </div>

            <div>
              <Label htmlFor="status">{c.teachers.employmentStatus}</Label>
              <select
                id="status"
                className="bg-background mt-1 w-full rounded-lg border p-2.5 text-sm"
                value={data.status}
                onChange={(e) => setData('status', e.target.value as typeof data.status)}
              >
                <option value="active">{c.labels.teacherStatus.active}</option>
                <option value="suspended">{c.labels.teacherStatus.suspended}</option>
                <option value="resigned">{c.labels.teacherStatus.resigned}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={processing}>
              {c.common.saveChanges}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cms/teachers">{c.common.cancel}</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
