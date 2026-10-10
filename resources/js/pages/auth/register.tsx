import { AuthField, AuthPasswordField } from '@/components/auth-fields';
import { useSite } from '@/context/site-context';
import { useBrandText } from '@/hooks/use-site-settings';
import AuthLayout from '@/layouts/auth-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
  const { t } = useSite();
  const { brandName } = useBrandText();
  const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('register'), {
      onFinish: () => reset('password', 'password_confirmation'),
    });
  };

  return (
    <AuthLayout>
      <Head title={t.auth.register} />

      <form className="flex flex-col" onSubmit={submit}>
        <p className="font-site-latin m-0 mb-3 text-[11px] font-bold tracking-[0.1em] text-teal-dark">{brandName}</p>
        <h1 className="m-0 text-[25px] font-semibold tracking-[-0.04em]">{t.auth.registerTitle}</h1>
        <p className="m-0 mt-3 text-[13px] leading-[1.9] text-ink-muted">{t.auth.registerSubtitle}</p>

        <div className="mt-9 grid gap-[26px]">
          <AuthField
            id="name"
            label={t.auth.fullName}
            type="text"
            required
            autoFocus
            tabIndex={1}
            autoComplete="name"
            placeholder={t.auth.fullNamePlaceholder}
            value={data.name}
            disabled={processing}
            onChange={(e) => setData('name', e.target.value)}
            error={errors.name}
          />

          <AuthField
            id="email"
            label={t.auth.email}
            type="email"
            required
            tabIndex={2}
            autoComplete="email"
            placeholder={t.auth.emailPlaceholder}
            value={data.email}
            disabled={processing}
            onChange={(e) => setData('email', e.target.value)}
            error={errors.email}
          />

          <AuthPasswordField
            id="password"
            label={t.auth.password}
            required
            tabIndex={3}
            autoComplete="new-password"
            placeholder={t.auth.passwordPlaceholder}
            value={data.password}
            disabled={processing}
            onChange={(e) => setData('password', e.target.value)}
            error={errors.password}
          />

          <AuthPasswordField
            id="password_confirmation"
            label={t.auth.confirmPassword}
            required
            tabIndex={4}
            autoComplete="new-password"
            placeholder={t.auth.confirmPasswordPlaceholder}
            value={data.password_confirmation}
            disabled={processing}
            onChange={(e) => setData('password_confirmation', e.target.value)}
            error={errors.password_confirmation}
          />
        </div>

        <button
          type="submit"
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-site-button border border-transparent bg-ink px-[21px] py-[14px] text-[13px] font-bold text-white transition-colors hover:bg-ink-2 disabled:opacity-50"
          tabIndex={5}
          disabled={processing}
        >
          {processing && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
          {t.auth.register}
        </button>

        <p className="m-0 mt-6 text-center text-[12px] text-ink-muted">
          {t.auth.haveAccount}{' '}
          <Link href={route('login')} tabIndex={6} className="font-bold text-teal-dark underline underline-offset-4 transition-colors hover:text-coral">
            {t.auth.login}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
