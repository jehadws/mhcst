import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock } from 'lucide-react';

export default function CmsSettingsIndex({
    settings,
}: {
    settings: {
        grade_entry_deadline: string | null;
        grades_locked: boolean;
        is_locked: boolean;
        academic_year: string | null;
        semester_start: string | null;
        semester_end: string | null;
        consecutive_absence_threshold: number;
        absence_rate_threshold: number;
    };
}) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.academicSettings, href: '/cms/settings' },
    ]);

    const { data, setData, put, processing } = useForm({
        grade_entry_deadline: settings.grade_entry_deadline ?? '',
        grades_locked: settings.grades_locked,
        academic_year: settings.academic_year ?? '',
        semester_start: settings.semester_start ?? '',
        semester_end: settings.semester_end ?? '',
        consecutive_absence_threshold: settings.consecutive_absence_threshold,
        absence_rate_threshold: settings.absence_rate_threshold,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put('/cms/settings');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.settings.title} />
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{c.settings.title}</h1>
                        <p className="text-sm text-muted-foreground">{c.settings.subtitle}</p>
                    </div>
                    <Badge variant={settings.is_locked ? 'destructive' : 'secondary'} className="gap-1">
                        {settings.is_locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {settings.is_locked ? c.settings.locked : c.settings.unlocked}
                    </Badge>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <section className="space-y-4 bg-card border rounded-2xl p-6">
                        <h2 className="font-semibold">{c.settings.calendarSection}</h2>
                        <div>
                            <Label htmlFor="academic_year">{c.settings.academicYear}</Label>
                            <Input id="academic_year" value={data.academic_year} onChange={(e) => setData('academic_year', e.target.value)} className="mt-1" placeholder="2025-2026" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="semester_start">{c.settings.semesterStart}</Label>
                                <Input id="semester_start" type="date" value={data.semester_start} onChange={(e) => setData('semester_start', e.target.value)} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="semester_end">{c.settings.semesterEnd}</Label>
                                <Input id="semester_end" type="date" value={data.semester_end} onChange={(e) => setData('semester_end', e.target.value)} className="mt-1" />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4 bg-card border rounded-2xl p-6">
                        <h2 className="font-semibold">{c.settings.gradesSection}</h2>
                        <div>
                            <Label htmlFor="grade_entry_deadline">{c.settings.deadline}</Label>
                            <Input id="grade_entry_deadline" type="date" value={data.grade_entry_deadline} onChange={(e) => setData('grade_entry_deadline', e.target.value)} className="mt-1" />
                            <p className="text-xs text-muted-foreground mt-1">{c.settings.deadlineHint}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Checkbox id="grades_locked" checked={data.grades_locked} onCheckedChange={(checked) => setData('grades_locked', !!checked)} />
                            <Label htmlFor="grades_locked" className="cursor-pointer">{c.settings.manualLock}</Label>
                        </div>
                    </section>

                    <section className="space-y-4 bg-card border rounded-2xl p-6">
                        <h2 className="font-semibold">{c.settings.attendanceSection}</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="consecutive_absence_threshold">{c.settings.consecutiveAbsenceThreshold}</Label>
                                <Input id="consecutive_absence_threshold" type="number" min={1} max={30} value={data.consecutive_absence_threshold} onChange={(e) => setData('consecutive_absence_threshold', Number(e.target.value))} className="mt-1" />
                            </div>
                            <div>
                                <Label htmlFor="absence_rate_threshold">{c.settings.absenceRateThreshold}</Label>
                                <Input id="absence_rate_threshold" type="number" min={1} max={100} step={0.1} value={data.absence_rate_threshold} onChange={(e) => setData('absence_rate_threshold', Number(e.target.value))} className="mt-1" />
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={processing}>{c.common.save}</Button>
                        <Button variant="outline" asChild>
                            <Link href="/cms/audit-logs">{c.nav.auditLog}</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
