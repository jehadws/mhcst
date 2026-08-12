import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsEnrollment, CmsSubject } from '@/types/cms';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Clock, Download, FileText, XCircle } from 'lucide-react';
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
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{c.attendance.title}</h1>
                        <p className="text-sm text-slate-500">{c.attendance.subtitle}</p>
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
                        <Button onClick={saveAttendance} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                            {saving ? c.common.saving : c.attendance.saveSheet}
                        </Button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border flex flex-wrap items-center gap-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 block mb-1">{c.attendance.selectSubject}</label>
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
                        <label className="text-xs font-semibold text-slate-500 block mb-1">{c.attendance.selectDate}</label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => handleSubjectDateChange(selectedSubjectId, e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.attendance.studentName}</th>
                                <th className="p-4 font-semibold">{c.attendance.studentNo}</th>
                                <th className="p-4 font-semibold text-center">{c.attendance.todayStatus}</th>
                                <th className="p-4 font-semibold">{c.attendance.absenceAlerts}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-6 text-center text-slate-500">{c.attendance.empty}</td>
                                </tr>
                            ) : (
                                enrollments.map((enr) => {
                                    const st = attendanceState[enr.id] || 'present';
                                    const alertInfo = alerts[enr.id];

                                    return (
                                        <tr key={enr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="p-4 font-semibold">{enr.student?.name}</td>
                                            <td className="p-4 font-mono text-xs">{enr.student?.student_no}</td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setStatus(enr.id, 'present')}
                                                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                                            st === 'present' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                                                        }`}
                                                    >
                                                        <CheckCircle className="w-3.5 h-3.5" /> {c.labels.attendanceStatus.present}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setStatus(enr.id, 'absent')}
                                                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                                            st === 'absent' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                                                        }`}
                                                    >
                                                        <XCircle className="w-3.5 h-3.5" /> {c.labels.attendanceStatus.absent}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setStatus(enr.id, 'late')}
                                                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                                                            st === 'late' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                                                        }`}
                                                    >
                                                        <Clock className="w-3.5 h-3.5" /> {c.labels.attendanceStatus.late}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {alertInfo ? (
                                                    <div className="flex items-center gap-1 text-xs text-rose-600 font-semibold bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-lg">
                                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                                        {alertInfo.alert_reasons.join(' ')}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">{c.attendance.ok}</span>
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
