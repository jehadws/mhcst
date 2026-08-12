import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs, enrollmentStatusLabel, semesterLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsEnrollment } from '@/types/cms';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export default function EnrollmentShow({ enrollment }: { enrollment: CmsEnrollment }) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.enrollments, href: '/cms/enrollments' },
        { label: enrollment.student?.name ?? c.enrollments.showDetails, href: `/cms/enrollments/${enrollment.id}` },
    ]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.enrollments.showTitle.replace('{name}', enrollment.student?.name ?? '')} />
            <div className="max-w-3xl mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{enrollment.student?.name}</h1>
                        <p className="text-sm text-slate-500">{enrollment.subject?.name} ({enrollment.subject?.code})</p>
                    </div>
                    <Button asChild variant="outline" className="gap-2">
                        <Link href={`/cms/enrollments/${enrollment.id}/edit`}>
                            <Edit className="w-4 h-4" /> {c.common.edit}
                        </Link>
                    </Button>
                </div>

                <dl className="bg-white dark:bg-slate-900 border rounded-2xl divide-y text-sm">
                    <div className="flex justify-between p-4">
                        <dt className="text-slate-500">{c.enrollments.studentNo}</dt>
                        <dd className="font-semibold font-mono">{enrollment.student?.student_no}</dd>
                    </div>
                    <div className="flex justify-between p-4">
                        <dt className="text-slate-500">{c.common.department}</dt>
                        <dd className="font-semibold">{enrollment.student?.level?.department?.name ?? '—'}</dd>
                    </div>
                    <div className="flex justify-between p-4">
                        <dt className="text-slate-500">{c.enrollments.yearSemester}</dt>
                        <dd className="font-semibold">{enrollment.academic_year} — {semesterLabel(c, enrollment.semester)}</dd>
                    </div>
                    <div className="flex justify-between p-4">
                        <dt className="text-slate-500">{c.common.status}</dt>
                        <dd className="font-semibold">{enrollmentStatusLabel(c, enrollment.status)}</dd>
                    </div>
                    {enrollment.grade && (
                        <div className="flex justify-between p-4">
                            <dt className="text-slate-500">{c.common.grade}</dt>
                            <dd className="font-semibold">{enrollment.grade.total ?? '—'}</dd>
                        </div>
                    )}
                    <div className="flex justify-between p-4">
                        <dt className="text-slate-500">{c.enrollments.attendanceRecords}</dt>
                        <dd className="font-semibold">{enrollment.attendance?.length ?? 0}</dd>
                    </div>
                </dl>
            </div>
        </AppLayout>
    );
}
