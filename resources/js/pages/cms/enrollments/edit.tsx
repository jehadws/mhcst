import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CmsErrorBanner from '@/components/cms/cms-error-banner';
import { useCms } from '@/hooks/use-cms';
import AppLayout from '@/layouts/app-layout';
import { cmsBreadcrumbs, semesterLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsEnrollment, CmsStudent, CmsSubject } from '@/types/cms';
import { Head, Link, useForm } from '@inertiajs/react';

/**
 * Mirror of the server-side state machine: the current status is always
 * selectable (no-op save), plus the transitions the backend allows.
 */
const ENROLLMENT_TRANSITIONS: Record<string, string[]> = {
    pending: ['active', 'withdrawn'],
    active: ['withdrawn', 'completed'],
    dropped: ['pending', 'withdrawn'],
    withdrawn: ['pending'],
    completed: [],
};

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

  // Identity (student, subject, term) is immutable server-side: it is shown
  // read-only and still sent so the request validates.
  const student = students.find((s) => s.id === enrollment.student_id);
  const subject = subjects.find((sub) => sub.id === enrollment.subject_id);
  const statusOptions = [enrollment.status, ...(ENROLLMENT_TRANSITIONS[enrollment.status] ?? [])];

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
          <CmsErrorBanner />
          <div>
            <Label htmlFor="student_id">{c.enrollments.student}</Label>
            <p id="student_id" className="bg-muted mt-1 w-full rounded-lg border p-2.5 text-sm">
              {student ? `${student.name} (${student.student_no})` : data.student_id}
            </p>
          </div>

          <div>
            <Label htmlFor="subject_id">{c.enrollments.subject}</Label>
            <p id="subject_id" className="bg-muted mt-1 w-full rounded-lg border p-2.5 text-sm">
              {subject ? `${subject.name} (${subject.code})` : data.subject_id}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="academic_year">{c.enrollments.academicYear}</Label>
              <p id="academic_year" className="bg-muted mt-1 w-full rounded-lg border p-2.5 text-sm">
                {data.academic_year}
              </p>
            </div>
            <div>
              <Label htmlFor="semester">{c.enrollments.semester}</Label>
              <p id="semester" className="bg-muted mt-1 w-full rounded-lg border p-2.5 text-sm">
                {semesterLabel(c, data.semester)}
              </p>
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
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {c.labels.enrollmentStatus[status as keyof typeof c.labels.enrollmentStatus]}
                </option>
              ))}
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
