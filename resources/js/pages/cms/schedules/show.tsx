import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs, dayLabel, semesterLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsSchedule } from '@/types/cms';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

export default function ScheduleShow({ schedule }: { schedule: CmsSchedule }) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.schedules, href: '/cms/schedules' },
        { label: schedule.subject?.name ?? c.schedules.showDetails, href: `/cms/schedules/${schedule.id}` },
    ]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.schedules.showTitle.replace('{subject}', schedule.subject?.name ?? '')} />
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="font-display text-3xl font-extrabold leading-snug">{schedule.subject?.name}</h1>
                    <Button asChild variant="outline" className="gap-2">
                        <Link href={`/cms/schedules/${schedule.id}/edit`}>
                            <Edit className="w-4 h-4" /> {c.common.edit}
                        </Link>
                    </Button>
                </div>

                <dl className="bg-card border rounded-xl divide-y text-sm">
                    <div className="flex justify-between p-4">
                        <dt className="text-muted-foreground">{c.common.subject}</dt>
                        <dd className="font-semibold">{schedule.subject?.name} ({schedule.subject?.code})</dd>
                    </div>
                    <div className="flex justify-between p-4">
                        <dt className="text-muted-foreground">{c.common.teacher}</dt>
                        <dd className="font-semibold">{schedule.teacher?.name ?? c.schedules.teacherTba}</dd>
                    </div>
                    <div className="flex justify-between p-4">
                        <dt className="text-muted-foreground">{c.common.section}</dt>
                        <dd className="font-semibold">
                            {schedule.level?.department?.name} — {c.levels.yearLabel.replace('{year}', String(schedule.level?.year ?? ''))} / {schedule.level?.section}
                        </dd>
                    </div>
                    <div className="flex justify-between p-4">
                        <dt className="text-muted-foreground">{c.common.day}</dt>
                        <dd className="font-semibold">{dayLabel(c, schedule.day)}</dd>
                    </div>
                    <div className="flex justify-between p-4">
                        <dt className="text-muted-foreground">{c.common.time}</dt>
                        <dd className="font-semibold">{schedule.start_time} — {schedule.end_time}</dd>
                    </div>
                    <div className="flex justify-between p-4">
                        <dt className="text-muted-foreground">{c.common.room}</dt>
                        <dd className="font-semibold">{schedule.room || '—'}</dd>
                    </div>
                    <div className="flex justify-between p-4">
                        <dt className="text-muted-foreground">{c.schedules.yearSemester}</dt>
                        <dd className="font-semibold">{schedule.academic_year} — {semesterLabel(c, schedule.semester)}</dd>
                    </div>
                </dl>
            </div>
        </AppLayout>
    );
}
