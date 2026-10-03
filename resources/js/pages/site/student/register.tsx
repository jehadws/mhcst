import { AuthField, AuthPasswordField } from '@/components/auth-fields';
import { SeoHead } from '@/components/seo-head';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { PageHero } from '@/components/site/page-hero';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import InputError from '@/components/input-error';
import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
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

const selectClass =
  'h-[50px] rounded-[10px] border-input bg-card px-4 text-sm transition-colors hover:border-muted-foreground/40 focus-visible:border-primary focus-visible:bg-background focus-visible:ring-4 focus-visible:ring-primary/10 focus-visible:ring-offset-0';

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
  required,
  disabled,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-foreground text-sm font-bold" htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden="true" className="text-destructive">
            {' '}
            *
          </span>
        )}
      </label>
      <select
        id={id}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={cn(selectClass, 'appearance-none')}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <InputError message={error} />
    </div>
  );
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
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageHero
            title={isAr ? 'تسجيل طالب جديد' : 'Student registration'}
            description={
              isAr
                ? 'أنشئ حسابك الأكاديمي، اختر قسمك ومستواك، وابدأ رحلتك معنا.'
                : 'Create your academic account, choose your department and level, and start your journey with us.'
            }
            crumbs={[{ label: isAr ? 'التسجيل' : 'Register', href: '/student/register' }]}
          />

          <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            {!admission.open ? (
              <div className="border-border bg-card rounded-2xl border p-10 text-center shadow-md">
                <div className="bg-warning/10 text-warning mx-auto flex size-14 items-center justify-center rounded-full">
                  <Lock className="size-6" />
                </div>
                <h2 className="font-display mt-6 text-xl font-extrabold">
                  {isAr ? 'باب القبول مغلق حالياً' : 'Admission is currently closed'}
                </h2>
                <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm leading-normal">
                  {admission.message ??
                    (isAr
                      ? 'التسجيل مغلق حالياً — تابعنا لاحقاً لمعرفة موعد فتح باب القبول.'
                      : 'Admission is currently closed; please check back later.')}
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="border-border bg-card rounded-2xl border p-6 shadow-md sm:p-10" noValidate>
                {draftSaved && (
                  <div className="bg-primary/10 text-primary mb-6 flex items-center gap-2 rounded-lg px-4 py-3 text-xs font-medium">
                    <CloudUpload className="size-4 shrink-0" />
                    {isAr
                      ? 'تم حفظ مسودة تلقائياً — إذا انقطع الاتصال يمكنك العودة لهذه الصفحة لإكمال طلبك.'
                      : 'Draft saved automatically — if you lose connection, come back to this page to resume.'}
                  </div>
                )}

                {/* Personal details */}
                <fieldset className="border-border border-b pb-8">
                  <legend className="font-display text-primary px-0 text-lg leading-snug font-extrabold">
                    {isAr ? 'البيانات الشخصية' : 'Personal details'}
                  </legend>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <AuthField
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
                    <AuthField
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
                    <AuthField
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
                    <AuthField
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
                    <SelectField
                      id="gender"
                      label={isAr ? 'الجنس' : 'Gender'}
                      value={data.gender}
                      onChange={(v) => setData('gender', v)}
                      options={[
                        { value: 'male', label: isAr ? 'ذكر' : 'Male' },
                        { value: 'female', label: isAr ? 'أنثى' : 'Female' },
                      ]}
                      placeholder={isAr ? 'اختر...' : 'Select...'}
                      error={errors.gender}
                      required
                      disabled={processing}
                    />
                    <AuthField
                      id="city"
                      label={isAr ? 'المدينة' : 'City'}
                      type="text"
                      autoComplete="address-level2"
                      value={data.city}
                      disabled={processing}
                      onChange={(e) => setData('city', e.target.value)}
                      error={errors.city}
                    />
                    <div className="sm:col-span-2">
                      <AuthField
                        id="address"
                        label={isAr ? 'العنوان' : 'Address'}
                        type="text"
                        autoComplete="street-address"
                        value={data.address}
                        disabled={processing}
                        onChange={(e) => setData('address', e.target.value)}
                        error={errors.address}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Academic placement */}
                <fieldset className="border-border border-b pb-8">
                  <legend className="font-display text-primary px-0 pt-8 text-lg leading-snug font-extrabold">
                    {isAr ? 'القسم الأكاديمي' : 'Academic placement'}
                  </legend>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <SelectField
                      id="department_id"
                      label={isAr ? 'القسم' : 'Department'}
                      value={data.department_id}
                      onChange={(v) => {
                        setData({ ...data, department_id: v, level_id: '' });
                      }}
                      options={departments.map((d) => ({ value: String(d.id), label: d.name }))}
                      placeholder={isAr ? 'اختر القسم...' : 'Choose a department...'}
                      error={errors.department_id}
                      required
                      disabled={processing}
                    />
                    <SelectField
                      id="level_id"
                      label={isAr ? 'المستوى / الشعبة' : 'Level / section'}
                      value={data.level_id}
                      onChange={(v) => setData('level_id', v)}
                      options={levelOptions}
                      placeholder={
                        data.department_id
                          ? isAr
                            ? 'اختر المستوى...'
                            : 'Choose a level...'
                          : isAr
                            ? 'اختر القسماً أولاً'
                            : 'Pick a department first'
                      }
                      error={errors.level_id}
                      required
                      disabled={processing || !data.department_id}
                    />
                  </div>
                </fieldset>

                {/* Account */}
                <fieldset className="pb-2">
                  <legend className="font-display text-primary px-0 pt-8 text-lg leading-snug font-extrabold">
                    {isAr ? 'كلمة المرور' : 'Account password'}
                  </legend>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <AuthPasswordField
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
                    <AuthPasswordField
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
                </fieldset>

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

                <button
                  type="submit"
                  disabled={processing}
                  className="bg-primary text-primary-foreground mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg px-7 py-3.5 text-sm font-bold shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {processing && <LoaderCircle className="size-4 animate-spin" />}
                  {isAr ? 'إنشاء الحساب وإتمام التسجيل' : 'Create account & register'}
                </button>

                <p className="text-muted-foreground mt-4 text-center text-xs leading-normal">
                  {isAr
                    ? 'سيتم إنشاء حسابك وتسجيل دخولك مباشرة، وسيظهر طلبك بانتظار الاعتماد. سيمكنك اختيار موادك الدراسية بعد اعتماد الإدارة.'
                    : 'Your account is created and you are signed in right away, with your application pending review. Subject selection opens once the administration approves it.'}
                </p>
              </form>
            )}
          </section>
        </main>
        <SiteFooter />
        <FloatingButtons />
      </div>
    </>
  );
}
