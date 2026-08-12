import { SeoHead } from '@/components/seo-head';
import { Contact } from '@/components/site/contact';
import { CtaBanner } from '@/components/site/cta-banner';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, BookOpen, Building2, GraduationCap, Users } from 'lucide-react';

interface CmsLevel {
  id: number;
  year: number;
  section: string;
  capacity: number;
}

interface CmsTeacher {
  id: number;
  name: string;
}

interface CmsDepartment {
  id: number;
  name: string;
  description?: string;
  head?: CmsTeacher;
  levels?: CmsLevel[];
  students_count?: number;
  subjects_count?: number;
}

interface Props {
  departments?: CmsDepartment[];
}

export default function PublicDepartmentsPage({ departments = [] }: Props) {
  const { t, locale } = useSite();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <>
      <SeoHead
        title={locale === 'ar' ? 'الأقسام الأكاديمية' : 'Academic Departments'}
        description={
          locale === 'ar'
            ? `استكشف التخصصات والأقسام الأكاديمية المتنوعة في ${t.brandFull}`
            : `Explore our academic departments and specialized study programs at ${t.brandFull}`
        }
      />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          {/* ─── Hero Banner ─── */}
          <div className="bg-hero text-hero-foreground border-hero-foreground/10 border-b pb-20 pt-[calc(4.25rem+3rem)] sm:pb-24 sm:pt-[calc(4.25rem+4rem)]">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
              <p className="text-hero-muted text-xs font-bold tracking-[0.2em] uppercase">
                {locale === 'ar' ? 'التخصصات الأكاديمية' : 'Academic majors'}
              </p>
              <h1 className="mt-4 font-serif text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
                {locale === 'ar' ? 'الأقسام والبرامج الدراسية' : 'Academic departments & programs'}
              </h1>
              <p className="text-hero-muted mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
                {locale === 'ar'
                  ? 'يقدم المعهد مجموعة متميزة من الأقسام العلمية والتطبيقية المُصمَّمة لإعداد كوادر مؤهلة لمواكبة متطلبات سوق العمل.'
                  : 'Specialized academic departments designed to empower students with theoretical knowledge and practical expertise.'}
              </p>
            </div>
          </div>

          {/* ─── Departments Grid ─── */}
          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="text-foreground font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                  {locale === 'ar' ? 'الأقسام الأكاديمية بالكلية' : 'Our Academic Departments'}
                </h2>
                <p className="text-muted-foreground mt-3 text-sm sm:text-base">
                  {locale === 'ar'
                    ? 'تعرّف على الأقسام المتاحة والمواد والتخصصات الأكاديمية'
                    : 'Discover specialized departments and academic levels available'}
                </p>
              </div>

              {departments.length === 0 ? (
                <div className="border-border bg-card rounded-3xl border border-dashed py-12 text-center">
                  <Building2 className="text-muted-foreground/50 mx-auto size-12" />
                  <p className="text-foreground mt-4 text-base font-semibold">
                    {locale === 'ar' ? 'لا توجد أقسام مضافة حالياً' : 'No departments listed yet'}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {locale === 'ar' ? 'سيتم إضافة الأقسام الأكاديمية قريباً.' : 'Academic departments will be published soon.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {departments.map((dept) => (
                    <div
                      key={dept.id}
                      className="group border-border/80 bg-card hover:border-primary/30 flex flex-col justify-between rounded-xl border p-6 transition-colors"
                    >
                      <div>
                        <div className="bg-primary/10 text-primary mb-5 flex size-12 items-center justify-center rounded-lg">
                          <Building2 className="size-6" />
                        </div>

                        <h3 className="text-foreground font-serif text-xl font-bold">{dept.name}</h3>

                        <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-relaxed">
                          {dept.description ||
                            (locale === 'ar'
                              ? 'قسم أكاديمي متكامل يوفر بيئة تعليمية حديثة معتمدة.'
                              : 'Full academic department providing modern accredited learning environment.')}
                        </p>
                      </div>

                      <div className="border-border/60 mt-8 border-t pt-6">
                        {dept.head && (
                          <div className="text-muted-foreground mb-4 flex items-center gap-2 text-xs">
                            <GraduationCap className="text-primary size-4 shrink-0" />
                            <span>
                              {locale === 'ar' ? 'رئيس القسم:' : 'Department Head:'} <strong className="text-foreground">{dept.head.name}</strong>
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-4 text-xs font-semibold">
                          <span className="bg-secondary text-secondary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1">
                            <Users className="text-primary size-3.5" />
                            {dept.students_count || 0} {locale === 'ar' ? 'طالب' : 'Students'}
                          </span>

                          <span className="bg-secondary text-secondary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1">
                            <BookOpen className="text-primary size-3.5" />
                            {dept.subjects_count || 0} {locale === 'ar' ? 'مادة' : 'Subjects'}
                          </span>
                        </div>

                        <Link
                          href="/contact"
                          className="border-border text-primary hover:border-primary/30 hover:bg-primary/5 mt-6 flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold transition-colors"
                        >
                          <span>{locale === 'ar' ? 'استفسر عن التكلفة والتسجيل' : 'Inquire & Apply'}</span>
                          <Arrow className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ─── Contact CTA at end ─── */}
          <Contact />
          <CtaBanner />
        </main>
        <SiteFooter />
        <FloatingButtons />
      </div>
    </>
  );
}
