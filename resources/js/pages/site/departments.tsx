import { SeoHead } from '@/components/seo-head';
import { Contact } from '@/components/site/contact';
import { CtaBanner } from '@/components/site/cta-banner';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { PageHero } from '@/components/site/page-hero';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite } from '@/context/site-context';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CmsLevel {
  id: number;
  year: number;
  section: string;
  capacity: number;
}

interface CmsTeacher {
  id: number;
  name?: string;
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
  const { hide_instructor_names: hideInstructorNames } = useSiteSettings();
  const isAr = locale === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <>
      <SeoHead
        title={isAr ? 'الأقسام الأكاديمية' : 'Academic Departments'}
        description={
          isAr
            ? `استكشف التخصصات والأقسام الأكاديمية المتنوعة في ${t.brandFull}`
            : `Explore our academic departments and specialized study programs at ${t.brandFull}`
        }
      />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageHero
            title={isAr ? 'الأقسام والبرامج الدراسية' : 'Academic departments & programs'}
            description={
              isAr
                ? 'يقدم المعهد مجموعة متميزة من الأقسام العلمية والتطبيقية المُصمَّمة لإعداد كوادر مؤهلة لمواكبة متطلبات سوق العمل.'
                : 'Specialized academic departments designed to empower students with theoretical knowledge and practical expertise.'
            }
            crumbs={[{ label: isAr ? 'الأقسام' : 'Departments', href: '/departments' }]}
          />

          {/* Academic register — full-width rows, not boxed cards. */}
          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
              <h2 className="font-display text-primary max-w-2xl text-3xl leading-snug font-extrabold text-balance sm:text-4xl">
                {isAr ? 'الأقسام الأكاديمية بالكلية' : 'Our academic departments'}
              </h2>
              <p className="text-muted-foreground max-w-md text-sm leading-normal sm:text-base">
                {isAr
                  ? `${departments.length} قسم أكاديمي — تعرّف على المواد والمستويات المتاحة.`
                  : `${departments.length} academic departments — explore available subjects and levels.`}
              </p>
            </div>

            {departments.length === 0 ? (
              <div className="border-border bg-card mt-10 rounded-xl border border-dashed py-14 text-center shadow-sm">
                <p className="text-foreground text-base font-semibold">
                  {isAr ? 'لا توجد أقسام مضافة حالياً' : 'No departments listed yet'}
                </p>
                <p className="text-muted-foreground mt-1.5 text-sm leading-normal">
                  {isAr ? 'سيتم إضافة الأقسام الأكاديمية قريباً.' : 'Academic departments will be published soon.'}
                </p>
              </div>
            ) : (
              <ul className="border-border mt-10 border-t">
                {departments.map((dept, index) => {
                  const hasLevels = (dept.levels?.length ?? 0) > 0;

                  return (
                    <li
                      key={dept.id}
                      className="border-border border-b py-8 sm:py-10"
                    >
                      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-5 gap-y-5 sm:gap-x-8 lg:grid-cols-[auto_minmax(0,2fr)_minmax(0,1fr)] lg:gap-x-12">
                        <span className="font-display text-primary/20 pt-1 text-4xl leading-tight font-extrabold tabular-nums sm:text-5xl">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <div className="min-w-0">
                          <h3 className="font-display text-foreground text-xl leading-snug font-extrabold sm:text-2xl">{dept.name}</h3>
                          <p className="text-muted-foreground mt-2.5 max-w-xl text-sm leading-normal sm:text-base">
                            {dept.description ||
                              (isAr
                                ? 'قسم أكاديمي متكامل يوفر بيئة تعليمية حديثة معتمدة.'
                                : 'Full academic department providing modern accredited learning environment.')}
                          </p>

                          {hasLevels && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {dept.levels!.map((level) => (
                                <span
                                  key={level.id}
                                  className="bg-secondary text-secondary-foreground inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                                >
                                  {isAr ? `السنة ${level.year} — شعبة ${level.section}` : `Year ${level.year} — Section ${level.section}`}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="col-span-2 flex flex-col items-start gap-4 border-border/60 lg:col-span-1 lg:items-end lg:border-s lg:ps-10">
                          {dept.head && (
                            <p className="text-muted-foreground flex items-center gap-2 text-xs leading-normal">
                              <span>{isAr ? 'رئيس القسم:' : 'Department head:'}</span>
                              <span className="text-foreground font-semibold">
                                {dept.head.name ||
                                  (hideInstructorNames
                                    ? (isAr ? 'عضو هيئة التدريس' : 'Faculty member')
                                    : '')}
                              </span>
                            </p>
                          )}

                          <div className="text-muted-foreground flex items-center gap-4 text-xs font-semibold">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="tabular-nums">{dept.students_count || 0}</span>
                              {isAr ? 'طالب' : 'Students'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="inline-flex items-center gap-1.5">
                              <span className="tabular-nums">{dept.subjects_count || 0}</span>
                              {isAr ? 'مادة' : 'Subjects'}
                            </span>
                          </div>

                          <Link
                            href="/contact"
                            className="text-accent hover:text-primary inline-flex items-center gap-1.5 text-sm font-bold transition-colors"
                          >
                            {isAr ? 'استفسر عن التكلفة والتسجيل' : 'Inquire & apply'}
                            <Arrow className="size-4 shrink-0" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <Contact />
          <CtaBanner />
        </main>
        <SiteFooter />
        <FloatingButtons />
      </div>
    </>
  );
}
