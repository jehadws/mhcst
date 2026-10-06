import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsEnrollment, CmsSubject } from '@/types/cms';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Clock, Download, FileText, ShieldCheck, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AttendanceIndex({
    subjects,
    selectedSubjectId,
    date,
    enrollments,
    alerts,
}: {
    subjects: CmsSubject[];
    selectedSubjectId: number;
    date: string;
    enrollments: CmsEnrollment[];
    alerts: Record<number, any>;
}) {
    const { c, canManage } = useCms();
    const serverErrors = usePage().props.errors as Record<string, string>;
    const serverError = serverErrors ? Object.values(serverErrors)[0] : null;

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.attendance, href: '/cms/attendance' },
    ]);

    const [attendanceState, setAttendanceState] = useState<Record<number, string>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const initial: Record<number, string> = {};
        enrollments.forEach((e) => {
            initial[e.id] = e.attendance && e.attendance[0] ? e.attendance[0].status : 'present';
        });
        setAttendanceState(initial);
    }, [enrollments]);

    const handleSubjectDateChange = (subId: number, d: string) => {
        router.get('/cms/attendance', { subject_id: subId, date: d }, { preserveState: true });
    };

    const setStatus = (enrollmentId: number, status: string) => {
        setAttendanceState((prev) => ({ ...prev, [enrollmentId]: status }));
    };

    const markAllPresent = () => {
        const updated: Record<number, string> = {};
        enrollments.forEach((e) => {
            updated[e.id] = 'present';
        });
        setAttendanceState(updated);
    };

    const saveAttendance = () => {
        setSaving(true);
        const records = Object.entries(attendanceState).map(([enrId, status]) => ({
            enrollment_id: parseInt(enrId),
            status: status,
        }));

        router.post(
            '/cms/attendance/bulk',
            { date: date, records: records },
            {
                onFinish: () => setSaving(false),
            }
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.attendance.title} />
            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-snug">{c.attendance.title}</h1>
                        <p className="text-sm text-muted-foreground">{c.attendance.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {canManage && (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" asChild className="gap-2">
                                    <a href={`/cms/attendance/export?format=xlsx&subject_id=${selectedSubjectId}&date=${date}`}>
                                        <Download className="w-4 h-4" /> {c.common.exportExcel}
                                    </a>
                                </Button>
                                <Button variant="outline" size="sm" asChild className="gap-2">
                                    <a href={`/cms/attendance/export?format=pdf&subject_id=${selectedSubjectId}&date=${date}`} target="_blank" rel="noopener noreferrer">
                                        <FileText className="w-4 h-4" /> {c.common.exportPdf}
                                    </a>
                                </Button>
                            </div>
                        )}
                        <Button variant="outline" onClick={markAllPresent}>{c.attendance.markAllPresent}</Button>
                        <Button onClick={saveAttendance} disabled={saving}>
                            {saving ? c.common.saving : c.attendance.saveSheet}
                        </Button>
                    </div>
                </div>

                {serverError && (
                    <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-sm font-medium text-destructive">
                        {serverError}
                    </div>
                )}

                <div className="bg-card p-4 rounded-xl border flex flex-wrap items-center gap-4">
                    <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">{c.attendance.selectSubject}</label>
                        <select
                            className="p-2 rounded-lg border bg-background text-sm min-w-[250px]"
                            value={selectedSubjectId}
                            onChange={(e) => handleSubjectDateChange(parseInt(e.target.value), date)}
                        >
                            {subjects.map((s) => (
                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">{c.attendance.selectDate}</label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => handleSubjectDateChange(selectedSubjectId, e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-card border rounded-xl overflow-x-auto shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-muted text-muted-foreground border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.attendance.studentName}</th>
                                <th className="p-4 font-semibold">{c.attendance.studentNo}</th>
                                <th className="p-4 font-semibold text-center">{c.attendance.todayStatus}</th>
                                <th className="p-4 font-semibold">{c.attendance.absenceAlerts}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">{c.attendance.empty}</td>
                                </tr>
                            ) : (
                                enrollments.map((enr) => {
                                    const st = attendanceState[enr.id] || 'present';
                                    const alertInfo = alerts[enr.id];

                                    return (
                                        <tr key={enr.id} className="hover:bg-muted/50">
                                            <td className="p-4 font-semibold">{enr.student?.name}</td>
                                            <td className="p-4 text-xs tabular-nums">{enr.student?.student_no}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setStatus(enr.id, 'present')}
                                                        className={`px-3 py-1 rounded-sm text-xs font-semibold flex items-center gap-1 transition ${
                                                            st === 'present' ? 'bg-success text-success-foreground shadow-sm' : 'bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5" /> {c.labels.attendanceStatus.present}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setStatus(enr.id, 'absent')}
                                                        className={`px-3 py-1 rounded-sm text-xs font-semibold flex items-center gap-1 transition ${
                                                            st === 'absent' ? 'bg-destructive text-destructive-foreground shadow-sm' : 'bg-muted text-muted-foreground'
                                                        }`}
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" /> {c.labels.attendanceStatus.absent}
                                                    </button>
                    <button
                        type="button"
                        onClick={() => setStatus(enr.id, 'late')}
                        className={`px-3 py-1 rounded-sm text-xs font-semibold flex items-center gap-1 transition ${
                            st === 'late' ? 'bg-warning text-warning-foreground shadow-sm' : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" /> {c.labels.attendanceStatus.late}
                    </button>
                    <button
                        type="button"
                        onClick={() => setStatus(enr.id, 'excused')}
                        className={`px-3 py-1 rounded-sm text-xs font-semibold flex items-center gap-1 transition ${
                            st === 'excused' ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-muted text-muted-foreground'
                        }`}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" /> {c.labels.attendanceStatus.excused}
                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {alertInfo ? (
                                                    <div className="flex items-center gap-1 text-xs text-destructive font-semibold bg-destructive/10 p-1.5 rounded-sm">
                                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                                        {alertInfo.alert_reasons.join(' ')}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">{c.attendance.ok}</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
