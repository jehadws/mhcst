import { DepartmentCard, type DepartmentCardData } from '@/components/site/department-card';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface Department {
  id: number;
  name: string;
  description?: string;
  image?: string | null;
  students_count?: number;
  subjects_count?: number;
}

interface Props {
  departments?: Department[];
}

const IMAGE_POOL = [
  '/images/college-medicine.webp',
  '/images/college-nursing.webp',
  '/images/college-health.webp',
  '/images/research.webp',
  '/images/news-forum.webp',
];

const FALLBACK_DEPARTMENTS = [
  {
    id: 1,
    name: { en: 'Computer Science', ar: 'علوم الحاسوب' },
    desc: {
      en: 'Bachelor programs in software engineering, networks, and information systems.',
      ar: 'برامج بكالوريوس في هندسة البرمجيات والشبكات ونظم المعلومات.',
    },
  },
  {
    id: 2,
    name: { en: 'Business Administration', ar: 'إدارة الأعمال' },
    desc: {
      en: 'Programs in management, accounting, and entrepreneurship.',
      ar: 'برامج في الإدارة والمحاسبة وريادة الأعمال.',
    },
  },
  {
    id: 3,
    name: { en: 'Engineering', ar: 'الهندسة' },
    desc: {
      en: 'Applied engineering programs with practical lab training.',
      ar: 'برامج هندسية تطبيقية مع تدريب عملي في المعامل.',
    },
  },
];

export function DepartmentsShowcase({ departments = [] }: Props) {
  const { t, locale, tr, isRTL } = useSite();
  const ds = t.departmentsSection;
  const [api, setApi] = useState<CarouselApi>();
  const PrevIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  const cards: DepartmentCardData[] =
    departments.length > 0
      ? departments.map((dept, index) => ({
          id: dept.id,
          name: dept.name,
          desc:
            dept.description ||
            (locale === 'ar'
              ? 'برنامج أكاديمي متكامل يوفر بيئة تعليمية حديثة معتمدة.'
              : 'A comprehensive academic program in a modern accredited learning environment.'),
          image: dept.image ? (dept.image.startsWith('http') ? dept.image : `/storage/${dept.image}`) : IMAGE_POOL[index % IMAGE_POOL.length],
          studentsCount: dept.students_count,
          subjectsCount: dept.subjects_count,
        }))
      : FALLBACK_DEPARTMENTS.map((d, index) => ({
          id: d.id,
          name: tr(d.name),
          desc: tr(d.desc),
          image: IMAGE_POOL[index % IMAGE_POOL.length],
          studentsCount: undefined,
          subjectsCount: undefined,
        }));

  return (
    <section id="programs" aria-labelledby="departments-heading" className="bg-muted overflow-x-clip py-10 sm:py-14 lg:py-[70px]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-x-8 gap-y-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2
            id="departments-heading"
            className={cn('font-display text-primary text-3xl leading-snug font-extrabold sm:text-4xl', locale === 'ar' ? '' : 'tracking-tight')}
          >
            {ds.title}
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">{ds.description}</p>
        </div>
        <Link
          href="/departments"
          className="bg-accent text-accent-foreground inline-flex shrink-0 items-center gap-1.5 rounded-lg px-6 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 hover:brightness-110 sm:py-3"
        >
          {ds.viewPrograms}
        </Link>
      </div>

      <div className="mt-8 select-none sm:mt-12">
        <Carousel opts={{ direction: isRTL ? 'rtl' : 'ltr', align: 'start', dragFree: true }} setApi={setApi} aria-label={ds.title} className="">
          <CarouselContent className="ps-4 sm:ps-6 lg:ps-[max(2rem,calc((100%_-_80rem)/2_+_2rem))]">
            {cards.map((card, index) => (
              <CarouselItem
                key={card.id}
                className={cn(
                  'basis-[85%] pb-2 sm:basis-[47%] lg:basis-[29%]',
                  index === cards.length - 1 && 'me-4 sm:me-6 lg:me-[max(2rem,calc((100%_-_80rem)/2_+_2rem))]',
                )}
              >
                <DepartmentCard card={card} index={index} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="mx-auto mt-6 flex max-w-7xl items-center justify-end gap-1 px-4 sm:px-6 lg:px-8">
        <Button variant="outline" size="icon" onClick={() => api?.scrollPrev()} aria-label="Previous">
          <PrevIcon className="size-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => api?.scrollNext()} aria-label="Next">
          <NextIcon className="size-5" />
        </Button>
      </div>
    </section>
  );
}
