import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs, enrollmentStatusLabel, semesterLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { CmsEnrollment, CmsSubject } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Eye, Edit, Check, X } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useMemo, useState } from 'react';

interface EnrollmentFilters {
    subject_id?: string;
    academic_year?: string;
    semester?: string;
    status?: string;
    source?: string;
}

export default function EnrollmentsIndex({ enrollments, subjects, filters = {} }: { enrollments: PaginatedData<CmsEnrollment>; subjects: CmsSubject[]; filters?: EnrollmentFilters }) {
    const { c, canManage } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.enrollments, href: '/cms/enrollments' },
    ]);

    const [deleteItem, setDeleteItem] = useState<CmsEnrollment | null>(null);
    const [rejectItem, setRejectItem] = useState<CmsEnrollment | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [busy, setBusy] = useState(false);

    const pendingIds = useMemo(
        () => enrollments.data.filter((enr) => enr.status === 'pending').map((enr) => enr.id),
        [enrollments.data],
    );
    const allPendingSelected = pendingIds.length > 0 && pendingIds.every((id) => selected.includes(id));

    const toggleSelected = (id: number) => {
        setSelected((current) => (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]));
    };

    const toggleSelectAllPending = () => {
        setSelected(allPendingSelected ? [] : pendingIds);
    };

    const applyFilter = (key: string, value: string) => {
        router.get('/cms/enrollments', { ...filters, [key]: value || undefined }, { preserveState: true });
    };

    const clearFilters = () => {
        router.get('/cms/enrollments', {}, { preserveState: true });
    };

    const approve = (ids: number[]) => {
        if (ids.length === 0 || busy) return;
        setBusy(true);
        router.post('/cms/enrollments/approve', { enrollment_ids: ids }, {
            preserveState: true,
            onSuccess: () => setSelected([]),
            onFinish: () => setBusy(false),
        });
    };

    const handleReject = () => {
        if (!rejectItem || busy) return;
        setBusy(true);
        router.post(`/cms/enrollments/${rejectItem.id}/reject`, {}, {
            onSuccess: () => setRejectItem(null),
            onFinish: () => setBusy(false),
        });
    };

    const handleDelete = () => {
        if (!deleteItem || busy) return;
        setBusy(true);
        router.delete(`/cms/enrollments/${deleteItem.id}`, {
            onSuccess: () => setDeleteItem(null),
            onFinish: () => setBusy(false),
        });
    };

    const statusBadge = (status: string) => {
        const label = enrollmentStatusLabel(c, status);
        switch (status) {
            case 'pending':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">{label}</span>;
            case 'active':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{label}</span>;
            case 'completed':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">{label}</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">{label}</span>;
        }
    };

    const sourceBadge = (source: string) => {
        return source === 'self' ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">{c.enrollments.sourceSelf}</span>
        ) : (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{c.enrollments.sourceAdmin}</span>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.nav.enrollments} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{c.enrollments.title}</h1>
                        <p className="text-sm text-slate-500">{c.enrollments.subtitle}</p>
                    </div>
                    {canManage && (
                        <Button asChild className="gap-2">
                            <Link href="/cms/enrollments/create">
                                <Plus className="w-4 h-4" /> {c.enrollments.add}
                            </Link>
                        </Button>
                    )}
                </div>

                <div className="flex gap-3 flex-wrap items-center">
                    <span className="text-sm font-medium text-slate-500">{c.enrollments.filters}:</span>
                    <select
                        className="rounded-lg border bg-background px-3 py-2 text-sm"
                        value={filters.subject_id ?? ''}
                        onChange={(e) => applyFilter('subject_id', e.target.value)}
                    >
                        <option value="">{c.common.allSubjects}</option>
                        {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>{subject.code} — {subject.name}</option>
                        ))}
                    </select>
                    <select
                        className="rounded-lg border bg-background px-3 py-2 text-sm"
                        value={filters.status ?? ''}
                        onChange={(e) => applyFilter('status', e.target.value)}
                    >
                        <option value="">{c.enrollments.allStatuses}</option>
                        {['pending', 'active', 'completed', 'dropped', 'withdrawn'].map((status) => (
                            <option key={status} value={status}>{enrollmentStatusLabel(c, status)}</option>
                        ))}
                    </select>
                    <select
                        className="rounded-lg border bg-background px-3 py-2 text-sm"
                        value={filters.source ?? ''}
                        onChange={(e) => applyFilter('source', e.target.value)}
                    >
                        <option value="">{c.enrollments.allSources}</option>
                        <option value="self">{c.enrollments.sourceSelf}</option>
                        <option value="admin">{c.enrollments.sourceAdmin}</option>
                    </select>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        {c.enrollments.clearFilters}
                    </Button>
                </div>

                {canManage && pendingIds.length > 0 && (
                    <div className="flex items-center justify-between flex-wrap gap-3 rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 px-4 py-3">
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <Checkbox checked={allPendingSelected} onCheckedChange={toggleSelectAllPending} />
                            {c.enrollments.pendingBadge} ({pendingIds.length})
                        </label>
                        <Button size="sm" className="gap-2" disabled={selected.length === 0 || busy} onClick={() => approve(selected)}>
                            <Check className="w-4 h-4" />
                            {c.enrollments.approveSelected}
                            {selected.length > 0 && ` (${selected.length})`}
                        </Button>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b">
                            <tr>
                                {canManage && (
                                    <th className="p-4 w-10">
                                        <Checkbox
                                            checked={allPendingSelected}
                                            disabled={pendingIds.length === 0}
                                            onCheckedChange={toggleSelectAllPending}
                                        />
                                    </th>
                                )}
                                <th className="p-4 font-semibold">{c.common.student}</th>
                                <th className="p-4 font-semibold">{c.enrollments.studentNo}</th>
                                <th className="p-4 font-semibold">{c.enrollments.subject}</th>
                                <th className="p-4 font-semibold">{c.enrollments.academicYear}</th>
                                <th className="p-4 font-semibold">{c.enrollments.semester}</th>
                                <th className="p-4 font-semibold">{c.common.status}</th>
                                <th className="p-4 font-semibold">{c.enrollments.source}</th>
                                <th className="p-4 font-semibold text-left">{c.common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {enrollments.data.length === 0 ? (
                                <tr>
                                    <td colSpan={canManage ? 9 : 8} className="p-6 text-center text-slate-500">{c.enrollments.empty}</td>
                                </tr>
                            ) : (
                                enrollments.data.map((enr) => (
                                    <tr key={enr.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                                        {canManage && (
                                            <td className="p-4">
                                                {enr.status === 'pending' && (
                                                    <Checkbox
                                                        checked={selected.includes(enr.id)}
                                                        onCheckedChange={() => toggleSelected(enr.id)}
                                                    />
                                                )}
                                            </td>
                                        )}
                                        <td className="p-4 font-semibold">{enr.student?.name}</td>
                                        <td className="p-4 font-mono text-xs">{enr.student?.student_no}</td>
                                        <td className="p-4 font-medium text-indigo-600 dark:text-indigo-400">
                                            {enr.subject?.name} ({enr.subject?.code})
                                        </td>
                                        <td className="p-4">{enr.academic_year}</td>
                                        <td className="p-4">{semesterLabel(c, enr.semester)}</td>
                                        <td className="p-4">{statusBadge(enr.status)}</td>
                                        <td className="p-4">{sourceBadge(enr.source)}</td>
                                        <td className="p-4 text-left">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/cms/enrollments/${enr.id}`}>
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                {canManage && (
                                                    <>
                                                        {enr.status === 'pending' && (
                                                            <>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    disabled={busy}
                                                                    onClick={() => approve([enr.id])}
                                                                    title={c.enrollments.approve}
                                                                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                                                                >
                                                                    <Check className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    disabled={busy}
                                                                    onClick={() => setRejectItem(enr)}
                                                                    title={c.enrollments.reject}
                                                                    className="text-rose-500 hover:text-rose-600"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/cms/enrollments/${enr.id}/edit`}>
                                                                <Edit className="w-4 h-4" />
                                                            </Link>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => setDeleteItem(enr)} className="text-rose-500 hover:text-rose-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <ConfirmationDialog
                    isOpen={!!deleteItem}
                    onClose={() => setDeleteItem(null)}
                    onConfirm={handleDelete}
                    title={c.enrollments.deleteTitle}
                    description={c.enrollments.deleteDescription}
                />

                <ConfirmationDialog
                    isOpen={!!rejectItem}
                    onClose={() => setRejectItem(null)}
                    onConfirm={handleReject}
                    title={c.enrollments.rejectTitle}
                    description={c.enrollments.rejectDescription}
                />
            </div>
        </AppLayout>
    );
}
