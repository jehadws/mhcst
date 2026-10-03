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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { AdmissionScopeMatrix, AdmissionScopeDepartment } from '@/components/cms/admission-scope-matrix';
import { DateField, isoToDisplayDate } from '@/components/date-field';
import { cn } from '@/lib/utils';
import { AlertTriangle, DoorClosed, DoorOpen, Lock, ScrollText, Unlock } from 'lucide-react';
import { ReactNode, useEffect, useMemo, useState } from 'react';

type SettingsProps = {
    grade_entry_deadline: string | null;
    grades_locked: boolean;
    is_locked: boolean;
    academic_year: string | null;
    semester_start: string | null;
    semester_end: string | null;
    consecutive_absence_threshold: number;
    absence_rate_threshold: number;
    current_semester: string | null;
    subject_registration_open: boolean;
    registration_starts_at: string | null;
    registration_ends_at: string | null;
    add_drop_deadline: string | null;
    admission_open: boolean;
    admission_opens_at: string | null;
    admission_closes_at: string | null;
    admission_department_ids: number[];
    admission_level_ids: number[];
    admission_is_open: boolean;
};

const TAB_OF_FIELD: Record<string, string> = {
    academic_year: 'calendar',
    semester_start: 'calendar',
    semester_end: 'calendar',
    current_semester: 'registration',
    registration_starts_at: 'registration',
    registration_ends_at: 'registration',
    add_drop_deadline: 'registration',
    admission_opens_at: 'admission',
    admission_closes_at: 'admission',
    admission_level_ids: 'admission',
    grade_entry_deadline: 'grades',
    consecutive_absence_threshold: 'attendance',
    absence_rate_threshold: 'attendance',
};

const localDateIso = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// Hint text sits at a higher contrast than muted-foreground: settings hints
// carry safety-critical context (windows, locks), not decoration.
function SettingsHint({ children }: { children: ReactNode }) {
    return <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/70">{children}</p>;
}

function SettingsField({
    id,
    label,
    hint,
    error,
    children,
}: {
    id: string;
    label: string;
    hint?: string;
    error?: string | null;
    children: ReactNode;
}) {
    return (
        <div>
            <Label htmlFor={id} className="text-sm font-semibold">
                {label}
            </Label>
            <div className="mt-1.5">{children}</div>
            {error ? <p className="mt-1.5 text-xs font-medium text-destructive">{error}</p> : hint ? <SettingsHint>{hint}</SettingsHint> : null}
        </div>
    );
}

// Checkbox, label, and helper text stay visually grouped on wide RTL rows.
function SettingsToggleRow({
    id,
    label,
    hint,
    checked,
    onCheckedChange,
}: {
    id: string;
    label: string;
    hint?: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-start gap-3 rounded-xl border p-4">
            <Checkbox id={id} checked={checked} onCheckedChange={(value) => onCheckedChange(!!value)} className="mt-0.5" />
            <div className="space-y-1">
                <Label htmlFor={id} className="cursor-pointer text-sm font-semibold">
                    {label}
                </Label>
                {hint && <SettingsHint>{hint}</SettingsHint>}
            </div>
        </div>
    );
}

export default function CmsSettingsIndex({
    settings,
    departments = [],
    academicYearOptions = [],
}: {
    settings: SettingsProps;
    departments?: AdmissionScopeDepartment[];
    academicYearOptions?: string[];
}) {
    const { c } = useCms();
    const s = c.settings;

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.academicSettings, href: '/cms/settings' },
    ]);

    const { data, setData, put, processing, isDirty, reset, errors: serverErrors } = useForm({
        grade_entry_deadline: settings.grade_entry_deadline ?? '',
        grades_locked: settings.grades_locked,
        academic_year: settings.academic_year ?? '',
        semester_start: settings.semester_start ?? '',
        semester_end: settings.semester_end ?? '',
        consecutive_absence_threshold: settings.consecutive_absence_threshold,
        absence_rate_threshold: settings.absence_rate_threshold,
        current_semester: settings.current_semester ?? '',
        subject_registration_open: settings.subject_registration_open,
        registration_starts_at: settings.registration_starts_at ?? '',
        registration_ends_at: settings.registration_ends_at ?? '',
        add_drop_deadline: settings.add_drop_deadline ?? '',
        admission_open: settings.admission_open,
        admission_opens_at: settings.admission_opens_at ?? '',
        admission_closes_at: settings.admission_closes_at ?? '',
        admission_level_ids: settings.admission_level_ids ?? [],
        admission_department_ids: [] as number[],
    });

    const [activeTab, setActiveTab] = useState('calendar');
    const [pendingFocus, setPendingFocus] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [invalidDates, setInvalidDates] = useState<Record<string, boolean>>({});
    const [confirmOpen, setConfirmOpen] = useState(false);

    const todayIso = localDateIso(new Date());

    const termIncomplete =
        data.subject_registration_open && (!data.academic_year.trim() || !data.current_semester);
    const gradesLiveLocked =
        data.grades_locked || (data.grade_entry_deadline !== '' && data.grade_entry_deadline < todayIso);
    const admissionLiveOpen =
        data.admission_open &&
        (!data.admission_opens_at || data.admission_opens_at <= todayIso) &&
        (!data.admission_closes_at || data.admission_closes_at >= todayIso);

    const yearOptions = useMemo(() => {
        const options = new Set(academicYearOptions);
        if (data.academic_year) {
            options.add(data.academic_year);
        }
        return Array.from(options).sort();
    }, [academicYearOptions, data.academic_year]);

    // Field errors clear as soon as the field changes again.
    const update = <K extends keyof typeof data>(key: K, value: (typeof data)[K]) => {
        setData(key, value);
        setFieldErrors((previous) => {
            if (!(key in previous)) {
                return previous;
            }
            const next = { ...previous };
            delete next[key];
            return next;
        });
    };

    const markDateValidity = (key: string) => (valid: boolean) => {
        setInvalidDates((previous) => (previous[key] === !valid ? previous : { ...previous, [key]: !valid }));
    };

    const errorOf = (key: string): string | null => {
        if (fieldErrors[key]) {
            return fieldErrors[key];
        }
        const serverEntry = Object.entries(serverErrors).find(([candidate]) => candidate.split('.')[0] === key);
        if (serverEntry) {
            return serverEntry[1];
        }
        // Required term fields stay visibly wrong while the window is open.
        if (data.subject_registration_open && (key === 'academic_year' || key === 'current_semester')) {
            const value = key === 'academic_year' ? data.academic_year : data.current_semester;

            if (!value) {
                return s.requiredForRegistration;
            }
        }
        return null;
    };

    const validate = (): Record<string, string> => {
        const errors: Record<string, string> = {};

        if (data.semester_start && data.semester_end && data.semester_end < data.semester_start) {
            errors.semester_end = s.errSemesterEndBeforeStart;
        }
        if (data.registration_starts_at && data.registration_ends_at && data.registration_ends_at < data.registration_starts_at) {
            errors.registration_ends_at = s.errRegistrationEndBeforeStart;
        }
        if (data.registration_starts_at && data.add_drop_deadline && data.add_drop_deadline < data.registration_starts_at) {
            errors.add_drop_deadline = s.errAddDropAfterStart;
        }
        if (data.semester_end && data.add_drop_deadline && data.add_drop_deadline > data.semester_end) {
            errors.add_drop_deadline = s.errAddDropAfterSemesterEnd;
        }
        if (data.admission_opens_at && data.admission_closes_at && data.admission_closes_at < data.admission_opens_at) {
            errors.admission_closes_at = s.errAdmissionCloseBeforeOpen;
        }
        if (data.subject_registration_open) {
            if (!data.academic_year.trim()) {
                errors.academic_year = s.requiredForRegistration;
            }
            if (!data.current_semester) {
                errors.current_semester = s.requiredForRegistration;
            }
        }

        for (const [key, invalid] of Object.entries(invalidDates)) {
            if (invalid) {
                errors[key] = s.errDateInvalid;
            }
        }

        return errors;
    };

    const dangerChanges = [
        settings.admission_open && !data.admission_open ? s.changeAdmissionClose : null,
        settings.subject_registration_open && !data.subject_registration_open ? s.changeRegistrationClose : null,
        !settings.grades_locked && data.grades_locked ? s.changeGradesLock : null,
    ].filter((change): change is NonNullable<typeof change> => change !== null);

    const doSave = () => {
        put('/cms/settings');
    };

    const requestSave = () => {
        const errors = validate();

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            const firstTab = TAB_OF_FIELD[Object.keys(errors)[0]];
            if (firstTab) {
                setActiveTab(firstTab);
            }
            return;
        }

        setFieldErrors({});

        if (dangerChanges.length > 0) {
            setConfirmOpen(true);
            return;
        }

        doSave();
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        requestSave();
    };

    const goToField = (fieldId: string) => {
        const tab = TAB_OF_FIELD[fieldId] ?? activeTab;
        setActiveTab(tab);
        setPendingFocus(fieldId);
    };

    useEffect(() => {
        if (!pendingFocus) {
            return;
        }
        const node = document.getElementById(pendingFocus);
        if (node) {
            node.focus();
            setPendingFocus(null);
        }
    }, [pendingFocus, activeTab]);

    // Server-side validation failures land on the tab that owns the field.
    useEffect(() => {
        const firstKey = Object.keys(serverErrors)[0];
        if (!firstKey) {
            return;
        }
        const tab = TAB_OF_FIELD[firstKey.split('.')[0]];
        if (tab) {
            setActiveTab(tab);
        }
    }, [serverErrors]);

    const setSemesterStart = (iso: string) => {
        update('semester_start', iso);

        // Auto-derive the academic year from the start date (Libyan academic
        // years roll over in September) unless the admin already chose one.
        if (iso && !data.academic_year) {
            const start = new Date(`${iso}T00:00:00`);
            const year = start.getMonth() + 1 >= 9 ? start.getFullYear() : start.getFullYear() - 1;
            setData('academic_year', `${year}-${year + 1}`);
        }
    };

    const selectClasses = (hasError: boolean) =>
        cn(
            'w-full rounded-md border bg-background p-2.5 text-sm',
            'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            hasError ? 'border-destructive' : 'border-input',
        );

    const timelineSteps = [
        { label: s.timelineRegistrationOpens, iso: data.registration_starts_at },
        { label: s.timelineRegistrationCloses, iso: data.registration_ends_at },
        { label: s.timelineAddDrop, iso: data.add_drop_deadline },
    ];
    const timelineVisible = timelineSteps.some((step) => step.iso !== '');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={s.title} />
            <div className="flex flex-col gap-6 p-6 pb-28">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-display text-3xl font-extrabold leading-snug">{s.title}</h1>
                        <p className="text-sm text-muted-foreground">{s.subtitle}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={gradesLiveLocked ? 'destructive' : 'secondary'} className="gap-1">
                            {gradesLiveLocked ? <Lock className="size-3" /> : <Unlock className="size-3" />}
                            {gradesLiveLocked ? s.locked : s.unlocked}
                        </Badge>
                        <Badge
                            variant={!data.subject_registration_open ? 'outline' : termIncomplete ? 'destructive' : 'secondary'}
                            className="gap-1"
                        >
                            {termIncomplete && data.subject_registration_open && <AlertTriangle className="size-3" />}
                            {!data.subject_registration_open
                                ? s.statusRegistrationClosed
                                : termIncomplete
                                  ? s.statusRegistrationIncomplete
                                  : s.statusRegistrationOpen}
                        </Badge>
                        <Badge variant={admissionLiveOpen ? 'secondary' : 'outline'} className="gap-1">
                            {admissionLiveOpen ? <DoorOpen className="size-3" /> : <DoorClosed className="size-3" />}
                            {admissionLiveOpen ? s.statusAdmissionOpen : s.statusAdmissionClosed}
                        </Badge>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/cms/audit-logs">
                                <ScrollText className="size-4" />
                                {c.nav.auditLog}
                            </Link>
                        </Button>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <div className="overflow-x-auto">
                            <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto p-1 sm:grid sm:grid-cols-5">
                                <TabsTrigger value="calendar" className="flex-1 whitespace-nowrap">{s.tabCalendar}</TabsTrigger>
                                <TabsTrigger value="registration" className="flex-1 whitespace-nowrap">{s.tabRegistration}</TabsTrigger>
                                <TabsTrigger value="admission" className="flex-1 whitespace-nowrap">{s.tabAdmission}</TabsTrigger>
                                <TabsTrigger value="grades" className="flex-1 whitespace-nowrap">{s.tabGrades}</TabsTrigger>
                                <TabsTrigger value="attendance" className="flex-1 whitespace-nowrap">{s.tabAttendance}</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="calendar" className="mt-4">
                            <section className="space-y-5 rounded-xl border bg-card p-6">
                                <h2 className="font-display text-2xl font-extrabold leading-snug">{s.calendarSection}</h2>
                                <SettingsField id="academic_year" label={s.academicYear} hint={s.academicYearHint} error={errorOf('academic_year')}>
                                    <select
                                        id="academic_year"
                                        className={selectClasses(!!errorOf('academic_year'))}
                                        value={data.academic_year}
                                        onChange={(e) => update('academic_year', e.target.value)}
                                    >
                                        <option value="">{s.notSet}</option>
                                        {yearOptions.map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </SettingsField>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <SettingsField id="semester_start" label={s.semesterStart} error={errorOf('semester_start')}>
                                        <DateField
                                            id="semester_start"
                                            value={data.semester_start}
                                            onChange={setSemesterStart}
                                            onValidityChange={markDateValidity('semester_start')}
                                            invalid={!!errorOf('semester_start')}
                                            formatErrorMessage={s.errDateInvalid}
                                        />
                                    </SettingsField>
                                    <SettingsField id="semester_end" label={s.semesterEnd} error={errorOf('semester_end')}>
                                        <DateField
                                            id="semester_end"
                                            value={data.semester_end}
                                            onChange={(value) => update('semester_end', value)}
                                            onValidityChange={markDateValidity('semester_end')}
                                            invalid={!!errorOf('semester_end')}
                                            formatErrorMessage={s.errDateInvalid}
                                        />
                                    </SettingsField>
                                </div>
                            </section>
                        </TabsContent>

                        <TabsContent value="registration" className="mt-4">
                            <section className="space-y-5 rounded-xl border bg-card p-6">
                                <h2 className="font-display text-2xl font-extrabold leading-snug">{s.registrationSection}</h2>
                                <SettingsField id="current_semester" label={s.currentSemester} hint={s.currentSemesterHint} error={errorOf('current_semester')}>
                                    <select
                                        id="current_semester"
                                        className={selectClasses(!!errorOf('current_semester'))}
                                        value={data.current_semester}
                                        onChange={(e) => update('current_semester', e.target.value)}
                                    >
                                        <option value="">{s.notSet}</option>
                                        <option value="first">{c.labels.semesters.first}</option>
                                        <option value="second">{c.labels.semesters.second}</option>
                                        <option value="summer">{c.labels.semesters.summer}</option>
                                    </select>
                                </SettingsField>
                                <SettingsToggleRow
                                    id="subject_registration_open"
                                    label={s.subjectRegistrationOpen}
                                    hint={s.subjectRegistrationOpenHint}
                                    checked={data.subject_registration_open}
                                    onCheckedChange={(checked) => update('subject_registration_open', checked)}
                                />
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <SettingsField id="registration_starts_at" label={s.registrationStartsAt} error={errorOf('registration_starts_at')}>
                                        <DateField
                                            id="registration_starts_at"
                                            value={data.registration_starts_at}
                                            onChange={(value) => update('registration_starts_at', value)}
                                            onValidityChange={markDateValidity('registration_starts_at')}
                                            invalid={!!errorOf('registration_starts_at')}
                                            formatErrorMessage={s.errDateInvalid}
                                        />
                                    </SettingsField>
                                    <SettingsField id="registration_ends_at" label={s.registrationEndsAt} error={errorOf('registration_ends_at')}>
                                        <DateField
                                            id="registration_ends_at"
                                            value={data.registration_ends_at}
                                            onChange={(value) => update('registration_ends_at', value)}
                                            onValidityChange={markDateValidity('registration_ends_at')}
                                            invalid={!!errorOf('registration_ends_at')}
                                            formatErrorMessage={s.errDateInvalid}
                                        />
                                    </SettingsField>
                                    <SettingsField id="add_drop_deadline" label={s.addDropDeadline} error={errorOf('add_drop_deadline')}>
                                        <DateField
                                            id="add_drop_deadline"
                                            value={data.add_drop_deadline}
                                            onChange={(value) => update('add_drop_deadline', value)}
                                            onValidityChange={markDateValidity('add_drop_deadline')}
                                            invalid={!!errorOf('add_drop_deadline')}
                                            formatErrorMessage={s.errDateInvalid}
                                        />
                                    </SettingsField>
                                </div>
                                <SettingsHint>{s.termWindowHint}</SettingsHint>

                                {timelineVisible ? (
                                    <div className="rounded-xl border bg-background p-4">
                                        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                                            {s.timelineTitle}
                                        </p>
                                        <ol className="space-y-2">
                                            {timelineSteps.map((step) => (
                                                <li key={step.label} className="flex items-center gap-2.5 text-sm">
                                                    <span
                                                        className={cn(
                                                            'size-2 shrink-0 rounded-full',
                                                            step.iso ? 'bg-primary' : 'bg-muted-foreground/30',
                                                        )}
                                                    />
                                                    <span className="text-muted-foreground">{step.label}</span>
                                                    <span className="font-semibold tabular-nums" dir="ltr">
                                                        {step.iso ? isoToDisplayDate(step.iso) : '—'}
                                                    </span>
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                ) : (
                                    <SettingsHint>{s.timelineEmpty}</SettingsHint>
                                )}

                                {termIncomplete && (
                                    <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-warning/20 bg-warning/10 p-3 text-sm text-warning">
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                            <p>{s.registrationIncomplete}</p>
                                        </div>
                                        <Button type="button" variant="outline" size="sm" onClick={() => goToField('academic_year')}>
                                            {s.fixTermCta}
                                        </Button>
                                    </div>
                                )}
                            </section>
                        </TabsContent>

                        <TabsContent value="admission" className="mt-4">
                            <section className="space-y-5 rounded-xl border bg-card p-6">
                                <h2 className="font-display text-2xl font-extrabold leading-snug">{s.admissionSection}</h2>
                                <SettingsToggleRow
                                    id="admission_open"
                                    label={s.admissionOpen}
                                    hint={s.admissionOpenHint}
                                    checked={data.admission_open}
                                    onCheckedChange={(checked) => update('admission_open', checked)}
                                />
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <SettingsField id="admission_opens_at" label={s.admissionOpensAt} error={errorOf('admission_opens_at')}>
                                        <DateField
                                            id="admission_opens_at"
                                            value={data.admission_opens_at}
                                            onChange={(value) => update('admission_opens_at', value)}
                                            onValidityChange={markDateValidity('admission_opens_at')}
                                            invalid={!!errorOf('admission_opens_at')}
                                            formatErrorMessage={s.errDateInvalid}
                                        />
                                    </SettingsField>
                                    <SettingsField id="admission_closes_at" label={s.admissionClosesAt} error={errorOf('admission_closes_at')}>
                                        <DateField
                                            id="admission_closes_at"
                                            value={data.admission_closes_at}
                                            onChange={(value) => update('admission_closes_at', value)}
                                            onValidityChange={markDateValidity('admission_closes_at')}
                                            invalid={!!errorOf('admission_closes_at')}
                                            formatErrorMessage={s.errDateInvalid}
                                        />
                                    </SettingsField>
                                </div>
                                <div>
                                    <Label className="text-sm font-semibold">{s.admissionScope}</Label>
                                    <div className="mt-3">
                                        <AdmissionScopeMatrix
                                            departments={departments}
                                            selectedLevelIds={data.admission_level_ids}
                                            onChange={(ids) => update('admission_level_ids', ids)}
                                        />
                                    </div>
                                </div>
                            </section>
                        </TabsContent>

                        <TabsContent value="grades" className="mt-4">
                            <section className="space-y-5 rounded-xl border bg-card p-6">
                                <h2 className="font-display text-2xl font-extrabold leading-snug">{s.gradesSection}</h2>
                                <SettingsField id="grade_entry_deadline" label={s.deadline} hint={s.deadlineHint} error={errorOf('grade_entry_deadline')}>
                                    <DateField
                                        id="grade_entry_deadline"
                                        value={data.grade_entry_deadline}
                                        onChange={(value) => update('grade_entry_deadline', value)}
                                        onValidityChange={markDateValidity('grade_entry_deadline')}
                                        invalid={!!errorOf('grade_entry_deadline')}
                                        formatErrorMessage={s.errDateInvalid}
                                    />
                                </SettingsField>
                                <SettingsToggleRow
                                    id="grades_locked"
                                    label={s.manualLock}
                                    checked={data.grades_locked}
                                    onCheckedChange={(checked) => update('grades_locked', checked)}
                                />
                            </section>
                        </TabsContent>

                        <TabsContent value="attendance" className="mt-4">
                            <section className="space-y-5 rounded-xl border bg-card p-6">
                                <h2 className="font-display text-2xl font-extrabold leading-snug">{s.attendanceSection}</h2>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <SettingsField
                                        id="consecutive_absence_threshold"
                                        label={s.consecutiveAbsenceThreshold}
                                        hint={s.consecutiveAbsenceHint}
                                    >
                                        <Input
                                            id="consecutive_absence_threshold"
                                            type="number"
                                            min={1}
                                            max={30}
                                            value={data.consecutive_absence_threshold}
                                            onChange={(e) => update('consecutive_absence_threshold', Number(e.target.value))}
                                        />
                                    </SettingsField>
                                    <SettingsField id="absence_rate_threshold" label={s.absenceRateThreshold} hint={s.absenceRateHint}>
                                        <Input
                                            id="absence_rate_threshold"
                                            type="number"
                                            min={1}
                                            max={100}
                                            step={0.1}
                                            value={data.absence_rate_threshold}
                                            onChange={(e) => update('absence_rate_threshold', Number(e.target.value))}
                                        />
                                    </SettingsField>
                                </div>
                            </section>
                        </TabsContent>
                    </Tabs>
                </form>
            </div>

            {isDirty && (
                <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4">
                    <div className="pointer-events-auto flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-lg">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                            <span className="relative inline-flex size-2 rounded-full bg-primary" />
                        </span>
                        <p className="pe-1 text-sm font-semibold">{s.unsavedChanges}</p>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                reset();
                                setFieldErrors({});
                                setInvalidDates({});
                            }}
                        >
                            {s.discardChanges}
                        </Button>
                        <Button type="button" size="sm" onClick={requestSave} disabled={processing}>
                            {processing ? c.common.saving : c.common.save}
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmationDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => {
                    setConfirmOpen(false);
                    doSave();
                }}
                title={s.confirmDangerTitle}
                description={s.confirmDangerDescription}
                confirmText={s.confirmSave}
                cancelText={c.common.cancel}
                variant="warning"
                loading={processing}
            >
                <ul className="space-y-2 text-sm">
                    {dangerChanges.map((change) => (
                        <li key={change} className="flex items-start gap-2">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                            <span>{change}</span>
                        </li>
                    ))}
                </ul>
            </ConfirmationDialog>
        </AppLayout>
    );
}
