import { SectionHeader } from '@/components/site/section-header';
import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Building2 } from 'lucide-react';

interface Department {
  id: number;
  name: string;
  description?: string;
  students_count?: number;
  subjects_count?: number;
}

interface Props {
  departments?: Department[];
}

export function DepartmentsShowcase({ departments = [] }: Props) {
  const { t, locale } = useSite();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;
  const ds = t.departmentsSection;

  return (
    <section id="departments" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader label={ds.label} title={ds.title} description={ds.description} align="start" className="max-w-3xl" />

        {departments.length === 0 ? (
          <div className="border-border mt-14 rounded-2xl border border-dashed bg-secondary/50 px-6 py-16 text-center">
            <Building2 className="text-muted-foreground/40 mx-auto size-12" />
            <p className="text-foreground mt-4 font-serif text-lg font-bold">{ds.emptyTitle}</p>
            <p className="text-muted-foreground mt-2 text-sm">{ds.emptyBody}</p>
          </div>
        ) : (
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {departments.map((dept) => (
              <article
                key={dept.id}
                className="group border-border bg-card hover:border-primary/40 flex flex-col justify-between border p-8 transition-colors sm:p-10"
              >
                <div>
                  <p className="text-primary text-xs font-bold tracking-[0.2em] uppercase">{ds.label}</p>
                  <h3 className="text-foreground mt-4 font-serif text-2xl font-bold leading-snug">{dept.name}</h3>
                  <p className="text-muted-foreground mt-4 text-sm leading-7">
                    {dept.description ||
                      (locale === 'ar'
                        ? 'برنامج أكاديمي متكامل يوفر بيئة تعليمية حديثة معتمدة.'
                        : 'A comprehensive academic program in a modern accredited learning environment.')}
                  </p>
                </div>

                <Link
                  href="/departments"
                  className="text-primary group-hover:text-hero-accent mt-8 inline-flex items-center gap-2 text-sm font-bold transition-colors"
                >
                  {ds.viewPrograms}
                  <Arrow className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
