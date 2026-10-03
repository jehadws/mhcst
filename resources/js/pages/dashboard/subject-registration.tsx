import { useSite } from '@/context/site-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import ConfirmationDialog from '@/components/confirmation-dialog';
import AppLayout from '@/layouts/app-layout';
import { enrollmentStatusLabel, semesterLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem, SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, BookOpen, CalendarCheck, CalendarX2, Clock3, Info } from 'lucide-react';
import { useMemo, useState } from 'react';

interface RegistrationSubject {
    id: number;
    code: string;
    name: string;
    credits: number;
    has_lab: boolean;
    seats_remaining: number | null;
}

interface RegistrationEntry {
    id: number;
    status: string;
    source: string;
    subject: RegistrationSubject | null;
}

interface RegistrationWindow {
    open: boolean;
    reason: string | null;
    starts_at: string | null;
    ends_at: string | null;
    add_drop_deadline: string | null;
    self_drop_open: boolean;
    student_active: boolean;
}

interface SubjectRegistrationProps {
    subjects: RegistrationSubject[];
    registrations: RegistrationEntry[];
    term: { academic_year: string | null; semester: string | null };
    registration_window: RegistrationWindow;
}

export default function SubjectRegistration({ subjects, registrations, term, registration_window: registrationWindow }: SubjectRegistrationProps) {
    const { t } = useSite();
    const c = t.cms;
    const reg = c.registration;
    const { flash } = usePage<SharedData>().props;
    const errors = usePage<SharedData>().props.errors as Record<string, string | string[]>;

    const [selected, setSelected] = useState<number[]>([]);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [problems, setProblems] = useState<string[]>([]);
    const [checking, setChecking] = useState(false);
    const [busy, setBusy] = useState(false);
    const [dropTarget, setDropTarget] = useState<RegistrationEntry | null>(null);
    const [dropping, setDropping] = useState(false);

    const termConfigured = term.academic_year !== null && term.semester !== null;
    const canSubmit = registrationWindow.open && registrationWindow.student_active && termConfigured;

    const selectedSubjects = useMemo(
        () => subjects.filter((subject) => selected.includes(subject.id)),
        [subjects, selected],
    );
    const selectedCredits = selectedSubjects.reduce((total, subject) => total + subject.credits, 0);

    const toggle = (id: number) => {
        if (!canSubmit) {
            return;
        }
        const subject = subjects.find((s) => s.id === id);
        if (subject?.seats_remaining === 0) {
            return;
        }
        setSelected((current) => (current.includes(id) ? current.filter((s) => s !== id) : [...current, id]));
    };

    // Before submit, the server dry-runs the exact registration rules and
    // reports every subject that would be rejected — seat counts on this page
    // can be stale by the time the student confirms.
    const openConfirmation = () => {
        if (selected.length === 0 || busy || checking) {
            return;
        }
        setChecking(true);
        setProblems([]);

        fetch(route('dashboard.subject-registration.preview', { subject_ids: selected }), {
            headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((response) => (response.ok ? response.json() : Promise.reject(new Error('preview failed'))))
            .then((data: { problems: string[] }) => setProblems(data.problems ?? []))
            .catch(() => setProblems([]))
            .finally(() => {
                setChecking(false);
                setConfirmOpen(true);
            });
    };

    const submitRegistration = () => {
        if (selected.length === 0 || problems.length > 0 || busy) {
            return;
        }
        setBusy(true);
        router.post(
            route('dashboard.subject-registration.store'),
            { subject_ids: selected },
            {
                onSuccess: () => {
                    setSelected([]);
                    setConfirmOpen(false);
                },
                onError: () => setConfirmOpen(false),
                onFinish: () => setBusy(false),
            },
        );
    };

    const dropRegistration = () => {
        if (!dropTarget || dropping) {
            return;
        }
        setDropping(true);
        router.post(
            route('dashboard.subject-registration.drop', { enrollment: dropTarget.id }),
            {},
            {
                onSuccess: () => setDropTarget(null),
                onError: () => setDropTarget(null),
                onFinish: () => setDropping(false),
            },
        );
    };

    const blockedMessage = !registrationWindow.student_active
        ? reg.blockedInactive
        : !termConfigured
            ? reg.blockedNoTerm
            : registrationWindow.reason === 'closed_switch'
                ? reg.blockedClosed
                : registrationWindow.reason === 'not_started' && registrationWindow.starts_at
                    ? reg.windowNotStarted.replace('{date}', registrationWindow.starts_at)
                    : registrationWindow.reason === 'ended' && registrationWindow.ends_at
                        ? reg.windowEnded.replace('{date}', registrationWindow.ends_at)
                        : !registrationWindow.open
                            ? reg.blockedClosed
                            : null;

    const statusBadge = (status: string) => {
        const label = enrollmentStatusLabel(c, status);
        switch (status) {
            case 'pending':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning/10 text-warning">{label}</span>;
            case 'active':
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success/10 text-success">{label}</span>;
            default:
                return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted text-muted-foreground">{label}</span>;
        }
    };

    const canDrop = (entry: RegistrationEntry) =>
        (entry.status === 'pending' || entry.status === 'active') && registrationWindow.self_drop_open;

    const flashErrors = Object.values(errors ?? {}).flat();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: t.dashboard.sidebar.items.dashboard, href: '/dashboard' },
        { title: reg.title, href: '/dashboard/subject-registration' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={reg.title} />
            <div className="space-y-6 px-6 py-6">
                <div className="flex flex-col gap-2">
                    <h1 className="font-display text-3xl font-extrabold leading-snug tracking-tight">{reg.title}</h1>
                    <p className="text-sm text-muted-foreground">{reg.subtitle}</p>
                </div>

                {flash?.success && (
                    <div className="rounded-xl border border-success/20 bg-success/10 px-4 py-2.5 text-sm text-success">
                        {flash.success}
                    </div>
                )}

                {flashErrors.length > 0 && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                        {flashErrors.map((message, index) => (
                            <p key={index}>{message}</p>
                        ))}
                    </div>
                )}

                {blockedMessage && (
                    <div className="flex items-start gap-3 rounded-xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning">
                        <Info className="w-4 h-4 mt-1 shrink-0" />
                        <p>{blockedMessage}</p>
                    </div>
                )}

                {!blockedMessage && registrationWindow.add_drop_deadline && (
                    <div className="flex items-center gap-2 rounded-xl border border-info/20 bg-info/10 p-3 text-sm text-info">
                        <Clock3 className="w-4 h-4 shrink-0" />
                        <p>{reg.deadlineLabel.replace('{date}', registrationWindow.add_drop_deadline)}</p>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-5">
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                {reg.availableSubjects}
                            </CardTitle>
                            {termConfigured && (
                                <CardDescription>
                                    {term.academic_year} • {semesterLabel(c, term.semester ?? '')}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {subjects.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-10 text-center">{reg.empty}</p>
                            ) : (
                                <div className="space-y-2">
                                    {subjects.map((subject) => {
                                        const checked = selected.includes(subject.id);
                                        const isFull = subject.seats_remaining === 0;
                                        const selectable = canSubmit && !isFull;

                                        return (
                                            <label
                                                key={subject.id}
                                                className={`flex items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${
                                                    checked ? 'border-primary bg-primary/5' : 'bg-background hover:bg-muted/50'
                                                } ${selectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    disabled={!selectable}
                                                    onCheckedChange={() => toggle(subject.id)}
                                                />
                                                <span className="flex-1 min-w-0">
                                                    <span className="font-medium">{subject.name}</span>
                                                    <span className="text-muted-foreground ms-2">({subject.code})</span>
                                                </span>
                                                {subject.has_lab && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-info/10 text-info">
                                                        {reg.lab}
                                                    </span>
                                                )}
                                                {isFull ? (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive whitespace-nowrap">
                                                        {reg.seatsFull}
                                                    </span>
                                                ) : subject.seats_remaining !== null ? (
                                                    <span className="text-muted-foreground whitespace-nowrap text-xs">
                                                        {reg.seatsRemaining.replace('{count}', String(subject.seats_remaining))}
                                                    </span>
                                                ) : null}
                                                <span className="text-muted-foreground whitespace-nowrap">
                                                    {subject.credits} {reg.credits}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {subjects.length > 0 && (
                                <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                                    <p className="text-sm text-muted-foreground">
                                        {reg.selectedCount.replace('{count}', String(selected.length))}
                                        {selected.length > 0 && ` • ${reg.selectedCredits.replace('{credits}', String(selectedCredits))}`}
                                    </p>
                                    <Button disabled={!canSubmit || selected.length === 0} onClick={openConfirmation}>
                                        <CalendarCheck className="w-4 h-4 me-2" />
                                        {reg.submit}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock3 className="w-4 h-4" />
                                {reg.currentRegistrations}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {registrations.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-10 text-center">{c.common.noRecords}</p>
                            ) : (
                                registrations.map((entry) => (
                                    <div key={entry.id} className="rounded-xl border p-3 text-sm">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">
                                                    {entry.subject ? `${entry.subject.name} (${entry.subject.code})` : c.common.notSpecified}
                                                </p>
                                                {entry.subject && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {entry.subject.credits} {reg.credits}
                                                    </p>
                                                )}
                                            </div>
                                            {statusBadge(entry.status)}
                                        </div>
                                        {canDrop(entry) && (
                                            <div className="mt-2 border-t pt-2 text-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5 text-destructive hover:text-destructive"
                                                    disabled={dropping}
                                                    onClick={() => setDropTarget(entry)}
                                                >
                                                    <CalendarX2 className="w-3.5 h-3.5" />
                                                    {reg.dropAction}
                                                </Button>
                                            </div>
                                        )}
                                        {!registrationWindow.self_drop_open && (entry.status === 'pending' || entry.status === 'active') && registrationWindow.add_drop_deadline && (
                                            <p className="mt-2 border-t pt-2 text-xs text-warning">
                                                {reg.dropBlocked.replace('{date}', registrationWindow.add_drop_deadline)}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <ConfirmationDialog
                    isOpen={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    onConfirm={submitRegistration}
                    title={reg.confirmTitle}
                    description={reg.confirmDescription
                        .replace('{count}', String(selected.length))
                        .replace('{credits}', String(selectedCredits))}
                    confirmText={reg.submit}
                    loading={busy || checking}
                    variant={problems.length > 0 ? 'destructive' : 'default'}
                >
                    {checking ? (
                        <p className="rounded-xl border bg-muted/40 p-3 text-sm text-muted-foreground">{reg.confirmChecking}</p>
                    ) : problems.length > 0 ? (
                        <div className="space-y-2">
                            <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <p>{reg.confirmProblemsTitle}</p>
                            </div>
                            <ul className="list-inside list-disc space-y-1 px-1 text-sm text-destructive">
                                {problems.map((problem, index) => (
                                    <li key={index}>{problem}</li>
                                ))}
                            </ul>
                            <p className="text-xs text-muted-foreground">{reg.confirmProblemsHint}</p>
                        </div>
                    ) : null}
                </ConfirmationDialog>

                <ConfirmationDialog
                    isOpen={!!dropTarget}
                    onClose={() => setDropTarget(null)}
                    onConfirm={dropRegistration}
                    title={reg.dropConfirmTitle}
                    description={reg.dropConfirmDescription.replace(
                        '{subject}',
                        dropTarget?.subject ? `${dropTarget.subject.name} (${dropTarget.subject.code})` : '',
                    )}
                    confirmText={reg.dropAction}
                    cancelText={c.common.cancel}
                    variant="warning"
                    loading={dropping}
                />
            </div>
        </AppLayout>
    );
}
