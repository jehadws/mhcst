import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Department {
  id: number;
  name: string;
  description?: string;
}

interface Props {
  departments?: Department[];
}

const FALLBACK_DEPARTMENTS = [
  {
    id: 1,
    name: { en: 'Computer Science', ar: 'علوم الحاسوب' },
    desc: {
      en: 'Bachelor programs in software engineering, networks, and information systems.',
      ar: 'برامج بكالوريوس في هندسة البرمجيات والشبكات ونظم المعلومات.',
    },
    image: '/images/college-medicine.png',
    links: [{ en: 'Software Engineering', ar: 'هندسة البرمجيات' }],
  },
  {
    id: 2,
    name: { en: 'Business Administration', ar: 'إدارة الأعمال' },
    desc: {
      en: 'Programs in management, accounting, and entrepreneurship.',
      ar: 'برامج في الإدارة والمحاسبة وريادة الأعمال.',
    },
    image: '/images/college-nursing.png',
    links: [{ en: 'Management', ar: 'الإدارة' }],
  },
  {
    id: 3,
    name: { en: 'Engineering', ar: 'الهندسة' },
    desc: {
      en: 'Applied engineering programs with practical lab training.',
      ar: 'برامج هندسية تطبيقية مع تدريب عملي في المعامل.',
    },
    image: '/images/college-health.png',
    links: [{ en: 'Civil Engineering', ar: 'الهندسة المدنية' }],
  },
];

export function DepartmentsShowcase({ departments = [] }: Props) {
  const { t, locale, tr, isRTL } = useSite();
  const ds = t.departmentsSection;
  const cardLabel = locale === 'ar' ? 'قسم' : 'Department';
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const cards =
    departments.length > 0
      ? departments.slice(0, 3).map((dept, idx) => ({
          id: dept.id,
          name: dept.name,
          desc:
            dept.description ||
            (locale === 'ar'
              ? 'برنامج أكاديمي متكامل يوفر بيئة تعليمية حديثة معتمدة.'
              : 'A comprehensive academic program in a modern accredited learning environment.'),
          image: FALLBACK_DEPARTMENTS[idx % 3].image,
          links: [dept.name],
        }))
      : FALLBACK_DEPARTMENTS.map((d) => ({
          id: d.id,
          name: tr(d.name),
          desc: tr(d.desc),
          image: d.image,
          links: d.links.map((l) => tr(l)),
        }));

  return (
    <section id="programs" className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-primary text-3xl font-extrabold sm:text-4xl">{ds.title}</h2>
        <p className="text-muted-foreground mt-4 text-pretty leading-relaxed">{ds.description}</p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {cards.map((c) => (
          <article
            key={c.id}
            className="group border-border shadow-primary/5 relative flex min-h-80 flex-col justify-end overflow-hidden rounded-2xl border shadow-lg"
          >
            <img
              src={c.image}
              alt={typeof c.name === 'string' ? c.name : ''}
              className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="from-hero via-hero/70 to-hero/10 absolute inset-0 bg-gradient-to-t" />
            <div className="text-hero-foreground relative p-6 text-start">
              <span className="text-accent text-xs font-bold">{cardLabel}</span>
              <h3 className="mt-1 text-xl font-extrabold">{c.name}</h3>
              <p className="text-hero-foreground/80 mt-2 text-sm">{c.desc}</p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {c.links.map((l) => (
                  <Link
                    key={l}
                    href="/departments"
                    className="text-accent hover:text-hero-foreground inline-flex items-center gap-1 text-sm font-bold transition-colors"
                  >
                    {l}
                    <Arrow className="size-4" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
