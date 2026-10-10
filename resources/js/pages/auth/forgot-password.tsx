import { SiteField } from '@/components/site/primitives/site-field';
import AuthLayout from '@/layouts/auth-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthLayout title="Forgot password" description="Enter your email to receive a password reset link">
            <Head title="Forgot password" />

            <form onSubmit={submit}>
                {status && <p className="m-0 mb-6 border border-teal px-4 py-3 text-center text-[13px] font-semibold text-teal-dark">{status}</p>}

                <SiteField
                    id="email"
                    label="Email address"
                    type="email"
                    name="email"
                    autoComplete="off"
                    value={data.email}
                    autoFocus
                    disabled={processing}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="email@example.com"
                    error={errors.email}
                />

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-site-button border border-transparent bg-ink px-[21px] py-[14px] text-[13px] font-bold text-white transition-colors hover:bg-ink-2 disabled:opacity-50"
                >
                    {processing && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                    Email password reset link
                </button>
            </form>

            <p className="m-0 mt-6 text-center text-[12px] text-ink-muted">
                Or, <Link href={route('login')} className="font-bold text-teal-dark underline underline-offset-4 hover:text-coral">return to log in</Link>
            </p>
        </AuthLayout>
    );
}
