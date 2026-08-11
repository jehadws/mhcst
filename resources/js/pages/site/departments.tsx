import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { SeoHead } from '@/components/seo-head';
import { Stats } from '@/components/site/stats';
import { Contact } from '@/components/site/contact';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { useSite } from '@/context/site-context';
import { Building2, BookOpen, Users, GraduationCap, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface CmsLevel {
    id: number;
    year: number;
    section: string;
    capacity: number;
}

interface CmsTeacher {
    id: number;
    name: string;
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
    const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

    return (
        <>
            <SeoHead
                title={locale === 'ar' ? 'الأقسام الأكاديمية' : 'Academic Departments'}
                description={
                    locale === 'ar'
                        ? 'استكشف التخصصات والأقسام الأكاديمية المتنوعة في المعهد الحديث العالي للعلوم والتكنولوجيا'
                        : 'Explore our academic departments and specialized study programs at MHCST'
                }
            />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">

                    {/* ─── Hero Banner ─── */}
                    <div className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-primary/10 via-background to-indigo-500/5 py-20 sm:py-24">
                        <div className="pointer-events-none absolute inset-0 -z-10">
                            <div className="absolute -top-20 start-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
                        </div>
                        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                                <Sparkles className="size-3.5" />
                                <span>{locale === 'ar' ? 'التخصصات الأكاديمية' : 'Academic Majors'}</span>
                            </span>
                            <h1 className="mt-5 font-serif text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                                {locale === 'ar' ? 'الأقسام والبرامج الدراسية' : 'Academic Departments & Programs'}
                            </h1>
                            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                                {locale === 'ar'
                                    ? 'يقدم المعهد مجموعة متميزة من الأقسام العلمية والتطبيقيّة المُصمَّمة لإعداد كوادر مؤهلة ومتميزة لمواكبة متطلبات سوق العمل.'
                                    : 'Offering specialized academic departments designed to empower students with theoretical knowledge and practical expertise.'}
                            </p>
                        </div>
                    </div>

                    {/* ─── Stats Banner ─── */}
                    <div className="py-2">
                        <Stats />
                    </div>

                    {/* ─── Departments Grid ─── */}
                    <section className="py-16 sm:py-24">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mx-auto max-w-2xl text-center mb-12">
                                <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                    {locale === 'ar' ? 'الأقسام الأكاديمية بالكلية' : 'Our Academic Departments'}
                                </h2>
                                <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                                    {locale === 'ar'
                                        ? 'تعرّف على الأقسام المتاحة والمواد والتخصصات الأكاديمية'
                                        : 'Discover specialized departments and academic levels available'}
                                </p>
                            </div>

                            {departments.length === 0 ? (
                                <div className="text-center py-12 rounded-3xl border border-dashed border-border bg-card">
                                    <Building2 className="mx-auto size-12 text-muted-foreground/50" />
                                    <p className="mt-4 text-base font-semibold text-foreground">
                                        {locale === 'ar' ? 'لا توجد أقسام مضافة حالياً' : 'No departments listed yet'}
                                    </p>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {locale === 'ar' ? 'سيتم إضافة الأقسام الأكاديمية قريباً.' : 'Academic departments will be published soon.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {departments.map((dept) => (
                                        <div
                                            key={dept.id}
                                            className="group flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-8 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
                                        >
                                            <div>
                                                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 shadow-inner transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                                    <Building2 className="size-7" />
                                                </div>

                                                <h3 className="font-serif text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                                                    {dept.name}
                                                </h3>

                                                <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                                                    {dept.description || (locale === 'ar' ? 'قسم أكاديمي متكامل يوفر بيئة تعليمية حديثة معتمدة.' : 'Full academic department providing modern accredited learning environment.')}
                                                </p>
                                            </div>

                                            <div className="mt-8 pt-6 border-t border-border/60">
                                                {dept.head && (
                                                    <div className="mb-4 text-xs text-muted-foreground flex items-center gap-2">
                                                        <GraduationCap className="size-4 text-primary shrink-0" />
                                                        <span>
                                                            {locale === 'ar' ? 'رئيس القسم:' : 'Department Head:'} <strong className="text-foreground">{dept.head.name}</strong>
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between gap-4 text-xs font-semibold">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                                                        <Users className="size-3.5 text-primary" />
                                                        {dept.students_count || 0} {locale === 'ar' ? 'طالب' : 'Students'}
                                                    </span>

                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-secondary-foreground">
                                                        <BookOpen className="size-3.5 text-primary" />
                                                        {dept.subjects_count || 0} {locale === 'ar' ? 'مادة' : 'Subjects'}
                                                    </span>
                                                </div>

                                                <Link
                                                    href="/contact"
                                                    className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 py-2.5 text-xs font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                                                >
                                                    <span>{locale === 'ar' ? 'استفسر عن التكلفة والتسجيل' : 'Inquire & Apply'}</span>
                                                    <Arrow className="size-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* ─── Contact CTA at end ─── */}
                    <Contact />

                </main>
                <SiteFooter />
                <FloatingButtons />
            </div>
        </>
    );
}
