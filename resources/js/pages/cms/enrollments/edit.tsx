import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCms } from '@/hooks/use-cms';
import AppLayout from '@/layouts/app-layout';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsEnrollment, CmsStudent, CmsSubject } from '@/types/cms';
import { Head, Link, useForm } from '@inertiajs/react';

export default function EnrollmentEdit({
  enrollment,
  students,
  subjects,
}: {
  enrollment: CmsEnrollment;
  students: CmsStudent[];
  subjects: CmsSubject[];
}) {
  const { c } = useCms();

  const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
    { label: c.nav.enrollments, href: '/cms/enrollments' },
    { label: c.enrollments.editTitle, href: `/cms/enrollments/${enrollment.id}/edit` },
  ]);

  const { data, setData, put, processing } = useForm({
    student_id: String(enrollment.student_id),
    subject_id: String(enrollment.subject_id),
    academic_year: enrollment.academic_year,
    semester: enrollment.semester,
    status: enrollment.status,
    withdrawn_reason: enrollment.withdrawn_reason ?? '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/cms/enrollments/${enrollment.id}`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={c.enrollments.editTitle} />
      <div className="p-6">
        <h1 className="font-display mb-6 text-3xl leading-snug font-extrabold">{c.enrollments.editHeading}</h1>

        <form onSubmit={submit} className="bg-card space-y-5 rounded-xl border p-6">
          <div>
            <Label htmlFor="student_id">{c.enrollments.student}</Label>
            <select
              id="student_id"
              className="bg-background mt-1 w-full rounded-lg border p-2.5 text-sm"
              value={data.student_id}
              onChange={(e) => setData('student_id', e.target.value)}
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.student_no})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="subject_id">{c.enrollments.subject}</Label>
            <select
              id="subject_id"
              className="bg-background mt-1 w-full rounded-lg border p-2.5 text-sm"
              value={data.subject_id}
              onChange={(e) => setData('subject_id', e.target.value)}
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name} ({sub.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="academic_year">{c.enrollments.academicYear}</Label>
              <input
                id="academic_year"
                className="bg-background mt-1 w-full rounded-lg border p-2.5 text-sm"
                value={data.academic_year}
                onChange={(e) => setData('academic_year', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="semester">{c.enrollments.semester}</Label>
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

          <div>
            <Label htmlFor="status">{c.enrollments.enrollmentStatus}</Label>
            <select
              id="status"
              className="bg-background mt-1 w-full rounded-lg border p-2.5 text-sm"
              value={data.status}
              onChange={(e) => setData('status', e.target.value as typeof data.status)}
            >
              <option value="pending">{c.labels.enrollmentStatus.pending}</option>
              <option value="active">{c.labels.enrollmentStatus.active}</option>
              <option value="dropped">{c.labels.enrollmentStatus.dropped}</option>
              <option value="withdrawn">{c.labels.enrollmentStatus.withdrawn}</option>
              <option value="completed">{c.labels.enrollmentStatus.completed}</option>
            </select>
            <p className="text-muted-foreground mt-1 text-xs">{c.enrollments.statusHint}</p>
          </div>

          {data.status === 'withdrawn' && (
            <div>
              <Label htmlFor="withdrawn_reason">{c.enrollments.withdrawnReason}</Label>
              <Textarea
                id="withdrawn_reason"
                className="mt-1"
                rows={3}
                maxLength={500}
                value={data.withdrawn_reason ?? ''}
                onChange={(e) => setData('withdrawn_reason', e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" disabled={processing}>
              {c.common.saveChanges}
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cms/enrollments">{c.common.cancel}</Link>
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
