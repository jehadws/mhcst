import { SeoHead } from '@/components/seo-head';
import { InnerHero } from '@/components/site/primitives/inner-hero';
import { InnerSection, StepList } from '@/components/site/primitives/inner-section';
import { SiteButton } from '@/components/site/primitives/button';
import { FormSection, SiteField, SitePassword, SiteSelect } from '@/components/site/primitives/site-field';
import { CtaBand } from '@/components/site/sections/cta-band';
import { SiteLayout } from '@/components/site/site-layout';
import { useSite } from '@/context/site-context';
import { router, useForm } from '@inertiajs/react';
import { CloudUpload, LoaderCircle, Lock } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

interface DepartmentLevel {
    id: number;
    label: string;
    year: number;
    section: string;
}

interface RegisterDepartment {
    id: number;
    name: string;
    levels: DepartmentLevel[];
}

type StudentRegisterForm = {
    name: string;
    email: string;
    phone: string;
    gender: string;
    birth_date: string;
    city: string;
    address: string;
    department_id: string;
    level_id: string;
    password: string;
    password_confirmation: string;
    company: string;
};

interface DraftData {
    name?: string;
    email?: string;
    phone?: string;
    gender?: string;
    birth_date?: string;
    city?: string;
    address?: string;
    department_id?: string;
    level_id?: string;
}

export default function StudentRegister({
    departments = [],
    admission,
    draft,
}: {
    departments?: RegisterDepartment[];
    admission: { open: boolean; message?: string | null };
    draft?: DraftData | null;
}) {
    const { t, locale } = useSite();
    const isAr = locale === 'ar';

    const today = new Date().toISOString().slice(0, 10);

    const { data, setData, post, processing, errors } = useForm<StudentRegisterForm>({
        name: draft?.name ?? '',
        email: draft?.email ?? '',
        phone: draft?.phone ?? '',
        gender: draft?.gender ?? '',
        birth_date: draft?.birth_date ?? '',
        city: draft?.city ?? '',
        address: draft?.address ?? '',
        department_id: draft?.department_id ?? '',
        level_id: draft?.level_id ?? '',
        password: '',
        password_confirmation: '',
        company: '',
    });

    const selectedDepartment = departments.find((d) => String(d.id) === data.department_id);
    const levelOptions = (selectedDepartment?.levels ?? []).map((level) => ({
        value: String(level.id),
        label: isAr ? `السنة ${level.year} — شعبة ${level.section}` : level.label,
    }));

    // Drop draft department/level choices that admission settings no longer allow.
    useEffect(() => {
        if (data.department_id && !selectedDepartment) {
            setData({ ...data, department_id: '', level_id: '' });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('student.register.store'), {
            onFinish: () => setData('password', ''),
        });
    };

    // ─── Draft autosave ──────────────────────────────────────────────────────
    // Debounced server-side autosave of the non-secret fields, so a dropped
    // connection never loses progress; resumed by revisiting the page.
    const [draftSaved, setDraftSaved] = useState(false);
    const firstRender = useRef(true);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        if (!admission.open) {
            return;
        }

        const payload = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            gender: data.gender,
            birth_date: data.birth_date,
            city: data.city,
            address: data.address,
            department_id: data.department_id,
            level_id: data.level_id,
        };

        const isEmpty = Object.values(payload).every((v) => !v);
        if (isEmpty) {
            return;
        }

        const timer = setTimeout(() => {
            router.post(route('student.register.draft'), payload, {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => setDraftSaved(true),
            });
        }, 1500);

        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        data.name,
        data.email,
        data.phone,
        data.gender,
        data.birth_date,
        data.city,
        data.address,
        data.department_id,
        data.level_id,
    ]);

    return (
        <>
            <SeoHead
                title={isAr ? 'تسجيل طالب جديد' : 'Student Registration'}
                description={
                    isAr
                        ? `سجّل طالباً في ${t.brandFull} — أنشئ حسابك واختر قسمك الأكاديمي.`
                        : `Register as a student at ${t.brandFull} — create your account and choose your academic department.`
                }
            />
            <SiteLayout headerVariant="solid">
                <InnerHero
                    index="07"
                    eyebrow={t.nav.enroll}
                    title={isAr ? 'تسجيل طالب جديد' : 'Student registration'}
                    intro={
                        isAr
                            ? 'أنشئ حسابك الأكاديمي، اختر قسمك ومستواك، وابدأ رحلتك معنا.'
                            : 'Create your academic account, choose your department and level, and start your journey with us.'
                    }
                />

                <section className="bg-cream py-[70px] site-md:py-[100px]">
                    <div className="site-container">
                        <div className="mx-auto max-w-[860px] bg-white p-[24px] site-md:p-[40px]">
                            {!admission.open ? (
                                <div className="py-[30px] text-center">
                                    <span className="mx-auto grid size-[54px] place-items-center rounded-full bg-coral/15 text-coral">
                                        <Lock className="size-6" aria-hidden="true" />
                                    </span>
                                    <h2 className="mt-6 mb-3 text-[24px] font-semibold tracking-[-0.04em]">
                                        {isAr ? 'باب القبول مغلق حالياً' : 'Admission is currently closed'}
                                    </h2>
                                    <p className="mx-auto max-w-[440px] text-[14px] leading-[2] text-ink-muted">
                                        {admission.message ??
                                            (isAr
                                                ? 'التسجيل مغلق حالياً — تابعنا لاحقاً لمعرفة موعد فتح باب القبول.'
                                                : 'Admission is currently closed; please check back later.')}
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={submit} noValidate>
                                    {draftSaved ? (
                                        <p className="mb-7 flex items-start gap-2 border-t border-line pt-4 text-[11px] leading-[1.9] text-ink-muted">
                                            <CloudUpload className="mt-px size-4 shrink-0 text-teal-dark" aria-hidden="true" />
                                            {isAr
                                                ? 'تم حفظ مسودة تلقائياً — إذا انقطع الاتصال يمكنك العودة لهذه الصفحة لإكمال طلبك.'
                                                : 'Draft saved automatically — if you lose connection, come back to this page to resume.'}
                                        </p>
                                    ) : null}

                                    <FormSection title={isAr ? 'البيانات الشخصية' : 'Personal details'}>
                                        <div className="grid gap-[26px] site-md:grid-cols-2">
                                            <SiteField
                                                id="name"
                                                label={isAr ? 'الاسم الكامل' : 'Full name'}
                                                type="text"
                                                required
                                                autoComplete="name"
                                                value={data.name}
                                                disabled={processing}
                                                onChange={(e) => setData('name', e.target.value)}
                                                error={errors.name}
                                            />
                                            <SiteField
                                                id="phone"
                                                label={isAr ? 'رقم الهاتف' : 'Phone number'}
                                                type="tel"
                                                required
                                                dir="ltr"
                                                autoComplete="tel"
                                                value={data.phone}
                                                disabled={processing}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                error={errors.phone}
                                            />
                                            <SiteField
                                                id="email"
                                                label={t.auth.email}
                                                type="email"
                                                required
                                                dir="ltr"
                                                autoComplete="email"
                                                value={data.email}
                                                disabled={processing}
                                                onChange={(e) => setData('email', e.target.value)}
                                                error={errors.email}
                                            />
                                            <SiteField
                                                id="birth_date"
                                                label={isAr ? 'تاريخ الميلاد' : 'Date of birth'}
                                                type="date"
                                                required
                                                max={today}
                                                value={data.birth_date}
                                                disabled={processing}
                                                onChange={(e) => setData('birth_date', e.target.value)}
                                                error={errors.birth_date}
                                            />
                                            <SiteSelect
                                                id="gender"
                                                label={isAr ? 'الجنس' : 'Gender'}
                                                value={data.gender}
                                                onChange={(e) => setData('gender', e.target.value)}
                                                error={errors.gender}
                                                required
                                                disabled={processing}
                                            >
                                                <option value="">{isAr ? 'اختر...' : 'Select...'}</option>
                                                <option value="male">{isAr ? 'ذكر' : 'Male'}</option>
                                                <option value="female">{isAr ? 'أنثى' : 'Female'}</option>
                                            </SiteSelect>
                                            <SiteField
                                                id="city"
                                                label={isAr ? 'المدينة' : 'City'}
                                                type="text"
                                                autoComplete="address-level2"
                                                value={data.city}
                                                disabled={processing}
                                                onChange={(e) => setData('city', e.target.value)}
                                                error={errors.city}
                                            />
                                            <SiteField
                                                id="address"
                                                label={isAr ? 'العنوان' : 'Address'}
                                                type="text"
                                                autoComplete="street-address"
                                                value={data.address}
                                                disabled={processing}
                                                onChange={(e) => setData('address', e.target.value)}
                                                error={errors.address}
                                                wrapClass="site-md:col-span-2"
                                            />
                                        </div>
                                    </FormSection>

                                    <FormSection title={isAr ? 'القسم الأكاديمي' : 'Academic placement'}>
                                        <div className="grid gap-[26px] site-md:grid-cols-2">
                                            <SiteSelect
                                                id="department_id"
                                                label={isAr ? 'القسم' : 'Department'}
                                                value={data.department_id}
                                                onChange={(e) => setData({ ...data, department_id: e.target.value, level_id: '' })}
                                                error={errors.department_id}
                                                required
                                                disabled={processing}
                                            >
                                                <option value="">{isAr ? 'اختر القسم...' : 'Choose a department...'}</option>
                                                {departments.map((dept) => (
                                                    <option key={dept.id} value={String(dept.id)}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </SiteSelect>
                                            <SiteSelect
                                                id="level_id"
                                                label={isAr ? 'المستوى / الشعبة' : 'Level / section'}
                                                value={data.level_id}
                                                onChange={(e) => setData('level_id', e.target.value)}
                                                error={errors.level_id}
                                                required
                                                disabled={processing || !data.department_id}
                                            >
                                                <option value="">
                                                    {data.department_id
                                                        ? isAr
                                                            ? 'اختر المستوى...'
                                                            : 'Choose a level...'
                                                        : isAr
                                                            ? 'اختر القسماً أولاً'
                                                            : 'Pick a department first'}
                                                </option>
                                                {levelOptions.map((option) => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </SiteSelect>
                                        </div>
                                    </FormSection>

                                    <FormSection title={isAr ? 'كلمة المرور' : 'Account password'} className="border-b-0">
                                        <div className="grid gap-[26px] site-md:grid-cols-2">
                                            <SitePassword
                                                id="password"
                                                label={t.auth.password}
                                                required
                                                dir="ltr"
                                                autoComplete="new-password"
                                                value={data.password}
                                                disabled={processing}
                                                onChange={(e) => setData('password', e.target.value)}
                                                error={errors.password}
                                            />
                                            <SitePassword
                                                id="password_confirmation"
                                                label={t.auth.confirmPassword}
                                                required
                                                dir="ltr"
                                                autoComplete="new-password"
                                                value={data.password_confirmation}
                                                disabled={processing}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                error={errors.password_confirmation}
                                            />
                                        </div>
                                    </FormSection>

                                    {/* Honeypot — must stay empty and invisible */}
                                    <input
                                        type="text"
                                        name="company"
                                        id="company"
                                        value={data.company}
                                        onChange={(e) => setData('company', e.target.value)}
                                        className="hidden"
                                        tabIndex={-1}
                                        autoComplete="off"
                                        aria-hidden="true"
                                    />

                                    <SiteButton type="submit" variant="accent" disabled={processing} className="mt-8 w-full">
                                        {processing ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
                                        {isAr ? 'إنشاء الحساب وإتمام التسجيل' : 'Create account & register'}
                                    </SiteButton>

                                    <p className="mt-5 mb-0 text-center text-[11px] leading-[1.9] text-ink-muted">
                                        {isAr
                                            ? 'سيتم إنشاء حسابك وتسجيل دخولك مباشرة، وسيظهر طلبك بانتظار الاعتماد. سيمكنك اختيار موادك الدراسية بعد اعتماد الإدارة.'
                                            : 'Your account is created and you are signed in right away, with your application pending review. Subject selection opens once the administration approves it.'}
                                    </p>
                                </form>
                            )}
                        </div>
                    </div>
                </section>

                <InnerSection
                    tone="paper"
                    kicker={t.applicationSteps.label}
                    title={t.applicationSteps.title}
                    accent={t.applicationSteps.titleAccent}
                    lead={t.applicationSteps.description}
                >
                    <StepList
                        items={t.applicationSteps.steps.map((step) => ({ title: step.title, body: step.description }))}
                    />
                </InnerSection>

                <CtaBand />
            </SiteLayout>
        </>
    );
}
