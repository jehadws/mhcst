import { AuthField, AuthPasswordField } from '@/components/auth-fields';
import { useSite } from '@/context/site-context';
import { useBrandText } from '@/hooks/use-site-settings';
import AuthLayout from '@/layouts/auth-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister?: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { t, locale } = useSite();
    const { brandName } = useBrandText();
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout>
            <Head title={t.auth.login} />

            <form className="flex flex-col" onSubmit={submit}>
                <p className="font-site-latin m-0 mb-3 text-[11px] font-bold tracking-[0.1em] text-teal-dark">{brandName}</p>
                <h1 className="m-0 text-[25px] font-semibold tracking-[-0.04em]">{t.auth.loginTitle}</h1>
                <p className="m-0 mt-3 text-[13px] leading-[1.9] text-ink-muted">{t.auth.loginSubtitle}</p>

                {status && <p className="mt-6 mb-0 border border-teal px-4 py-3 text-center text-[13px] font-semibold text-teal-dark">{status}</p>}

                <div className="mt-9 grid gap-[26px]">
                    <AuthField
                        id="email"
                        label={t.auth.email}
                        type="email"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="email"
                        placeholder={t.auth.emailPlaceholder}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        error={errors.email}
                    />

                    <AuthPasswordField
                        id="password"
                        label={t.auth.password}
                        required
                        tabIndex={2}
                        autoComplete="current-password"
                        placeholder={t.auth.passwordPlaceholder}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        error={errors.password}
                    />
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-[12px] text-ink-muted" htmlFor="remember">
                        <input
                            id="remember"
                            name="remember"
                            type="checkbox"
                            tabIndex={3}
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="size-4 accent-[#11223b]"
                        />
                        {t.auth.rememberMe}
                    </label>

                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            tabIndex={4}
                            className="text-[12px] font-bold text-teal-dark underline underline-offset-4 transition-colors hover:text-coral"
                        >
                            {t.auth.forgotPassword}
                        </Link>
                    )}
                </div>

                <button
                    type="submit"
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-site-button border border-transparent bg-ink px-[21px] py-[14px] text-[13px] font-bold text-white transition-colors hover:bg-ink-2 disabled:opacity-50"
                    tabIndex={5}
                    disabled={processing}
                >
                    {processing && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                    {t.auth.login}
                </button>

                <p className="m-0 mt-6 text-center text-[12px] text-ink-muted">
                    {t.auth.noAccount}{' '}
                    <Link
                        href={route('student.register')}
                        tabIndex={6}
                        className="font-bold text-teal-dark underline underline-offset-4 transition-colors hover:text-coral"
                    >
                        {locale === 'ar' ? 'تسجيل طالب جديد' : 'Student registration'}
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
