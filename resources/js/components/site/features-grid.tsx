import { SectionHeader } from '@/components/site/section-header';
import { useSite } from '@/context/site-context';
import { Award, BookOpenCheck, Clock, Headphones, ShieldCheck, Users } from 'lucide-react';

export function FeaturesGrid() {
  const { locale } = useSite();

  const features = [
    {
      icon: ShieldCheck,
      title: locale === 'ar' ? 'اعتماد رسمي ومعترف به' : 'Officially Accredited',
      description:
        locale === 'ar'
          ? 'شهادات معتمدة محلياً ودولياً تمنحك ميزة تنافسية في سوق العمل.'
          : 'Certificates recognized by employers and professional bodies across the region.',
    },
    {
      icon: Users,
      title: locale === 'ar' ? 'مدربون من ذوي الخبرة' : 'Industry Expert Instructors',
      description:
        locale === 'ar'
          ? 'تعلّم مباشرة من خبراء يمارسون المهنة ويمتلكون سنوات طويلة من الخبرة.'
          : 'Learn directly from seasoned practitioners with years of real-world experience.',
    },
    {
      icon: BookOpenCheck,
      title: locale === 'ar' ? 'تطبيق عملي ومشاريع' : 'Hands-on Practical Projects',
      description:
        locale === 'ar'
          ? 'تركيز على التطبيق العملي وإنجاز مشاريع تضاف إلى معرض أعمالك.'
          : 'Focus on real-world practical projects to build a solid portfolio.',
    },
    {
      icon: Clock,
      title: locale === 'ar' ? 'مرونة في المواعيد' : 'Flexible Learning Options',
      description:
        locale === 'ar'
          ? 'خيارات متنوعة للتعلم حضورياً أو عبر الإنترنت حسب وقتك وجدولك.'
          : 'Choose online, onsite, or hybrid classes that match your availability.',
    },
    {
      icon: Award,
      title: locale === 'ar' ? 'محتوى متجدد باستمرار' : 'Up-to-Date Curriculum',
      description:
        locale === 'ar'
          ? 'مناهج يتم تحديثها دورياً لتواكب أحدث التطورات والتكنولوجيا.'
          : 'Curriculum updated continuously to match the latest industry trends.',
    },
    {
      icon: Headphones,
      title: locale === 'ar' ? 'دعم ومتابعة مستمرة' : 'Dedicated Learning Support',
      description:
        locale === 'ar'
          ? 'فريق مستشارين لمساعدتك طوال فترة الدراسة وحتى الحصول على الشهادة.'
          : 'Advisors and mentors available to guide you from start to graduation.',
    },
  ];

  return (
    <section className="bg-secondary py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          label={locale === 'ar' ? 'لماذا المعايير الحديثة؟' : 'Why Modern Standards'}
          title={locale === 'ar' ? 'كل ما تحتاجه للنجاح المهني' : 'Everything you need for career success'}
        />

        <div className="border-border bg-border mt-14 grid gap-px overflow-hidden border sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item, idx) => (
            <div key={idx} className="group bg-card hover:bg-primary p-7 transition-colors sm:p-8">
              <div className="bg-primary/10 text-primary group-hover:bg-hero-accent group-hover:text-hero-accent-foreground flex size-11 items-center justify-center rounded-full transition-colors">
                <item.icon className="size-5" />
              </div>

              <h3 className="text-card-foreground group-hover:text-primary-foreground mt-6 font-serif text-xl font-bold">{item.title}</h3>

              <p className="text-muted-foreground group-hover:text-primary-foreground/70 mt-3 text-sm leading-7">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
