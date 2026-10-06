import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsEnrollment, CmsSubject } from '@/types/cms';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import CmsImportExport from '@/components/cms/cms-import-export';
import { ClipboardPaste, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';

const GRADE_FIELDS = ['midterm', 'final', 'assignments', 'projects', 'participation'] as const;

interface PastedRow {
    enrollment_id: number;
    student_no: string;
    name: string;
    values: Partial<Record<(typeof GRADE_FIELDS)[number], number>>;
    warnings: string[];
}

interface ParseResult {
    rows: PastedRow[];
    unmatched: Array<{ line: number; identifier: string; reason: string }>;
}

export default function GradesIndex({
    subjects,
    selectedSubjectId,
    enrollments,
    gradesLocked = false,
    canEditGrades = true,
    gradeDeadline = null,
}: {
    subjects: CmsSubject[];
    selectedSubjectId: number;
    enrollments: CmsEnrollment[];
    gradesLocked?: boolean;
    canEditGrades?: boolean;
    gradeDeadline?: string | null;
}) {
    const { c, locale, canManage } = useCms();
    const ar = locale === 'ar';
    const serverErrors = usePage().props.errors as Record<string, string>;

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.grades, href: '/cms/grades' },
    ]);

    const [gradeState, setGradeState] = useState<Record<number, any>>({});
    const [saving, setSaving] = useState(false);

    // Paste-from-Excel dialog state
    const [pasteOpen, setPasteOpen] = useState(false);
    const [pasteText, setPasteText] = useState('');
    const [parsing, setParsing] = useState(false);
    const [pasteResult, setPasteResult] = useState<ParseResult | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const initial: Record<number, any> = {};
        enrollments.forEach((e) => {
            initial[e.id] = {
                midterm: e.grade?.midterm ?? '',
                final: e.grade?.final ?? '',
                assignments: e.grade?.assignments ?? '',
                projects: e.grade?.projects ?? '',
                participation: e.grade?.participation ?? '',
                _updated_at: e.grade?.updated_at ? new Date(e.grade.updated_at).toISOString() : null,
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

    const inputsDisabled = gradesLocked && !canEditGrades;

    const saveAllGrades = () => {
        if (inputsDisabled) return;
        setSaving(true);
        const payload = Object.entries(gradeState).map(([enrId, vals]) => ({
            enrollment_id: parseInt(enrId),
            midterm: vals.midterm !== '' ? parseFloat(vals.midterm) : null,
            final: vals.final !== '' ? parseFloat(vals.final) : null,
            assignments: vals.assignments !== '' ? parseFloat(vals.assignments) : null,
            projects: vals.projects !== '' ? parseFloat(vals.projects) : null,
            participation: vals.participation !== '' ? parseFloat(vals.participation) : null,
            _updated_at: vals._updated_at ?? null,
        }));

        router.post(
            '/cms/grades/bulk-update',
            { grades: payload },
            {
                onFinish: () => setSaving(false),
            }
        );
    };

    // ── Paste from Excel ────────────────────────────────────────────

    const csrfToken = () =>
        (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

    const openPasteDialog = () => {
        setPasteText('');
        setPasteResult(null);
        setPasteOpen(true);
    };

    const readClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text.trim() !== '') {
                setPasteText(text);
                setPasteResult(null);
            } else {
                textareaRef.current?.focus();
            }
        } catch {
            // Clipboard API unavailable or denied (mobile Safari…) — the
            // textarea is the manual fallback for Ctrl+V.
            textareaRef.current?.focus();
        }
    };

    const parsePaste = async () => {
        if (pasteText.trim() === '') {
            setPasteResult(null);
            toast.error(c.gradesPage.pasteEmpty);
            return;
        }

        setParsing(true);
        try {
            const res = await fetch('/cms/grades/parse-paste', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': csrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({ subject_id: selectedSubjectId, paste: pasteText }),
            });

            if (!res.ok) throw new Error(String(res.status));

            const data: ParseResult = await res.json();
            setPasteResult(data);

            if (data.rows.length === 0) {
                toast.error(c.gradesPage.pasteNoRows);
            }
        } catch {
            toast.error(c.gradesPage.pasteFailed);
        } finally {
            setParsing(false);
        }
    };

    const applyParsed = () => {
        if (!pasteResult || pasteResult.rows.length === 0) return;

        setGradeState((prev) => {
            const next = { ...prev };
            pasteResult.rows.forEach((row) => {
                const existing = next[row.enrollment_id] ?? {};
                const filled = { ...existing };
                GRADE_FIELDS.forEach((field) => {
                    const value = row.values[field];
                    if (value !== undefined) {
                        filled[field] = String(value);
                    }
                });
                next[row.enrollment_id] = filled;
            });
            return next;
        });

        setPasteOpen(false);
        toast.success(c.gradesPage.pasteApplied);
    };

    // ── Rendering helpers ───────────────────────────────────────────

    const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
    const exportTitle = c.gradesPage.exportTitle.replace('{subject}', selectedSubject?.name ?? '');
    const gradesExport = `/cms/grades/export?format=xlsx&subject_id=${selectedSubjectId}&title=${encodeURIComponent(exportTitle)}`;
    const gradesExportPdf = `/cms/grades/export?format=pdf&subject_id=${selectedSubjectId}&title=${encodeURIComponent(exportTitle)}`;

    const serverError = serverErrors?.grades ?? serverErrors?.midterm ?? Object.values(serverErrors ?? {})[0];
    const deadlineText = gradeDeadline
        ? new Date(gradeDeadline).toLocaleDateString(ar ? 'ar' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.nav.grades} />
            <div className="flex flex-col gap-6 p-4 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-snug">{c.gradesPage.title}</h1>
                        <p className="text-sm text-muted-foreground">{c.gradesPage.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {enrollments.length > 0 && !inputsDisabled && (
                            <Button variant="outline" onClick={openPasteDialog}>
                                <ClipboardPaste className="mr-2 h-4 w-4" />
                                {c.gradesPage.pasteFromExcel}
                            </Button>
                        )}
                        {enrollments.length > 0 && (
                            <Button onClick={saveAllGrades} disabled={saving || inputsDisabled}>
                                {saving ? c.common.saving : c.gradesPage.saveAll}
                            </Button>
                        )}
                    </div>
                </div>

                {gradesLocked && (
                    <div className={`p-4 rounded-xl border text-sm font-medium ${canEditGrades ? 'bg-warning/10 border-warning/20 text-warning' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
                        {canEditGrades
                            ? c.grades.lockedForTeachers
                            : deadlineText
                                ? c.grades.lockedUntil.replace('{date}', deadlineText)
                                : c.grades.lockedContactAdmin}
                    </div>
                )}

                {serverError && (
                    <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-sm font-medium text-destructive">
                        {serverError}
                    </div>
                )}

                <div className="bg-card p-4 rounded-xl border flex items-center gap-4">
                    <label className="text-sm font-semibold whitespace-nowrap">{c.gradesPage.selectSubject}</label>
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

                {canManage && (
                    <div className="rounded-xl border bg-card p-4 shadow-sm">
                        <div className="text-sm font-semibold mb-1">{c.gradesPage.importExport}</div>
                        <CmsImportExport
                            importEndpoint="/cms/grades/import"
                            templateUrl="/cms/grades/import/template"
                            exportUrl={gradesExport}
                            exportPdfUrl={gradesExportPdf}
                        />
                    </div>
                )}

                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-muted text-muted-foreground border-b text-xs">
                            <tr>
                                <th className="p-3">{c.gradesPage.studentName}</th>
                                <th className="p-3">{c.gradesPage.studentNo}</th>
                                <th className="p-3 text-center">{c.gradesPage.midterm}</th>
                                <th className="p-3 text-center">{c.gradesPage.final}</th>
                                <th className="p-3 text-center">{c.gradesPage.assignments}</th>
                                <th className="p-3 text-center">{c.gradesPage.projects}</th>
                                <th className="p-3 text-center">{c.gradesPage.participation}</th>
                                <th className="p-3 text-center">{c.gradesPage.total}</th>
                                <th className="p-3 text-center">{c.gradesPage.letterGrade}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-10 text-center text-muted-foreground">{c.gradesPage.empty}</td>
                                </tr>
                            ) : (
                                enrollments.map((enr) => {
                                    const g = gradeState[enr.id] || {};
                                    const tot = calcTotal(g);
                                    const lettr = calcLetter(tot);

                                    return (
                                        <tr key={enr.id} className="hover:bg-muted/50">
                                            <td className="p-3 font-semibold">{enr.student?.name}</td>
                                            <td className="p-3 text-xs text-muted-foreground tabular-nums">{enr.student?.student_no}</td>
                                            {GRADE_FIELDS.map((field) => (
                                                <td key={field} className="p-2 text-center">
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        disabled={inputsDisabled}
                                                        className="w-20 mx-auto text-center h-8"
                                                        value={g[field] ?? ''}
                                                        onChange={(e) => handleInputChange(enr.id, field, e.target.value)}
                                                    />
                                                </td>
                                            ))}
                                            <td className="p-3 text-center font-bold text-base tabular-nums">
                                                {tot}
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
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

            <Dialog open={pasteOpen} onOpenChange={(open) => !open && setPasteOpen(false)}>
                <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{c.gradesPage.pasteTitle}</DialogTitle>
                        <DialogDescription>{c.gradesPage.pasteDescription}</DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={readClipboard}>
                                <ClipboardCheck className="mr-2 h-4 w-4" />
                                {c.gradesPage.pasteFromClipboard}
                            </Button>
                            <Button type="button" size="sm" onClick={parsePaste} disabled={parsing}>
                                {parsing ? c.gradesPage.pasteParsing : c.gradesPage.pasteParse}
                            </Button>
                        </div>

                        <Textarea
                            ref={textareaRef}
                            rows={6}
                            dir="ltr"
                            className="font-mono text-xs"
                            placeholder={'2026-0001\t27,5\t40\t\t15,5\t5\n2026-0002\t33\t41,5\t12\t9\t4,5'}
                            value={pasteText}
                            onChange={(e) => {
                                setPasteText(e.target.value);
                                setPasteResult(null);
                            }}
                        />

                        {pasteResult && (
                            <div className="flex flex-col gap-3">
                                <p className="text-sm font-semibold">
                                    {c.gradesPage.pasteMatched.replace('{count}', String(pasteResult.rows.length))}
                                </p>

                                {pasteResult.rows.length > 0 && (
                                    <div className="rounded-lg border overflow-x-auto">
                                        <table className="w-full text-xs text-right">
                                            <thead className="bg-muted text-muted-foreground border-b">
                                                <tr>
                                                    <th className="p-2">{c.gradesPage.studentNo}</th>
                                                    <th className="p-2">{c.gradesPage.studentName}</th>
                                                    {GRADE_FIELDS.map((field) => (
                                                        <th key={field} className="p-2 text-center">{c.gradesPage[field]}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {pasteResult.rows.map((row) => (
                                                    <tr key={row.enrollment_id}>
                                                        <td className="p-2 tabular-nums">{row.student_no}</td>
                                                        <td className="p-2 font-medium">{row.name}</td>
                                                        {GRADE_FIELDS.map((field) => (
                                                            <td key={field} className="p-2 text-center tabular-nums">
                                                                {row.values[field] ?? '—'}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {pasteResult.rows.some((row) => row.warnings.length > 0) && (
                                    <div className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs">
                                        <p className="font-semibold mb-1">{c.gradesPage.pasteWarning}</p>
                                        <ul className="list-disc pr-4 space-y-0.5">
                                            {pasteResult.rows.flatMap((row) =>
                                                row.warnings.map((warning, i) => (
                                                    <li key={`${row.enrollment_id}-${i}`} className="text-warning-foreground">
                                                        {row.name}: {warning}
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                )}

                                {pasteResult.unmatched.length > 0 && (
                                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs">
                                        <p className="font-semibold mb-1">{c.gradesPage.pasteUnmatched}</p>
                                        <p className="text-muted-foreground mb-2">{c.gradesPage.pasteUnmatchedHint}</p>
                                        <ul className="list-disc pr-4 space-y-0.5">
                                            {pasteResult.unmatched.map((row) => (
                                                <li key={row.line} className="text-destructive">
                                                    <span className="tabular-nums">#{row.line}</span> — {row.identifier || '—'}: {row.reason}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setPasteOpen(false)}>
                            {c.common.cancel}
                        </Button>
                        <Button
                            type="button"
                            onClick={applyParsed}
                            disabled={!pasteResult || pasteResult.rows.length === 0}
                        >
                            {c.gradesPage.pasteApply}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
