import { SeoHead } from '@/components/seo-head';
import { CtaBanner } from '@/components/site/cta-banner';
import { Faq } from '@/components/site/faq';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { PageHero } from '@/components/site/page-hero';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite } from '@/context/site-context';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { router } from '@inertiajs/react';
import { ArrowRight, Building2, Mail, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface FaqItem {
  question: string;
  answer: string;
}

interface Props {
  faqs?: FaqItem[];
}

export default function PublicContactPage({ faqs = [] }: Props) {
  const { t, locale } = useSite();
  const settings = useSiteSettings();
  const isRtl = locale === 'ar';
  const Arrow = isRtl ? ArrowRight : ArrowRight;

  const contactPhone = settings.contact_phone || '+218 91 234 5678';
  const contactEmail = settings.contact_email || 'info@mhcst.ly';
  const address = settings.address || (isRtl ? 'طرابلس، ليبيا' : 'Tripoli, Libya');

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
        toast.error(isRtl ? 'حدث خطأ، يرجى المحاولة لاحقاً' : 'Something went wrong, please try again.');
        setSubmitting(false);
      },
    });
  };

  const cards = [
    { icon: Mail, title: isRtl ? 'البريد الإلكتروني' : 'Email', value: contactEmail, href: `mailto:${contactEmail}` },
    { icon: Phone, title: isRtl ? 'الهاتف' : 'Phone', value: contactPhone, href: `tel:${contactPhone}` },
    { icon: Building2, title: isRtl ? 'العنوان' : 'Address', value: address, href: `https://maps.google.com/?q=${encodeURIComponent(address)}`, external: true },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      value: isRtl ? 'ابدأ المحادثة' : 'Start a chat',
      href: `https://wa.me/${(settings.whatsapp_number || contactPhone).replace(/\D/g, '')}`,
      external: true,
    },
  ];

  return (
    <>
      <SeoHead title={t.nav.contact} description={isRtl ? 'تواصل مع المعايير الحديثة للتعليم والتدريب' : 'Contact Modern Standards for Education & Training'} />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageHero
            label={t.nav.contact}
            title={isRtl ? 'نسعد بالتواصل معك' : "We'd love to hear from you"}
            description={isRtl ? 'احصل على استشارة مجانية حول برامجنا الأكاديمية والتدريبية.' : 'Get a free consultation about our academic and training programs.'}
          />

          <section className="py-16 sm:py-20">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
              <div className="space-y-6 lg:col-span-5">
                <div className="border-border overflow-hidden border">
                  <img
                    src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1200&auto=format&fit=crop"
                    alt={isRtl ? 'مبنى المعهد' : 'Institute building'}
                    className="aspect-[4/3] w-full object-cover"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  {cards.map((card) => (
                    <a
                      key={card.title}
                      href={card.href}
                      target={card.external ? '_blank' : undefined}
                      rel={card.external ? 'noopener noreferrer' : undefined}
                      className="border-border bg-card hover:border-primary/30 flex items-start gap-4 border p-4 transition-colors"
                    >
                      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                        <card.icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{card.title}</p>
                        <p className="text-muted-foreground mt-0.5 truncate text-sm" dir="ltr">
                          {card.value}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              <div className="border-border bg-card border p-6 sm:p-8 lg:col-span-7">
                <h2 className="font-serif text-2xl font-bold">{t.enroll.title}</h2>
                <p className="text-muted-foreground mt-2 text-sm">{t.enroll.subtitle}</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={`${t.enroll.name} *`} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                    <Field label={`${t.enroll.phone} *`} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} dir="ltr" />
                  </div>
                  <Field label={t.enroll.email} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} dir="ltr" />
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold">{t.enroll.message}</label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="border-input bg-background w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-hero-accent text-hero-accent-foreground hover:bg-hero-accent/90 inline-flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    <Send className="size-4" />
                    {submitting ? t.enroll.submitting : t.enroll.submit}
                    <Arrow className={`size-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                </form>
              </div>
            </div>
          </section>

          <section className="bg-secondary border-border border-t py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8 text-center">
                <p className="text-primary inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.2em] uppercase">
                  <MapPin className="size-3.5" />
                  {isRtl ? 'موقعنا' : 'Our location'}
                </p>
                <h2 className="text-foreground mt-3 font-serif text-2xl font-bold">{isRtl ? 'تجدنا هنا' : 'Find us here'}</h2>
                <p className="text-muted-foreground mt-2 text-sm">{address}</p>
              </div>
              <div className="border-border overflow-hidden border">
                <iframe
                  src="https://www.openstreetmap.org/export/embed.html?bbox=13.1,32.8,13.3,32.95&layer=mapnik&marker=32.8872,13.1913"
                  width="100%"
                  height="420"
                  style={{ border: 0 }}
                  loading="lazy"
                  title={isRtl ? 'موقع المعهد' : 'Institute location'}
                  className="block w-full"
                />
              </div>
            </div>
          </section>

          <Faq items={faqs} />
          <CtaBanner />
        </main>
        <SiteFooter />
        <FloatingButtons />
      </div>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  dir?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold">{label}</label>
      <input
        type={type}
        value={value}
        dir={dir}
        onChange={(e) => onChange(e.target.value)}
        className="border-input bg-background w-full rounded-lg border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
