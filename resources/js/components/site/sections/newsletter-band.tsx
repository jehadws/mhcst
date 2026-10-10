import { useSite } from '@/context/site-context';
import { router } from '@inertiajs/react';
import { Check, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

/** Kit's newsletter row: heading on one side, single-field subscribe form on the other. */
export function NewsletterBand() {
    const { t } = useSite();
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            return;
        }
        setSubmitting(true);

        router.post(
            route('newsletter.subscribe'),
            { email },
            {
                onSuccess: () => {
                    setDone(true);
                    setSubmitting(false);
                },
                onError: () => {
                    setSubmitting(false);
                },
            },
        );
    };

    return (
        <section className="bg-paper py-[70px] site-md:py-[90px]">
            <div className="site-container flex flex-wrap items-end justify-between gap-[35px]">
                <div className="min-w-0 max-w-[520px]">
                    <span className="font-site-latin block text-[10px] font-bold tracking-[0.13em] text-teal-dark">MHCST / NOTES</span>
                    <h2 className="m-0 mt-4 text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.24] font-semibold tracking-[-0.06em]">
                        {t.newsletter.title}
                    </h2>
                    <p className="m-0 mt-4 text-[15px] leading-[2.05] text-ink-muted">{t.newsletter.subtitle}</p>
                </div>

                {done ? (
                    <p className="flex items-center gap-2 border-t border-line pt-4 text-[13px] font-semibold text-teal-dark">
                        <Check className="size-4" aria-hidden="true" />
                        {t.newsletter.success}
                    </p>
                ) : (
                    <form onSubmit={handleSubmit} className="w-full max-w-[460px] pt-2">
                        <label htmlFor="newsletter-email" className="mb-2 block text-[12px] text-ink-muted">
                            {t.newsletter.emailPlaceholder}
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="newsletter-email"
                                type="email"
                                required
                                dir="ltr"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="min-w-0 flex-1 border border-line bg-cream px-[14px] py-[13px] text-[14px] text-ink outline-none transition-colors focus:border-coral"
                            />
                            <button
                                type="submit"
                                disabled={submitting}
                                className="inline-flex items-center justify-center gap-2 border border-transparent bg-ink px-[21px] py-[14px] text-[13px] font-bold whitespace-nowrap text-white transition-colors hover:bg-ink-2 disabled:opacity-50"
                            >
                                {submitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
                                {submitting ? t.newsletter.subscribing : t.newsletter.subscribe}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </section>
    );
}
