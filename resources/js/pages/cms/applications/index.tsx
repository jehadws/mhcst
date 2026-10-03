import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem, PaginatedData } from '@/types';
import type { WaFollowup } from '@/types/cms';
import ReasonRejectDialog from '@/components/cms/reason-reject-dialog';
import CmsPagination from '@/components/cms/cms-pagination';
import WaFollowupsPanel from '@/components/cms/wa-followups';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2, Check, Clock, Copy, FileText, MessageCircle, Search, XCircle } from 'lucide-react';
import { FormEventHandler, useMemo, useState } from 'react';

interface ApplicationRow {
    id: number;
    status: string;
    rejected_reason?: string | null;
    submitted_at?: string | null;
    applicant: { name?: string | null; email?: string | null; phone?: string | null };
    department?: string | null;
    level?: { year: number; section: string } | null;
    student_no?: string | null;
    wa_link: string | null;
    wa_message: string;
}

export default function ApplicationsIndex({
    applications,
    counts,
    filters,
}: {
    applications: PaginatedData<ApplicationRow>;
    counts: Record<string, number>;
    filters: { search?: string; status?: string };
}) {
    const { c, locale } = useCms();
    const ar = locale === 'ar';
    const { props } = usePage<{ flash?: { success?: string; wa_followups?: WaFollowup[] | null } }>();
    const t = c.applications;

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: t.title, href: '/cms/applications' },
    ]);

    const [rejectIds, setRejectIds] = useState<number[]>([]);
    const [acceptItem, setAcceptItem] = useState<ApplicationRow | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [selected, setSelected] = useState<number[]>([]);
    const [bulkBusy, setBulkBusy] = useState(false);

    const acceptForm = useForm<{ generate_password: boolean }>({ generate_password: false });

    const actionable = (status: string) => status === 'submitted' || status === 'under_review';

    const actionableIds = useMemo(
        () => applications.data.filter((application) => actionable(application.status)).map((application) => application.id),
        [applications.data],
    );
    const allActionableSelected = actionableIds.length > 0 && actionableIds.every((id) => selected.includes(id));

    const toggleSelected = (id: number) => {
        setSelected((current) => (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]));
    };

    const toggleSelectAllActionable = () => {
        setSelected(allActionableSelected ? [] : actionableIds);
    };

    const statusFilter = (status?: string) => {
        router.get('/cms/applications', { status, search: filters.search }, { preserveState: true });
    };

    const search: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        router.get('/cms/applications', { status: filters.status, search: (e.target as HTMLFormElement).search.value });
    };

    const statusLabel = (status: string) =>
        ({ submitted: t.statusSubmitted, under_review: t.statusUnderReview, accepted: t.statusAccepted, rejected: t.statusRejected })[status] ?? status;

    const statusBadge = (status: string) => {
        switch (status) {
            case 'accepted':
                return <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">{statusLabel(status)}</span>;
            case 'under_review':
                return <span className="rounded-full bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">{statusLabel(status)}</span>;
            case 'rejected':
                return <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive">{statusLabel(status)}</span>;
            default:
                return <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{statusLabel(status)}</span>;
        }
    };

    const confirmAccept = () => {
        if (!acceptItem) return;
        acceptForm.post(`/cms/applications/${acceptItem.id}/accept`, {
            preserveScroll: true,
            onSuccess: () => {
                setAcceptItem(null);
                acceptForm.reset();
            },
        });
    };

    const submitReject = (reason: string) => {
        if (rejectIds.length === 0) return;
        const bulk = rejectIds.length > 1;
        router.post(
            bulk ? '/cms/applications/bulk-reject' : `/cms/applications/${rejectIds[0]}/reject`,
            bulk ? { application_ids: rejectIds, rejected_reason: reason } : { rejected_reason: reason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectIds([]);
                    setSelected([]);
                },
            },
        );
    };

    const bulkAccept = () => {
        if (selected.length === 0 || bulkBusy) return;
        setBulkBusy(true);
        router.post('/cms/applications/bulk-accept', { application_ids: selected }, {
            preserveScroll: true,
            onSuccess: () => setSelected([]),
            onFinish: () => setBulkBusy(false),
        });
    };

    const copyMessage = async (application: ApplicationRow) => {
        try {
            await navigator.clipboard.writeText(application.wa_message);
            setCopiedId(application.id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            // Clipboard unavailable (insecure context) — the WhatsApp button is the fallback.
        }
    };

    const tabs = [
        { label: t.all, status: undefined, count: Object.values(counts).reduce((sum, n) => sum + n, 0) },
        { label: t.statusSubmitted, status: 'submitted', count: counts.submitted ?? 0 },
        { label: t.statusUnderReview, status: 'under_review', count: counts.under_review ?? 0 },
        { label: t.statusAccepted, status: 'accepted', count: counts.accepted ?? 0 },
        { label: t.statusRejected, status: 'rejected', count: counts.rejected ?? 0 },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={t.title} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col gap-2">
                    <h1 className="font-display text-3xl font-extrabold leading-snug">{t.title}</h1>
                    <p className="text-sm text-muted-foreground">{t.subtitle}</p>
                </div>

                {props.flash?.success && (
                    <div className="rounded-xl border border-success/20 bg-success/10 text-success text-sm px-4 py-2.5">
                        {props.flash.success}
                    </div>
                )}

                {props.flash?.wa_followups && props.flash.wa_followups.length > 0 && (
                    <WaFollowupsPanel
                        followups={props.flash.wa_followups}
                        title={t.followupsTitle}
                        hint={t.followupsHint}
                        copyLabel={t.copy}
                        copiedLabel={t.copied}
                        dismissLabel={t.dismiss}
                    />
                )}

                {actionableIds.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/20 bg-warning/10 px-4 py-3">
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
                            <Checkbox checked={allActionableSelected} onCheckedChange={toggleSelectAllActionable} />
                            {t.selectAllActionable} ({actionableIds.length})
                        </label>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                className="gap-2"
                                disabled={selected.length === 0 || bulkBusy}
                                onClick={bulkAccept}
                            >
                                <CheckCircle2 className="size-4" />
                                {t.bulkAccept}
                                {selected.length > 0 && ` (${selected.length})`}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/10"
                                disabled={selected.length === 0 || bulkBusy}
                                onClick={() => setRejectIds(selected.filter((id) => actionableIds.includes(id)))}
                            >
                                <XCircle className="size-4" />
                                {t.bulkReject}
                                {selected.length > 0 && ` (${selected.filter((id) => actionableIds.includes(id)).length})`}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Status filter tabs */}
                <div className="flex flex-wrap items-center gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.label}
                            type="button"
                            onClick={() => statusFilter(tab.status)}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                                (filters.status ?? undefined) === tab.status
                                    ? 'bg-primary text-primary-foreground shadow-md'
                                    : 'bg-card text-muted-foreground border hover:border-primary/40'
                            }`}
                        >
                            {tab.label}
                            <span className="tabular-nums rounded-full bg-black/10 px-1.5 text-xs dark:bg-white/10">{tab.count}</span>
                        </button>
                    ))}

                    <form onSubmit={search} className="ms-auto relative w-full sm:w-72">
                        <Search className="text-muted-foreground absolute start-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input name="search" defaultValue={filters.search} placeholder={t.search} className="ps-9" />
                    </form>
                </div>

                <div className="bg-card border overflow-hidden rounded-xl shadow-sm">
                    <table className="w-full text-sm text-start">
                        <thead className="bg-muted text-muted-foreground border-b">
                            <tr>
                                <th className="w-10 p-4">
                                    <Checkbox
                                        checked={allActionableSelected}
                                        disabled={actionableIds.length === 0}
                                        onCheckedChange={toggleSelectAllActionable}
                                    />
                                </th>
                                <th className="p-4 text-start font-semibold">{t.applicant}</th>
                                <th className="p-4 text-start font-semibold">{t.contact}</th>
                                <th className="p-4 text-start font-semibold">{t.department}</th>
                                <th className="p-4 text-start font-semibold">{t.submitted}</th>
                                <th className="p-4 text-start font-semibold">{c.common.status}</th>
                                <th className="p-4 text-start font-semibold">{c.common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-border divide-y">
                            {applications.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">
                                        {filters.status || filters.search ? t.emptyFiltered : t.empty}
                                    </td>
                                </tr>
                            ) : (
                                applications.data.map((application) => (
                                    <tr key={application.id} className="hover:bg-muted/50">
                                        <td className="p-4">
                                            {actionable(application.status) && (
                                                <Checkbox
                                                    checked={selected.includes(application.id)}
                                                    onCheckedChange={() => toggleSelected(application.id)}
                                                />
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold">{application.applicant.name ?? '—'}</div>
                                            <div className="text-xs font-normal text-muted-foreground" dir="ltr">
                                                {application.applicant.email}
                                            </div>
                                            {application.student_no && (
                                                <div className="text-primary mt-1 inline-block rounded bg-primary/5 px-1.5 py-0.5 text-xs font-bold tabular-nums">
                                                    {t.studentNo}: {application.student_no}
                                                </div>
                                            )}
                                            {application.status === 'rejected' && application.rejected_reason && (
                                                <div className="text-destructive mt-1 text-xs">{t.rejectedReasonLabel.replace('{reason}', application.rejected_reason)}</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="tabular-nums" dir="ltr">
                                                {application.applicant.phone ?? '—'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>{application.department ?? '—'}</div>
                                            {application.level && (
                                                <div className="text-xs text-muted-foreground">
                                                    {t.yearSection.replace('{year}', String(application.level.year)).replace('{section}', application.level.section)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {application.submitted_at
                                                ? new Date(application.submitted_at).toLocaleDateString(ar ? 'ar-LY' : 'en-GB')
                                                : '—'}
                                        </td>
                                        <td className="p-4">{statusBadge(application.status)}</td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                {application.status === 'submitted' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="gap-1.5"
                                                        onClick={() => router.post(`/cms/applications/${application.id}/review`, {}, { preserveScroll: true })}
                                                    >
                                                        <Clock className="size-3.5" />
                                                        {t.review}
                                                    </Button>
                                                )}
                                                {actionable(application.status) && (
                                                    <>
                                                        <Button variant="outline" size="sm" className="gap-1.5 border-success/40 text-success hover:bg-success/10" onClick={() => setAcceptItem(application)}>
                                                            <CheckCircle2 className="size-3.5" />
                                                            {t.accept}
                                                        </Button>
                                                        <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 gap-1.5 border-destructive/40" onClick={() => setRejectIds([application.id])}>
                                                            <XCircle className="size-3.5" />
                                                            {t.reject}
                                                        </Button>
                                                    </>
                                                )}
                                                {application.wa_link && (
                                                    <>
                                                        <Button variant="ghost" size="sm" asChild className="gap-1.5">
                                                            <a href={application.wa_link} target="_blank" rel="noopener noreferrer" title={t.whatsapp}>
                                                                <MessageCircle className="size-3.5 text-success" />
                                                            </a>
                                                        </Button>
                                                        <Button variant="ghost" size="sm" onClick={() => copyMessage(application)} title={t.copy} className="gap-1.5">
                                                            {copiedId === application.id ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
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

                {applications.last_page > 1 && <CmsPagination paginator={applications} />}

                {/* Accept dialog */}
                <Dialog open={!!acceptItem} onOpenChange={(open) => !open && setAcceptItem(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="font-display">{t.acceptTitle}</DialogTitle>
                            <DialogDescription>{t.acceptDescription}</DialogDescription>
                        </DialogHeader>
                        <label className="text-foreground flex items-start gap-3 text-sm">
                            <input
                                type="checkbox"
                                className="accent-primary mt-0.5"
                                checked={acceptForm.data.generate_password}
                                onChange={(e) => acceptForm.setData('generate_password', e.target.checked)}
                            />
                            {t.generatePassword}
                        </label>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAcceptItem(null)}>
                                {c.common.cancel}
                            </Button>
                            <Button onClick={confirmAccept} disabled={acceptForm.processing} className="gap-2">
                                {acceptForm.processing ? <Clock className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                                {t.confirmAccept}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Reject dialog (single + bulk) with Arabic reason presets */}
                <ReasonRejectDialog
                    isOpen={rejectIds.length > 0}
                    onClose={() => setRejectIds([])}
                    onSubmit={submitReject}
                    title={rejectIds.length > 1 ? t.bulkRejectTitle : t.rejectTitle}
                    description={rejectIds.length > 1 ? t.bulkRejectDescription : t.rejectDescription}
                    reasonLabel={t.rejectReason}
                    reasonPlaceholder={t.rejectReasonPlaceholder}
                    presets={t.rejectReasons}
                    confirmText={t.confirmReject}
                    cancelText={c.common.cancel}
                />

                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <FileText className="size-3.5" />
                    {ar
                        ? 'كل تغيير حالة يُسجَّل في سجل التدقيق ويُشعر مقدم الطلب به تلقائياً (بريد + رسالة واتساب جاهزة).'
                        : 'Every status change is written to the audit log and the applicant is notified automatically (email + ready-made WhatsApp message).'}
                </div>
            </div>
        </AppLayout>
    );
}
