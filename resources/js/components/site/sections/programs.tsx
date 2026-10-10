import { Reveal } from '@/components/site/primitives/reveal';
import { SectionHead } from '@/components/site/primitives/section-head';
import { TextLink } from '@/components/site/primitives/text-link';
import { useSite } from '@/context/site-context';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

export interface Department {
    id: number;
    name: string;
    description?: string;
    image?: string | null;
    students_count?: number;
    subjects_count?: number;
}

const GLYPHS = ['⌁', '△', '＋', '◈'];

const pad = (n: number) => String(n).padStart(2, '0');

interface ProgramsProps {
    departments?: Department[];
}

export function Programs({ departments = [] }: ProgramsProps) {
    const { t, locale } = useSite();
    const ds = t.departmentsSection;

    return (
        <section aria-labelledby="programs-heading" className="bg-paper py-[80px] site-md:py-[120px]">
            <div className="site-container">
                <Reveal>
                    <SectionHead index="02" label={ds.label} title={<span id="programs-heading">{ds.title}</span>} lead={ds.description} />
                </Reveal>

                {departments.length === 0 ? (
                    <div className="border-line border p-[40px] text-center">
                        <h3 className="m-0 text-[17px] font-semibold text-ink">{ds.emptyTitle}</h3>
                        <p className="mt-2 text-[13px] text-ink-muted">{ds.emptyBody}</p>
                    </div>
                ) : (
                    <div className="grid gap-[24px] site-md:grid-cols-2 site-lg:grid-cols-3">
                        {departments.map((dept, index) => {
                            const featured = index === 0;
                            const image = dept.image ? (dept.image.startsWith('http') ? dept.image : `/storage/${dept.image}`) : null;

                            return (
                                <Reveal key={dept.id} delay={index === 1 ? 'delay' : index === 2 ? 'delay-2' : 'none'}>
                                    <article
                                        className={cn(
                                            'group flex h-full min-h-[390px] flex-col border p-[27px] pb-[22px] transition-[transform,box-shadow] duration-350 ease-[cubic-bezier(.22,1,.36,1)] motion-safe:hover:-translate-y-[8px] motion-safe:hover:shadow-program-hover',
                                            featured
                                                ? 'border-ink bg-ink text-white'
                                                : 'border-line bg-white text-ink hover:border-ink/30',
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span dir="ltr" className={cn('font-site-latin text-[11px] font-bold tracking-[0.1em]', featured ? 'text-white/55' : 'text-ink-muted')}>
                                                {pad(index + 1)} / {pad(departments.length)}
                                            </span>
                                            <span aria-hidden="true" className={cn('text-[20px]', featured ? 'text-coral' : 'text-teal')}>
                                                {GLYPHS[index % GLYPHS.length]}
                                            </span>
                                        </div>

                                        {image ? (
                                            <img
                                                src={image}
                                                alt={dept.name}
                                                loading={index === 0 ? 'eager' : 'lazy'}
                                                decoding="async"
                                                className="mt-6 h-[150px] w-full rounded-ss-[26px] object-cover"
                                            />
                                        ) : null}

                                        <h3 className={cn('mt-16 text-[26px] leading-[1.4] font-semibold tracking-[-0.04em]', image && 'mt-6')}>
                                            {dept.name}
                                        </h3>
                                        <p className={cn('mt-3 text-[13px] leading-[2]', featured ? 'text-white/65' : 'text-ink-muted')}>
                                            {dept.description || (locale === 'ar' ? 'برنامج أكاديمي متكامل في بيئة تعليمية حديثة معتمدة.' : 'A comprehensive academic program in a modern accredited environment.')}
                                        </p>

                                        <div className={cn('mt-auto border-t pt-4', featured ? 'border-white/15' : 'border-line')}>
                                            <div className="flex items-center justify-between">
                                                <span className={cn('text-[10px]', featured ? 'text-white/55' : 'text-ink-muted')}>
                                                    {typeof dept.students_count === 'number'
                                                        ? `${dept.students_count} ${locale === 'ar' ? 'طالب' : 'students'} · ${dept.subjects_count ?? 0} ${locale === 'ar' ? 'مادة' : 'subjects'}`
                                                        : locale === 'ar'
                                                          ? 'قسم أكاديمي'
                                                          : 'Academic department'}
                                                </span>
                                                <Link
                                                    href="/departments"
                                                    aria-label={`${ds.viewPrograms} — ${dept.name}`}
                                                    className="bg-coral flex size-[28px] items-center justify-center rounded-full text-[13px] text-white transition-colors hover:bg-coral-hover"
                                                >
                                                    ↗
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                </Reveal>
                            );
                        })}
                    </div>
                )}

                <div className="mt-[46px] text-center">
                    <TextLink href="/departments">{ds.viewPrograms}</TextLink>
                </div>
            </div>
        </section>
    );
}
