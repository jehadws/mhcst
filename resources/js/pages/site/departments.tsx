import { SeoHead } from '@/components/seo-head';
import { CircleArrow } from '@/components/site/primitives/circle-arrow';
import { InnerHero } from '@/components/site/primitives/inner-hero';
import { CheckList, InnerSection, NumberedRows } from '@/components/site/primitives/inner-section';
import { CtaBand } from '@/components/site/sections/cta-band';
import { SiteLayout } from '@/components/site/site-layout';
import { useSite } from '@/context/site-context';
import { buttonVariants } from '@/components/site/primitives/button';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

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
    const isAr = locale === 'ar';
    const ds = t.departmentsSection;

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
            <SiteLayout headerVariant="solid">
                <InnerHero index="02" eyebrow={ds.label} title={ds.title} intro={ds.description} />

                <InnerSection
                    tone="cream"
                    kicker={ds.label}
                    title={isAr ? `${departments.length} قسم أكاديمي في الكلية` : `${departments.length} academic departments`}
                    lead={isAr ? 'تعرّف على المواد والمستويات المتاحة في كل قسم.' : 'Subjects, levels and intake capacity for every department.'}
                >
                    {departments.length === 0 ? (
                        <div className="border-t border-line py-[60px] text-center">
                            <h3 className="m-0 text-[20px] font-semibold">{ds.emptyTitle}</h3>
                            <p className="mt-2 text-[14px] text-ink-muted">{ds.emptyBody}</p>
                        </div>
                    ) : (
                        <NumberedRows
                            className="mt-2"
                            items={departments.map((dept, index) => ({
                                index: index + 1,
                                title: dept.name,
                                body: dept.description,
                                meta: (
                                    <div className="flex flex-wrap items-center gap-2">
                                        {(dept.levels ?? []).map((level) => (
                                            <span key={level.id} className="border border-line px-[9px] py-1 text-[10px] text-ink-muted">
                                                {isAr ? `السنة ${level.year} — شعبة ${level.section}` : `Year ${level.year} · Section ${level.section}`}
                                            </span>
                                        ))}
                                        <span className="text-[11px] font-semibold text-teal-dark">
                                            {isAr
                                                ? `${dept.students_count || 0} طالب · ${dept.subjects_count || 0} مادة`
                                                : `${dept.students_count || 0} students · ${dept.subjects_count || 0} subjects`}
                                        </span>
                                    </div>
                                ),
                                action: (
                                    <Link href="/contact" aria-label={`${dept.name} — ${isAr ? 'استفسر عن التسجيل' : 'Enquire'}`} className="group">
                                        <CircleArrow />
                                    </Link>
                                ),
                            }))}
                        />
                    )}
                </InnerSection>

                <InnerSection
                    tone="paper"
                    kicker={t.applicationSteps.label}
                    title={t.applicationSteps.title}
                    accent={t.applicationSteps.titleAccent}
                    lead={t.applicationSteps.description}
                >
                    <CheckList
                        items={t.applicationSteps.steps.map((step) => (
                            <>
                                <b className="block text-[14px] font-semibold text-ink">{step.title}</b>
                                <span className="mt-1 block text-[13px]">{step.description}</span>
                            </>
                        ))}
                    />
                    <Link href="/student/register" className={cn(buttonVariants({ variant: 'dark' }), 'mt-9')}>
                        {t.applicationSteps.cta}
                    </Link>
                </InnerSection>

                <CtaBand />
            </SiteLayout>
        </>
    );
}
