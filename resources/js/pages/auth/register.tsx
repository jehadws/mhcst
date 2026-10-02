import { AuthField, AuthPasswordField } from '@/components/auth-fields';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { useSite } from '@/context/site-context';
import { useBrandText } from '@/hooks/use-site-settings';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

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
        <p className="text-primary mb-3.5 text-[13px] font-bold tracking-wide">{brandName}</p>
        <h1 className="text-foreground max-w-[570px] text-2xl leading-[1.45] font-bold tracking-tight sm:text-3xl">{t.auth.registerTitle}</h1>
        <p className="text-muted-foreground mt-3 text-[15px]">{t.auth.registerSubtitle}</p>

        <div className="mt-9 grid gap-6">
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

        <Button
          type="submit"
          className="shadow-primary/20 mt-7 h-12 w-full rounded-[10px] text-sm font-bold shadow-lg"
          tabIndex={5}
          disabled={processing}
        >
          {processing && <LoaderCircle className="size-4 animate-spin" />}
          {t.auth.register}
        </Button>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          {t.auth.haveAccount}{' '}
          <TextLink href={route('login')} tabIndex={6} className="text-primary hover:text-primary/80 font-bold">
            {t.auth.login}
          </TextLink>
        </p>
      </form>
    </AuthLayout>
  );
}
