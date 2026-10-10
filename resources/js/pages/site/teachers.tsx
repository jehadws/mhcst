import { SeoHead } from '@/components/seo-head';
import { InnerHero } from '@/components/site/primitives/inner-hero';
import { InnerSection } from '@/components/site/primitives/inner-section';
import { CtaBand } from '@/components/site/sections/cta-band';
import { SiteLayout } from '@/components/site/site-layout';
import { useSite } from '@/context/site-context';
import { useSiteSettings } from '@/hooks/use-site-settings';

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
            <SiteLayout headerVariant="solid">
                <InnerHero
                    index="03"
                    eyebrow={isAr ? 'هيئة التدريس' : 'Faculty'}
                    title={isAr ? 'أعضاء هيئة التدريس' : 'Faculty members'}
                    intro={
                        isAr
                            ? 'نخبة من الأساتذة والخبراء الأكاديميين يقودون العملية التعليمية في الكلية.'
                            : 'A distinguished group of professors and academic experts leading teaching at the college.'
                    }
                />

                <InnerSection
                    tone="cream"
                    kicker={isAr ? 'الدليل' : 'Directory'}
                    title={isAr ? 'من يدرّس في الكلية' : 'Who teaches here'}
                    lead={
                        isAr
                            ? `${teachers.length} عضو هيئة تدريس يدرّس حاليًا في الكلية.`
                            : `${teachers.length} faculty members currently teaching at the college.`
                    }
                >
                    {teachers.length === 0 ? (
                        <div className="border-t border-line py-[60px] text-center">
                            <h3 className="m-0 text-[20px] font-semibold">
                                {isAr ? 'لا يوجد أعضاء هيئة تدريس منشورون حاليًا.' : 'No faculty members to show right now.'}
                            </h3>
                            <p className="mt-2 text-[14px] text-ink-muted">
                                {isAr ? 'سيتم نشر قائمة أعضاء هيئة التدريس قريباً.' : 'The faculty directory will be published soon.'}
                            </p>
                        </div>
                    ) : (
                        <div className="mt-2 grid gap-x-7 gap-y-9 site-md:grid-cols-2 site-lg:grid-cols-4">
                            {teachers.map((teacher, index) => {
                                const name =
                                    hideInstructorNames && !teacher.name
                                        ? isAr
                                            ? 'عضو هيئة التدريس'
                                            : 'Faculty member'
                                        : teacher.name;

                                return (
                                    <article key={teacher.id} className="border-t border-line pt-[22px]">
                                        <b className="font-site-latin text-[11px] font-bold text-coral" dir="ltr">
                                            {String(index + 1).padStart(2, '0')}
                                        </b>
                                        <h3 className="m-[18px_0_6px] text-[18px] font-semibold leading-snug">{name}</h3>
                                        <p className="m-0 text-[12px] leading-[1.9] font-semibold text-teal-dark">
                                            {teacher.specialization || (isAr ? 'عضو هيئة التدريس' : 'Faculty member')}
                                        </p>
                                        {teacher.qualification ? (
                                            <p className="m-0 mt-2 text-[12px] leading-[1.9] text-ink-muted">
                                                {isAr ? 'المؤهل: ' : 'Qualification: '}
                                                {teacher.qualification}
                                            </p>
                                        ) : null}
                                        {(teacher.departments ?? []).length > 0 ? (
                                            <div className="mt-4 flex flex-wrap gap-[7px]">
                                                {teacher.departments!.map((department) => (
                                                    <span key={department.id} className="border border-line px-[9px] py-1 text-[10px] text-ink-muted">
                                                        {department.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </InnerSection>

                <CtaBand />
            </SiteLayout>
        </>
    );
}
