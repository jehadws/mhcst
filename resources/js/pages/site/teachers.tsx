import { SeoHead } from '@/components/seo-head';
import { Contact } from '@/components/site/contact';
import { CtaBanner } from '@/components/site/cta-banner';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite } from '@/context/site-context';
import { GraduationCap, School } from 'lucide-react';

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
          {/* ─── Hero Banner ─── */}
          <div className="bg-hero text-hero-foreground border-hero-foreground/10 border-b pb-20 pt-[calc(4.25rem+3rem)] sm:pb-24 sm:pt-[calc(4.25rem+4rem)]">
            <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
              <p className="text-hero-muted text-xs font-bold tracking-[0.2em] uppercase">
                {isAr ? 'هيئة التدريس' : 'Our faculty'}
              </p>
              <h1 className="mt-4 font-serif text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
                {isAr ? 'أعضاء هيئة التدريس' : 'Faculty members'}
              </h1>
              <p className="text-hero-muted mx-auto mt-4 max-w-2xl text-base leading-relaxed sm:text-lg">
                {isAr
                  ? 'نخبة من الأساتذة والخبراء الأكاديميين يقودون العملية التعليمية في الكلية.'
                  : 'A distinguished group of professors and academic experts leading teaching at the college.'}
              </p>
            </div>
          </div>

          {/* ─── Teachers Grid ─── */}
          <section className="py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="text-foreground font-serif text-3xl font-bold tracking-tight sm:text-4xl">
                  {isAr ? 'أعضاء هيئة التدريس بالكلية' : 'Meet our faculty'}
                </h2>
                <p className="text-muted-foreground mt-3 text-sm sm:text-base">
                  {isAr
                    ? `${teachers.length} عضو هيئة تدريس يدرّس حاليًا`
                    : `${teachers.length} currently teaching faculty members`}
                </p>
              </div>

              {teachers.length === 0 ? (
                <p className="text-muted-foreground py-16 text-center text-sm">
                  {isAr ? 'لا يوجد أعضاء هيئة تدريس منشورون حاليًا.' : 'No faculty members to show right now.'}
                </p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="group border-border/80 bg-card hover:border-primary/30 flex flex-col justify-between rounded-xl border p-6 transition-colors"
                    >
                      <div>
                        <div className="bg-primary/10 text-primary mb-5 flex size-12 items-center justify-center rounded-lg">
                          <GraduationCap className="size-6" />
                        </div>

                        <h3 className="text-foreground font-serif text-xl font-bold">{teacher.name}</h3>

                        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                          {teacher.specialization || (isAr ? 'عضو هيئة التدريس' : 'Faculty member')}
                        </p>

                        {teacher.qualification && (
                          <p className="text-muted-foreground mt-1.5 text-xs font-semibold">
                            {isAr ? 'المؤهل العلمي: ' : 'Qualification: '}
                            <span className="text-foreground">{teacher.qualification}</span>
                          </p>
                        )}
                      </div>

                      <div className="border-border/60 mt-8 border-t pt-6">
                        <div className="flex flex-wrap gap-2">
                          {(teacher.departments ?? []).map((department) => (
                            <span
                              key={department.id}
                              className="bg-secondary text-secondary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                            >
                              <School className="text-primary size-3.5" />
                              {department.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <CtaBanner />
          <Contact />
        </main>
        <SiteFooter />
      </div>
      <FloatingButtons />
    </>
  );
}