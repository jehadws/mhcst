import { SeoHead } from '@/components/seo-head';
import { CtaBanner } from '@/components/site/cta-banner';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { PageHero } from '@/components/site/page-hero';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { Testimonials } from '@/components/site/testimonials';
import { useSite } from '@/context/site-context';
import { Award, Eye, GraduationCap, Lightbulb, ShieldCheck, Target, Users } from 'lucide-react';

const CAMPUS_IMAGE = '/images/campus-aerial.png';

interface Props {
  testimonials?: Array<Record<string, unknown>>;
}

export default function PublicAboutPage({ testimonials }: Props) {
  const { t, locale } = useSite();

  const pillars = [
    {
      title: locale === 'ar' ? 'رسالتنا' : 'Our Mission',
      icon: Target,
      body:
        locale === 'ar'
          ? 'تقديم برامج تدريبية احترافية معتمدة تُمكّن الأفراد والمؤسسات من تطوير مهاراتهم والارتقاء بأدائهم المهني.'
          : 'Deliver accredited professional training that empowers individuals and organisations to develop skills and elevate performance.',
    },
    {
      title: locale === 'ar' ? 'رؤيتنا' : 'Our Vision',
      icon: Eye,
      body:
        locale === 'ar'
          ? 'أن نكون المرجع الأول في التدريب المهني المعتمد في ليبيا والمنطقة.'
          : 'To be the premier reference for accredited professional training in Libya and the region.',
    },
    {
      title: locale === 'ar' ? 'رسالة الإدارة' : 'Leadership Message',
      icon: Lightbulb,
      body:
        locale === 'ar'
          ? 'نحمل حلماً بأن يجد كل متعلم تدريباً احترافياً يثق به ويحصل من خلاله على شهادة تُغيّر مساره المهني.'
          : 'We believe every learner deserves training they can trust — and a certificate that changes their career path.',
    },
  ];

  const values = [
    {
      icon: ShieldCheck,
      title: locale === 'ar' ? 'الاعتماد والجودة' : 'Accreditation & Quality',
      body: locale === 'ar' ? 'شهادات معتمدة ومعترف بها إقليمياً ودولياً' : 'Regionally and internationally recognized certificates',
    },
    {
      icon: Users,
      title: locale === 'ar' ? 'مدربون من الخبراء' : 'Expert Instructors',
      body: locale === 'ar' ? 'نخبة من الممارسين الحقيقيين في مجالاتهم' : 'Practitioners with real-world expertise',
    },
    {
      icon: GraduationCap,
      title: locale === 'ar' ? 'مرونة التعلم' : 'Flexible Learning',
      body: locale === 'ar' ? 'حضوري وعبر الإنترنت ومدمج' : 'Onsite, online, and blended options',
    },
    {
      icon: Award,
      title: locale === 'ar' ? 'التطبيق العملي' : 'Practical Application',
      body: locale === 'ar' ? 'مشاريع حقيقية لمعرض أعمالك' : 'Real projects for your portfolio',
    },
  ];

  const milestones = [
    { year: '2010', label: locale === 'ar' ? 'التأسيس' : 'Founded' },
    { year: '2016', label: locale === 'ar' ? 'أول اعتماد' : 'First Accreditation' },
    { year: '2019', label: locale === 'ar' ? '5000+ خريج' : '5,000+ Graduates' },
    { year: '2023', label: locale === 'ar' ? 'توسّع رقمي' : 'Digital Expansion' },
    { year: '2025', label: locale === 'ar' ? '20,000+ متدرب' : '20,000+ Learners' },
  ];

  return (
    <>
      <SeoHead title={locale === 'ar' ? 'من نحن' : 'About Us'} description={pillars[0].body} />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageHero
            title={locale === 'ar' ? 'قصتنا ورحلتنا' : 'Our story & journey'}
            description={
              locale === 'ar'
                ? 'أكثر من عقد من الخبرة في بناء مهارات المهنيين عبر برامج تدريبية معتمدة.'
                : 'Over a decade of experience building professional skills through accredited training.'
            }
            crumbs={[{ label: t.nav.about, href: '/about' }]}
          />

          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-6 lg:grid-cols-3">
                {pillars.map((pillar) => (
                  <article key={pillar.title} className="border-border bg-card border p-8">
                    <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
                      <pillar.icon className="size-5" />
                    </div>
                    <h2 className="text-foreground mt-6 font-serif text-xl font-bold">{pillar.title}</h2>
                    <p className="text-muted-foreground mt-3 text-sm leading-7">{pillar.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-secondary py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="border-border bg-card overflow-hidden border shadow-lg">
                  <img src={CAMPUS_IMAGE} alt={t.campus.title} className="aspect-[4/3] w-full object-cover" />
                </div>

                <div>
                  <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">{locale === 'ar' ? 'قيمنا' : 'Our values'}</p>
                  <h2 className="text-foreground mt-3 font-serif text-3xl font-bold">{t.about.title}</h2>
                  <p className="text-muted-foreground mt-4 leading-relaxed">{t.about.body}</p>

                  <div className="divide-border border-border bg-card mt-8 divide-y border">
                    {values.map((value) => (
                      <div key={value.title} className="flex items-start gap-4 p-5">
                        <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                          <value.icon className="size-5" />
                        </div>
                        <div>
                          <h3 className="font-serif text-base font-bold">{value.title}</h3>
                          <p className="text-muted-foreground mt-1 text-sm">{value.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-foreground text-center font-serif text-3xl font-bold">{locale === 'ar' ? 'محطات مسيرتنا' : 'Our milestones'}</h2>
              <div className="mt-12 grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
                {milestones.map((milestone) => (
                  <div key={milestone.year} className="border-border bg-card border p-6 text-center">
                    <p className="text-primary font-serif text-2xl font-extrabold">{milestone.year}</p>
                    <p className="text-muted-foreground mt-2 text-sm">{milestone.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <Testimonials items={testimonials} />
          <CtaBanner />
        </main>
        <SiteFooter />
        <FloatingButtons />
      </div>
    </>
  );
}
