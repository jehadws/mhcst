import { SiteField, SitePassword } from '@/components/site/primitives/site-field';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <Head title="Reset password" />

            <form onSubmit={submit} className="grid gap-[26px]">
                <SiteField
                    id="email"
                    label="Email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={data.email}
                    readOnly
                    error={errors.email}
                />

                <SitePassword
                    id="password"
                    label="Password"
                    name="password"
                    autoComplete="new-password"
                    value={data.password}
                    autoFocus
                    disabled={processing}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <SitePassword
                    id="password_confirmation"
                    label="Confirm password"
                    name="password_confirmation"
                    autoComplete="new-password"
                    value={data.password_confirmation}
                    disabled={processing}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                />

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-site-button border border-transparent bg-ink px-[21px] py-[14px] text-[13px] font-bold text-white transition-colors hover:bg-ink-2 disabled:opacity-50"
                >
                    {processing && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                    Reset password
                </button>
            </form>
        </AuthLayout>
    );
}
