import { SitePassword } from '@/components/site/primitives/site-field';
import AuthLayout from '@/layouts/auth-layout';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirm password" />

            <form onSubmit={submit}>
                <SitePassword
                    id="password"
                    label="Password"
                    name="password"
                    autoComplete="current-password"
                    value={data.password}
                    autoFocus
                    disabled={processing}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                />

                <button
                    type="submit"
                    disabled={processing}
                    className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-site-button border border-transparent bg-ink px-[21px] py-[14px] text-[13px] font-bold text-white transition-colors hover:bg-ink-2 disabled:opacity-50"
                >
                    {processing && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                    Confirm password
                </button>
            </form>
        </AuthLayout>
    );
}
