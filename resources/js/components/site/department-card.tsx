import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Users } from 'lucide-react';

export interface DepartmentCardData {
  id: number;
  name: string;
  desc: string;
  image: string;
  studentsCount?: number;
  subjectsCount?: number;
}

export function DepartmentCard({ card, index = 0 }: { card: DepartmentCardData; index?: number }) {
  const { t, locale, isRTL } = useSite();
  const ds = t.departmentsSection;
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const hasCounts = card.studentsCount !== undefined || card.subjectsCount !== undefined;

  return (
    <Card className="group m-0 w-full overflow-hidden rounded-lg border p-0 shadow-none transition-shadow hover:shadow-lg">
      <CardContent className="p-0">
        <div className="relative w-full overflow-hidden">
          <img
            src={card.image}
            alt={card.name}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={index === 0 ? 'high' : undefined}
            className="aspect-square w-full rounded-t-lg object-cover"
          />
          <div className="bg-card absolute inset-x-0 bottom-0 z-10 flex flex-col p-4 pb-2 transition-transform duration-300 ease-in-out group-focus-within:-translate-y-16 group-hover:-translate-y-16 motion-reduce:transition-none">
            <Badge variant="secondary" className="mb-4 self-start">
              {ds.label}
            </Badge>
            <h3 className="mb-2 line-clamp-2 min-h-[2lh] text-start text-lg leading-tight font-bold">{card.name}</h3>
            {hasCounts ? (
              <div className="text-muted-foreground mb-4 flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="size-4" aria-hidden="true" />
                  <span className="tabular-nums">{card.studentsCount ?? 0}</span>
                  <span className="sr-only">{locale === 'ar' ? 'طالب' : 'Students'}</span>
                </span>
                <span aria-hidden="true">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="tabular-nums">{card.subjectsCount ?? 0}</span>
                  <BookOpen className="size-4" aria-hidden="true" />
                  <span className="sr-only">{locale === 'ar' ? 'مادة' : 'Subjects'}</span>
                </span>
              </div>
            ) : (
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                <CalendarDays className="size-4" aria-hidden="true" />
                {locale === 'ar' ? 'قسم أكاديمي' : 'Academic department'}
              </div>
            )}
            <p className="text-muted-foreground line-clamp-2 min-h-[2lh] text-sm">{card.desc}</p>
          </div>
          {/* Hidden at rest, revealed in the strip the panel slides away from —
              takes no layout space so sparse cards don't get a blank band. */}
          <Link
            href="/departments"
            className="bg-card text-accent hover:text-primary pointer-events-none absolute inset-x-0 bottom-0 flex h-[calc(4rem+2px)] items-center justify-start px-4 text-sm font-bold group-focus-within:pointer-events-auto group-hover:pointer-events-auto"
          >
            <span className="flex items-center gap-2 opacity-0 transition-opacity duration-300 ease-in-out group-focus-within:opacity-100 group-hover:opacity-100 motion-reduce:transition-none">
              {ds.viewPrograms}
              <Arrow className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
