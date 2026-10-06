import { AuthField, AuthPasswordField } from '@/components/auth-fields';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useSite } from '@/context/site-context';
import { useBrandText } from '@/hooks/use-site-settings';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

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

      {status && (
        <div className="border-success/30 bg-success/10 text-success mb-6 rounded-[10px] px-4 py-3 text-center text-sm font-medium">{status}</div>
      )}

      <form className="flex flex-col" onSubmit={submit}>
        <p className="text-primary mb-3.5 text-[13px] font-bold tracking-wide">{brandName}</p>
        <h1 className="text-foreground max-w-[570px] text-2xl leading-[1.45] font-bold tracking-tight sm:text-3xl">{t.auth.loginTitle}</h1>
        <p className="text-muted-foreground mt-3 text-[15px]">{t.auth.loginSubtitle}</p>

        <div className="mt-9 grid gap-6">
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
          <label className="text-muted-foreground flex items-center gap-2 text-sm" htmlFor="remember">
            <Checkbox
              id="remember"
              name="remember"
              tabIndex={3}
              checked={data.remember}
              onCheckedChange={(checked) => setData('remember', checked === true)}
            />
            {t.auth.rememberMe}
          </label>

          {canResetPassword && (
            <TextLink href={route('password.request')} className="text-muted-foreground hover:text-foreground text-xs" tabIndex={4}>
              {t.auth.forgotPassword}
            </TextLink>
          )}
        </div>

        <Button
          type="submit"
          className="shadow-primary/20 mt-7 h-12 w-full rounded-[10px] text-sm font-bold shadow-lg"
          tabIndex={5}
          disabled={processing}
        >
          {processing && <LoaderCircle className="size-4 animate-spin" />}
          {t.auth.login}
        </Button>

        <p className="text-muted-foreground mt-6 text-center text-sm">
          {t.auth.noAccount}{' '}
          <TextLink href={route('student.register')} tabIndex={6} className="text-primary hover:text-primary/80 font-bold">
            {locale === 'ar' ? 'تسجيل طالب جديد' : 'Student registration'}
          </TextLink>
        </p>
      </form>
    </AuthLayout>
  );
}
