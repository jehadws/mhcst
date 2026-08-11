import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CmsEnrollment, CmsSubject } from '@/types/cms';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CmsImportExport from '@/components/cms/cms-import-export';
import { useState, useEffect } from 'react';

export default function GradesIndex({
    subjects,
    selectedSubjectId,
    enrollments,
}: {
    subjects: CmsSubject[];
    selectedSubjectId: number;
    enrollments: CmsEnrollment[];
}) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'النظام الأكاديمي', href: '/cms/dashboard' },
        { title: 'رصد الدرجات الأكاديمية', href: '/cms/grades' },
    ];

    const [gradeState, setGradeState] = useState<Record<number, any>>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const initial: Record<number, any> = {};
        enrollments.forEach((e) => {
            initial[e.id] = {
                midterm: e.grade?.midterm ?? '',
                final: e.grade?.final ?? '',
                assignments: e.grade?.assignments ?? '',
                projects: e.grade?.projects ?? '',
                participation: e.grade?.participation ?? '',
            };
        });
        setGradeState(initial);
    }, [enrollments]);

    const handleSubjectChange = (id: string) => {
        router.get('/cms/grades', { subject_id: id }, { preserveState: true });
    };

    const handleInputChange = (enrollmentId: number, field: string, value: string) => {
        setGradeState((prev) => ({
            ...prev,
            [enrollmentId]: {
                ...prev[enrollmentId],
                [field]: value,
            },
        }));
    };

    const calcTotal = (g: any) => {
        if (!g) return 0;
        const mid = parseFloat(g.midterm) || 0;
        const fin = parseFloat(g.final) || 0;
        const ass = parseFloat(g.assignments) || 0;
        const prj = parseFloat(g.projects) || 0;
        const par = parseFloat(g.participation) || 0;
        const total = mid * 0.30 + fin * 0.40 + ass * 0.15 + prj * 0.10 + par * 0.05;
        return round(total, 2);
    };

    const round = (num: number, decimals: number) => {
        return Number(Math.round(Number(num + 'e' + decimals)) + 'e-' + decimals);
    };

    const calcLetter = (total: number) => {
        if (total >= 90) return 'A';
        if (total >= 85) return 'B+';
        if (total >= 80) return 'B';
        if (total >= 75) return 'C+';
        if (total >= 70) return 'C';
        if (total >= 65) return 'D';
        return 'F';
    };

    const saveAllGrades = () => {
        setSaving(true);
        const payload = Object.entries(gradeState).map(([enrId, vals]) => ({
            enrollment_id: parseInt(enrId),
            midterm: vals.midterm !== '' ? parseFloat(vals.midterm) : null,
            final: vals.final !== '' ? parseFloat(vals.final) : null,
            assignments: vals.assignments !== '' ? parseFloat(vals.assignments) : null,
            projects: vals.projects !== '' ? parseFloat(vals.projects) : null,
            participation: vals.participation !== '' ? parseFloat(vals.participation) : null,
        }));

        router.post(
            '/cms/grades/bulk-update',
            { grades: payload },
            {
                onFinish: () => setSaving(false),
            }
        );
    };

    const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
    const gradesExport = `/cms/grades/export?format=xlsx&subject_id=${selectedSubjectId}&title=${encodeURIComponent(`كشف درجات - ${selectedSubject?.name ?? ''}`)}`;
    const gradesExportPdf = `/cms/grades/export?format=pdf&subject_id=${selectedSubjectId}&title=${encodeURIComponent(`كشف درجات - ${selectedSubject?.name ?? ''}`)}`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="رصد الدرجات" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">كشف ورصد الدرجات الأكاديمية</h1>
                        <p className="text-sm text-slate-500">حساب تلقائي للمجموع والتقديرات حسب الأوزان المعتمدة</p>
                    </div>
                    {enrollments.length > 0 && (
                        <Button onClick={saveAllGrades} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                            {saving ? 'جاري الحفظ...' : 'حفظ كشف الدرجات بالكامل'}
                        </Button>
                    )}
                </div>

                {/* Subject Selector */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border flex items-center gap-4">
                    <label className="text-sm font-semibold whitespace-nowrap">اختر المادة الدراسية:</label>
                    <select
                        className="w-full max-w-md p-2.5 rounded-lg border bg-background text-sm"
                        value={selectedSubjectId}
                        onChange={(e) => handleSubjectChange(e.target.value)}
                    >
                        {subjects.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({s.code})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Import / Export toolbar */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="text-sm font-semibold mb-1">استيراد وتصدير كشوف الدرجات</div>
                    <CmsImportExport
                        importEndpoint="/cms/grades/import"
                        templateUrl="/cms/grades/import/template"
                        exportUrl={gradesExport}
                        exportPdfUrl={gradesExportPdf}
                    />
                </div>

                {/* Grade Entry Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b text-xs">
                            <tr>
                                <th className="p-3">اسم الطالب</th>
                                <th className="p-3">رقم القيد</th>
                                <th className="p-3 text-center">النصفي (30%)</th>
                                <th className="p-3 text-center">النهائي (40%)</th>
                                <th className="p-3 text-center">الواجبات (15%)</th>
                                <th className="p-3 text-center">المشاريع (10%)</th>
                                <th className="p-3 text-center">المشاركة (5%)</th>
                                <th className="p-3 text-center">المجموع (100)</th>
                                <th className="p-3 text-center">التقدير</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-6 text-center text-slate-500">لا يوجد طلاب مسجلون في هذه المادة</td>
                                </tr>
                            ) : (
                                enrollments.map((enr) => {
                                    const g = gradeState[enr.id] || {};
                                    const tot = calcTotal(g);
                                    const lettr = calcLetter(tot);

                                    return (
                                        <tr key={enr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                            <td className="p-3 font-semibold">{enr.student?.name}</td>
                                            <td className="p-3 font-mono text-xs text-slate-500">{enr.student?.student_no}</td>
                                            <td className="p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="w-20 mx-auto text-center h-8"
                                                    value={g.midterm ?? ''}
                                                    onChange={(e) => handleInputChange(enr.id, 'midterm', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="w-20 mx-auto text-center h-8"
                                                    value={g.final ?? ''}
                                                    onChange={(e) => handleInputChange(enr.id, 'final', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="w-20 mx-auto text-center h-8"
                                                    value={g.assignments ?? ''}
                                                    onChange={(e) => handleInputChange(enr.id, 'assignments', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="w-20 mx-auto text-center h-8"
                                                    value={g.projects ?? ''}
                                                    onChange={(e) => handleInputChange(enr.id, 'projects', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-2 text-center">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="w-20 mx-auto text-center h-8"
                                                    value={g.participation ?? ''}
                                                    onChange={(e) => handleInputChange(enr.id, 'participation', e.target.value)}
                                                />
                                            </td>
                                            <td className="p-3 text-center font-bold text-indigo-600 dark:text-indigo-400 text-base">
                                                {tot}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="px-2.5 py-1 rounded text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                                                    {lettr}
                                                </span>
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
