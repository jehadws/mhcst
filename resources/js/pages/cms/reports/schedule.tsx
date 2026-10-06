import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsLevel, CmsSchedule } from '@/types/cms';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Calendar, FileText } from 'lucide-react';

export default function ScheduleReport({
    levels,
    schedules,
    filters,
}: {
    levels: CmsLevel[];
    schedules: CmsSchedule[];
    filters: { level_id: number | null };
}) {
    const { c } = useCms();
    const r = c.reports.schedule;

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.reports, href: '/cms/reports' },
        { label: r.pageTitle, href: '/cms/reports/schedule' },
    ]);

    const levelId = filters.level_id ?? levels[0]?.id ?? 0;
    const pdfUrl = `/cms/reports/schedule?format=pdf&level_id=${levelId}&title=${encodeURIComponent(r.pageTitle)}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={r.pageTitle} />
            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-snug flex items-center gap-2">
                            <Calendar className="w-6 h-6 text-success" /> {r.pageTitle}
                        </h1>
                        <p className="text-sm text-muted-foreground">{r.pageSubtitle}</p>
                    </div>
                    <Button variant="outline" asChild className="gap-2">
                        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                            <FileText className="w-4 h-4" /> {r.exportPdf}
                        </a>
                    </Button>
                </div>

                <div className="bg-card p-4 rounded-xl border flex flex-wrap items-center gap-4">
                    <label className="text-sm font-semibold">{r.selectLevel}</label>
                    <select
                        className="max-w-md flex-1 p-2.5 rounded-lg border bg-background text-sm"
                        value={levelId}
                        onChange={(e) => router.get('/cms/reports/schedule', { level_id: e.target.value }, { preserveState: true })}
                    >
                        {levels.map((level) => (
                            <option key={level.id} value={level.id}>
                                {level.department?.name} — {c.levels.yearSection.replace('{year}', String(level.year)).replace('{section}', level.section)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="bg-card border rounded-xl overflow-x-auto shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-muted text-muted-foreground border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.common.day}</th>
                                <th className="p-4 font-semibold">{c.common.time}</th>
                                <th className="p-4 font-semibold">{c.common.subject}</th>
                                <th className="p-4 font-semibold">{c.common.teacher}</th>
                                <th className="p-4 font-semibold">{c.common.room}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {schedules.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">{r.empty}</td>
                                </tr>
                            ) : (
                                schedules.map((schedule) => (
                                    <tr key={schedule.id} className="hover:bg-muted/50">
                                        <td className="p-4">{schedule.day}</td>
                                        <td className="p-4">{schedule.start_time} – {schedule.end_time}</td>
                                        <td className="p-4">{schedule.subject?.name}</td>
                                        <td className="p-4">{schedule.teacher?.name ?? c.schedules.teacherTba}</td>
                                        <td className="p-4">{schedule.room}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
