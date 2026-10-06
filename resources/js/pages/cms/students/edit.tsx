import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCms } from '@/hooks/use-cms';
import AppLayout from '@/layouts/app-layout';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsLevel, CmsStudent } from '@/types/cms';
import { Head, Link, useForm } from '@inertiajs/react';

export default function StudentEdit({ student, levels }: { student: CmsStudent; levels: CmsLevel[] }) {
  const { c } = useCms();

  const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
    { label: c.nav.students, href: '/cms/students' },
    { label: c.students.editTitle, href: `/cms/students/${student.id}/edit` },
  ]);

  const { data, setData, put, processing } = useForm({
    student_no: student.student_no,
    name: student.name,
    email: student.email || '',
    phone: student.phone || '',
    level_id: String(student.level_id),
    enrollment_date: student.enrollment_date ? student.enrollment_date.substring(0, 10) : '',
    status: student.status,
    gender: student.gender || 'male',
    birth_date: student.birth_date ? student.birth_date.substring(0, 10) : '',
    address: student.address || '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/cms/students/${student.id}`);
  };

  const levelOptionLabel = (level: CmsLevel) =>
    c.students.levelOption
      .replace('{department}', level.department?.name ?? '')
      .replace('{year}', String(level.year))
      .replace('{section}', level.section);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${c.students.editTitle} ${student.name}`} />
      <div className="p-4 sm:p-6">
        <h1 className="font-display mb-6 text-3xl leading-snug font-extrabold">{c.students.editHeading}</h1>
        <form onSubmit={submit} className="bg-card space-y-5 rounded-xl border p-4 sm:p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="student_no">{c.students.studentNo}</Label>
              <Input id="student_no" value={data.student_no} onChange={(e) => setData('student_no', e.target.value)} />
            </div>

            <div>
              <Label htmlFor="name">{c.students.fullName.replace(' *', '')} *</Label>
              <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
            </div>
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
              <Label htmlFor="level_id">{c.students.departmentSection}</Label>
              <select
                id="level_id"
                className="bg-background mt-1 w-full rounded-lg border p-2.5 text-sm"
                value={data.level_id}
                onChange={(e) => setData('level_id', e.target.value)}
              >
                {levels.map((l) => (
                  <option key={l.id} value={l.id}>
                    {levelOptionLabel(l)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="status">{c.students.academicStatus}</Label>
              <select
                id="status"
                className="bg-background mt-1 w-full rounded-lg border p-2.5 text-sm"
                value={data.status}
                onChange={(e) => setData('status', e.target.value as typeof data.status)}
              >
                {/* Pending applicants are decided on the
                                    applications page, not via this dropdown. */}
                {data.status === 'pending' && <option value="pending">{c.labels.studentStatus.pending}</option>}
                <option value="active">{c.labels.studentStatus.active}</option>
                <option value="suspended">{c.labels.studentStatus.suspended}</option>
                <option value="graduated">{c.labels.studentStatus.graduated}</option>
                <option value="withdrawn">{c.labels.studentStatus.withdrawn}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={processing}>
              {c.common.saveChanges}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cms/students">{c.common.cancel}</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
