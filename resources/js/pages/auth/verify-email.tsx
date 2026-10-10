import AuthLayout from '@/layouts/auth-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthLayout title="Verify email" description="Please verify your email address by clicking on the link we just emailed to you.">
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <p className="m-0 mb-6 border border-teal px-4 py-3 text-center text-[13px] font-semibold text-teal-dark">
                    A new verification link has been sent to the email address you provided during registration.
                </p>
            )}

            <form onSubmit={submit} className="text-center">
                <button
                    type="submit"
                    disabled={processing}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-site-button border border-transparent bg-ink px-[21px] py-[14px] text-[13px] font-bold text-white transition-colors hover:bg-ink-2 disabled:opacity-50"
                >
                    {processing && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
                    Resend verification email
                </button>

                <p className="m-0 mt-6 text-[12px] text-ink-muted">
                    <Link href={route('logout')} method="post" className="font-bold text-teal-dark underline underline-offset-4 hover:text-coral">
                        Log out
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
