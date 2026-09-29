import { SeoHead } from '@/components/seo-head';
import { CtaBanner } from '@/components/site/cta-banner';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { PageHero } from '@/components/site/page-hero';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { Testimonials } from '@/components/site/testimonials';
import { useSite } from '@/context/site-context';
import { aboutIcon } from '@/lib/about-icons';
import type { AboutItemContent, AboutMilestoneContent, AboutPageContent } from '@/types';

interface Props {
  testimonials?: Array<Record<string, unknown>>;
  aboutContent?: AboutPageContent | null;
}

export default function PublicAboutPage({ testimonials, aboutContent }: Props) {
  const { t, locale } = useSite();
  const isAr = locale === 'ar';

  const fallbackPillars: AboutItemContent[] = [
    {
      icon: 'target',
      title: isAr ? 'رسالتنا' : 'Our Mission',
      title_ar: isAr ? 'رسالتنا' : 'Our Mission',
      body: isAr
        ? 'تقديم برامج تدريبية احترافية معتمدة تُمكّن الأفراد والمؤسسات من تطوير مهاراتهم والارتقاء بأدائهم المهني.'
        : 'Deliver accredited professional training that empowers individuals and organisations to develop skills and elevate performance.',
      body_ar: isAr
        ? 'تقديم برامج تدريبية احترافية معتمدة تُمكّن الأفراد والمؤسسات من تطوير مهاراتهم والارتقاء بأدائهم المهني.'
        : 'Deliver accredited professional training that empowers individuals and organisations to develop skills and elevate performance.',
    },
    {
      icon: 'eye',
      title: isAr ? 'رؤيتنا' : 'Our Vision',
      title_ar: isAr ? 'رؤيتنا' : 'Our Vision',
      body: isAr
        ? 'أن نكون المرجع الأول في التدريب المهني المعتمد في ليبيا والمنطقة.'
        : 'To be the premier reference for accredited professional training in Libya and the region.',
      body_ar: isAr
        ? 'أن نكون المرجع الأول في التدريب المهني المعتمد في ليبيا والمنطقة.'
        : 'To be the premier reference for accredited professional training in Libya and the region.',
    },
    {
      icon: 'lightbulb',
      title: isAr ? 'رسالة الإدارة' : 'Leadership Message',
      title_ar: isAr ? 'رسالة الإدارة' : 'Leadership Message',
      body: isAr
        ? 'نحمل حلماً بأن يجد كل متعلم تدريباً احترافياً يثق به ويحصل من خلاله على شهادة تُغيّر مساره المهني.'
        : 'We believe every learner deserves training they can trust — and a certificate that changes their career path.',
      body_ar: isAr
        ? 'نحمل حلماً بأن يجد كل متعلم تدريباً احترافياً يثق به ويحصل من خلاله على شهادة تُغيّر مساره المهني.'
        : 'We believe every learner deserves training they can trust — and a certificate that changes their career path.',
    },
  ];

  const fallbackValues: AboutItemContent[] = [
    {
      icon: 'shield-check',
      title: isAr ? 'الاعتماد والجودة' : 'Accreditation & Quality',
      title_ar: isAr ? 'الاعتماد والجودة' : 'Accreditation & Quality',
      body: isAr ? 'شهادات معتمدة ومعترف بها إقليمياً ودولياً' : 'Regionally and internationally recognized certificates',
      body_ar: isAr ? 'شهادات معتمدة ومعترف بها إقليمياً ودولياً' : 'Regionally and internationally recognized certificates',
    },
    {
      icon: 'users',
      title: isAr ? 'مدربون من الخبراء' : 'Expert Instructors',
      title_ar: isAr ? 'مدربون من الخبراء' : 'Expert Instructors',
      body: isAr ? 'نخبة من الممارسين الحقيقيين في مجالاتهم' : 'Practitioners with real-world expertise',
      body_ar: isAr ? 'نخبة من الممارسين الحقيقيين في مجالاتهم' : 'Practitioners with real-world expertise',
    },
    {
      icon: 'graduation-cap',
      title: isAr ? 'مرونة التعلم' : 'Flexible Learning',
      title_ar: isAr ? 'مرونة التعلم' : 'Flexible Learning',
      body: isAr ? 'حضوري وعبر الإنترنت ومدمج' : 'Onsite, online, and blended options',
      body_ar: isAr ? 'حضوري وعبر الإنترنت ومدمج' : 'Onsite, online, and blended options',
    },
    {
      icon: 'award',
      title: isAr ? 'التطبيق العملي' : 'Practical Application',
      title_ar: isAr ? 'التطبيق العملي' : 'Practical Application',
      body: isAr ? 'مشاريع حقيقية لمعرض أعمالك' : 'Real projects for your portfolio',
      body_ar: isAr ? 'مشاريع حقيقية لمعرض أعمالك' : 'Real projects for your portfolio',
    },
  ];

  const fallbackMilestones: AboutMilestoneContent[] = [
    { year: '2010', label: isAr ? 'التأسيس' : 'Founded', label_ar: isAr ? 'التأسيس' : 'Founded' },
    { year: '2016', label: isAr ? 'أول اعتماد' : 'First Accreditation', label_ar: isAr ? 'أول اعتماد' : 'First Accreditation' },
    { year: '2019', label: isAr ? '5000+ خريج' : '5,000+ Graduates', label_ar: isAr ? '5000+ خريج' : '5,000+ Graduates' },
    { year: '2023', label: isAr ? 'توسّع رقمي' : 'Digital Expansion', label_ar: isAr ? 'توسّع رقمي' : 'Digital Expansion' },
    { year: '2025', label: isAr ? '20,000+ متدرب' : '20,000+ Learners', label_ar: isAr ? '20,000+ متدرب' : '20,000+ Learners' },
  ];

  const pillars = aboutContent?.pillars?.length ? aboutContent.pillars : fallbackPillars;
  const values = aboutContent?.values?.length ? aboutContent.values : fallbackValues;
  const milestones = aboutContent?.milestones?.length ? aboutContent.milestones : fallbackMilestones;

  const hero = aboutContent?.hero;
  const heroTitle = hero ? (isAr ? hero.title_ar : hero.title) : isAr ? 'قصتنا ورحلتنا' : 'Our story & journey';
  const heroDescription = hero
    ? isAr
      ? hero.description_ar || hero.description || ''
      : hero.description || ''
    : isAr
      ? 'أكثر من عقد من الخبرة في بناء مهارات المهنيين عبر برامج تدريبية معتمدة.'
      : 'Over a decade of experience building professional skills through accredited training.';

  const campusImage = (() => {
    const image = hero?.image || '/banner.webp';

    if (image.startsWith('http') || image.startsWith('/')) {
      return image;
    }

    return `/storage/${image}`;
  })();


  return (
    <>
      <SeoHead
        title={isAr ? 'من نحن' : 'About Us'}
        description={isAr ? (pillars[0]?.body_ar || heroDescription) : (pillars[0]?.body || heroDescription)}
      />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageHero title={heroTitle} description={heroDescription} crumbs={[{ label: t.nav.about, href: '/about' }]} />

          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid gap-6 lg:grid-cols-3">
                {pillars.map((pillar) => {
                  const Icon = aboutIcon(pillar.icon);
                  const title = isAr ? pillar.title_ar : pillar.title;
                  const body = isAr ? pillar.body_ar : pillar.body;

                  return (
                    <article key={title} className="border-border bg-card border p-8">
                      <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <h2 className="text-foreground mt-6 font-serif text-xl font-bold">{title}</h2>
                      <p className="text-muted-foreground mt-3 text-sm leading-7">{body}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="bg-secondary py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-12 lg:grid-cols-2">
                <div className="border-border bg-card overflow-hidden border shadow-lg">
                  <img src={campusImage} alt={t.campus.title} className="aspect-[4/3] w-full object-cover" />
                </div>

                <div>
                  <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">{isAr ? 'قيمنا' : 'Our values'}</p>
                  <h2 className="text-foreground mt-3 font-serif text-3xl font-bold">{t.about.title}</h2>
                  <p className="text-muted-foreground mt-4 leading-relaxed">{t.about.body}</p>

                  <div className="divide-border border-border bg-card mt-8 divide-y border">
                    {values.map((value) => {
                      const Icon = aboutIcon(value.icon);
                      const title = isAr ? value.title_ar : value.title;
                      const body = isAr ? value.body_ar : value.body;

                      return (
                        <div key={title} className="flex items-start gap-4 p-5">
                          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full">
                            <Icon className="size-5" aria-hidden="true" />
                          </div>
                          <div>
                            <h3 className="font-serif text-base font-bold">{title}</h3>
                            <p className="text-muted-foreground mt-1 text-sm">{body}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-foreground text-center font-serif text-3xl font-bold">{isAr ? 'محطات مسيرتنا' : 'Our milestones'}</h2>
              <div className="mt-12 grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
                {milestones.map((milestone) => (
                  <div key={milestone.year} className="border-border bg-card border p-6 text-center">
                    <p className="text-primary font-serif text-2xl font-extrabold">{milestone.year}</p>
                    <p className="text-muted-foreground mt-2 text-sm">{isAr ? milestone.label_ar : milestone.label}</p>
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
