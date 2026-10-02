import { SeoHead } from '@/components/seo-head';
import { CtaBanner } from '@/components/site/cta-banner';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { PageHero } from '@/components/site/page-hero';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite } from '@/context/site-context';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface TeacherDepartment {
  id: number;
  name: string;
}

interface PublicTeacher {
  id: number;
  name: string;
  specialization?: string;
  qualification?: string;
  departments?: TeacherDepartment[];
}

interface Props {
  teachers?: PublicTeacher[];
}

export default function PublicTeachersPage({ teachers = [] }: Props) {
  const { t, locale } = useSite();
  const { hide_instructor_names: hideInstructorNames } = useSiteSettings();
  const isAr = locale === 'ar';

  return (
    <>
      <SeoHead
        title={isAr ? 'أعضاء هيئة التدريس' : 'Faculty Members'}
        description={
          isAr
            ? `تعرّف على أعضاء هيئة التدريس وأخصصاتهم العلمية في ${t.brandFull}.`
            : `Meet the faculty members and their academic specializations at ${t.brandFull}.`
        }
      />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageHero
            title={isAr ? 'أعضاء هيئة التدريس' : 'Faculty members'}
            description={
              isAr
                ? 'نخبة من الأساتذة والخبراء الأكاديميين يقودون العملية التعليمية في الكلية.'
                : 'A distinguished group of professors and academic experts leading teaching at the college.'
            }
            crumbs={[{ label: isAr ? 'هيئة التدريس' : 'Faculty', href: '/teachers' }]}
          />

          {/* Faculty directory — a ledger, not a card grid. */}
          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
              <h2 className="font-display text-foreground max-w-2xl text-3xl leading-snug font-extrabold text-balance sm:text-4xl">
                {isAr ? 'أعضاء هيئة التدريس بالكلية' : 'Meet our faculty'}
              </h2>
              <p className="text-muted-foreground max-w-md text-sm leading-normal sm:text-base">
                {isAr
                  ? `${teachers.length} عضو هيئة تدريس يدرّس حاليًا في الكلية.`
                  : `${teachers.length} faculty members currently teaching at the college.`}
              </p>
            </div>

            {teachers.length === 0 ? (
              <div className="border-border bg-card mt-10 rounded-xl border border-dashed py-14 text-center shadow-sm">
                <p className="text-foreground text-base font-semibold">
                  {isAr ? 'لا يوجد أعضاء هيئة تدريس منشورون حاليًا.' : 'No faculty members to show right now.'}
                </p>
                <p className="text-muted-foreground mt-1.5 text-sm leading-normal">
                  {isAr ? 'سيتم نشر قائمة أعضاء هيئة التدريس قريباً.' : 'The faculty directory will be published soon.'}
                </p>
              </div>
            ) : (
              <ul className="border-border mt-10 border-t">
                {teachers.map((teacher, index) => {
                  const name = hideInstructorNames && !teacher.name
                    ? (isAr ? 'عضو هيئة التدريس' : 'Faculty member')
                    : teacher.name;

                  return (
                    <li
                      key={teacher.id}
                      className={cn('border-border border-b py-7 sm:py-8', index % 2 === 1 && 'sm:ps-14')}
                    >
                      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-5 gap-y-4 sm:gap-x-8 lg:grid-cols-[auto_minmax(0,2fr)_minmax(0,1fr)]">
                        <span className="font-display text-primary/20 pt-1 text-4xl leading-tight font-extrabold tabular-nums sm:text-5xl">
                          {String(index + 1).padStart(2, '0')}
                        </span>

                        <div className="min-w-0">
                          <h3 className="font-display text-foreground text-lg leading-snug font-bold sm:text-xl">{name}</h3>
                          <p className="text-accent mt-1 text-sm leading-normal font-semibold">
                            {teacher.specialization || (isAr ? 'عضو هيئة التدريس' : 'Faculty member')}
                          </p>
                          {teacher.qualification && (
                            <p className="text-muted-foreground mt-1.5 text-sm leading-normal">
                              {isAr ? 'المؤهل العلمي: ' : 'Qualification: '}
                              <span className="text-foreground font-medium">{teacher.qualification}</span>
                            </p>
                          )}
                        </div>

                        <div className="col-span-2 flex flex-wrap gap-2 lg:col-span-1 lg:justify-end">
                          {(teacher.departments ?? []).map((department) => (
                            <span
                              key={department.id}
                              className="bg-secondary text-secondary-foreground inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                            >
                              {department.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <CtaBanner />
        </main>
        <SiteFooter />
        <FloatingButtons />
      </div>
    </>
  );
}
