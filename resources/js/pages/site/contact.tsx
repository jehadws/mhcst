import { SeoHead } from '@/components/seo-head';
import { InnerHero } from '@/components/site/primitives/inner-hero';
import { InnerSection } from '@/components/site/primitives/inner-section';
import { FaqList } from '@/components/site/sections/faq-list';
import { SiteLayout } from '@/components/site/site-layout';
import { useSite } from '@/context/site-context';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

interface FaqItem {
    question: string;
    answer: string;
}

interface Props {
    faqs?: FaqItem[];
}

const inputClass =
    'w-full border-0 border-b border-line bg-transparent px-0 py-[10px] text-[14px] text-ink outline-none transition-colors focus:border-coral';
const labelClass = 'mb-2 block text-[12px] text-ink-muted';

export default function PublicContactPage({ faqs = [] }: Props) {
    const { t, locale } = useSite();
    const settings = useSiteSettings();
    const isAr = locale === 'ar';

    const contactPhone = settings.contact_phone || '+218 91 234 5678';
    const contactEmail = settings.contact_email || 'info@mhcst.edu.ly';
    const address = settings.address || t.location.address;

    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        router.post(route('contact.store'), form, {
            onSuccess: () => {
                toast.success(t.enroll.successTitle);
                setForm({ name: '', email: '', phone: '', subject: '', message: '' });
                setSubmitting(false);
            },
            onError: () => {
                toast.error(isAr ? 'حدث خطأ، يرجى المحاولة لاحقاً' : 'Something went wrong, please try again.');
                setSubmitting(false);
            },
        });
    };

    const details = [
        { label: t.location.email, value: contactEmail, href: `mailto:${contactEmail}` },
        { label: t.location.phone, value: contactPhone, href: `tel:${contactPhone.replace(/\s/g, '')}` },
        {
            label: isAr ? 'العنوان' : 'Address',
            value: address,
            href: `https://maps.google.com/?q=${encodeURIComponent(address)}`,
            external: true,
        },
        {
            label: 'WhatsApp',
            value: t.location.whatsapp,
            href: `https://wa.me/${(settings.whatsapp_number || contactPhone).replace(/\D/g, '')}`,
            external: true,
        },
    ];

    return (
        <>
            <SeoHead title={t.nav.contact} description={isAr ? `تواصل مع ${t.brandFull}` : `Contact ${t.brandFull}`} />
            <SiteLayout headerVariant="solid">
                <InnerHero index="05" eyebrow={t.nav.contact} title={t.location.title} intro={t.location.subtitle} />

                <InnerSection tone="cream" kicker={t.enroll.title} title={t.enroll.title} lead={t.enroll.subtitle}>
                    <div className="site-lg:grid site-lg:grid-cols-2 site-lg:gap-[100px]">
                        <form onSubmit={handleSubmit} className="bg-white p-[30px]">
                            <label className={labelClass} htmlFor="c-name">
                                {t.enroll.name} *
                            </label>
                            <input id="c-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} />

                            <label className={cn(labelClass, 'mt-6')} htmlFor="c-phone">
                                {t.enroll.phone} *
                            </label>
                            <input id="c-phone" required dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} />

                            <label className={cn(labelClass, 'mt-6')} htmlFor="c-email">
                                {t.enroll.email}
                            </label>
                            <input id="c-email" type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} />

                            <label className={cn(labelClass, 'mt-6')} htmlFor="c-message">
                                {t.enroll.message}
                            </label>
                            <textarea
                                id="c-message"
                                rows={4}
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                className={cn(inputClass, 'resize-y')}
                            />

                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-ink mt-8 w-full py-[15px] text-[13px] font-bold text-white transition-colors hover:bg-teal-dark disabled:opacity-60"
                            >
                                {submitting ? t.enroll.submitting : t.enroll.submit}
                            </button>
                        </form>

                        <div className="mt-10 site-lg:mt-0">
                            <div className="border-t border-line">
                                {details.map((d) => (
                                    <a
                                        key={d.label}
                                        href={d.href}
                                        target={d.external ? '_blank' : undefined}
                                        rel={d.external ? 'noopener noreferrer' : undefined}
                                        className="flex flex-col border-b border-line py-4 no-underline transition-colors hover:bg-white/60"
                                    >
                                        <small className="mb-1 text-[10px] font-bold text-coral">{d.label}</small>
                                        <strong className="font-site-latin text-[15px] font-semibold text-ink" dir="ltr">
                                            {d.value}
                                        </strong>
                                    </a>
                                ))}
                            </div>
                            <div className="border-t border-line pt-6">
                                <span className="text-[10px] font-bold tracking-[0.1em] text-coral">{t.location.hours}</span>
                                <p className="font-site-latin mt-2 text-[14px] font-semibold text-ink" dir="ltr">
                                    {t.location.hoursValue}
                                </p>
                            </div>
                        </div>
                    </div>
                </InnerSection>

                <section className="bg-paper py-[75px] site-md:py-[110px]" aria-labelledby="map-heading">
                    <div className="site-container">
                        <div className="mb-9 flex flex-wrap items-end justify-between gap-6">
                            <h2 id="map-heading" className="m-0 text-[clamp(2.1rem,5vw,3.4rem)] leading-[1.24] font-semibold tracking-[-0.06em]">
                                {isAr ? 'تجدنا هنا' : 'Find us here'} <span className="text-teal">{t.location.address}</span>
                            </h2>
                            <p className="m-0 max-w-[330px] text-[13px] leading-[2] text-ink-muted">{t.location.addressLine}</p>
                        </div>
                        <iframe
                            src="https://www.openstreetmap.org/export/embed.html?bbox=13.1,32.8,13.3,32.95&layer=mapnik&marker=32.8872,13.1913"
                            width="100%"
                            height="420"
                            style={{ border: 0 }}
                            loading="lazy"
                            title={isAr ? 'موقع الكلية' : 'College location'}
                            className="block w-full border border-line"
                        />
                    </div>
                </section>

                <FaqList items={faqs} />

                <section className="bg-ink py-[75px] text-white">
                    <div className="site-container flex flex-wrap items-end justify-between gap-x-[60px] gap-y-8">
                        <div>
                            <span className="font-site-latin text-[10px] font-bold tracking-[0.13em] text-kicker-light">MHCST · {new Date().getFullYear()}</span>
                            <h2 className="m-[20px_0_0] max-w-[620px] text-[clamp(2.3rem,5vw,3.6rem)] leading-[1.2] font-semibold tracking-[-0.06em]">
                                {t.ctaBanner.title}
                            </h2>
                        </div>
                        <div className="flex flex-col items-start gap-6">
                            <div>
                                <span className="text-[10px] font-bold tracking-[0.1em] text-coral">{t.location.hours}</span>
                                <p className="font-site-latin m-0 mt-2 text-[14px] font-semibold text-white" dir="ltr">
                                    {t.location.hoursValue}
                                </p>
                            </div>
                            <Link
                                href="/student/register"
                                className="bg-coral px-[26px] py-[15px] text-[13px] font-bold text-white no-underline transition-colors hover:bg-coral-hover"
                            >
                                {t.ctaBanner.button}
                            </Link>
                        </div>
                    </div>
                </section>
            </SiteLayout>
        </>
    );
}
