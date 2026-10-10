import { SeoHead } from '@/components/seo-head';
import { InnerHero } from '@/components/site/primitives/inner-hero';
import { SiteLayout } from '@/components/site/site-layout';
import { useSite } from '@/context/site-context';
import { AtSign, BookOpen, Search } from 'lucide-react';
import { useState } from 'react';

interface AcademicSubject {
    name: string;
    code?: string;
    credits?: number;
}

interface AcademicStudent {
    id: number;
    student_no: string;
    name: string;
    status: string;
    department?: string;
    level?: string;
    subjects: AcademicSubject[];
}

const underlineInput =
    'w-full border-0 border-b border-line bg-transparent px-0 py-[10px] text-[14px] text-ink outline-none transition-colors placeholder:text-ink-muted/70 focus:border-coral';

export default function StudentPortal() {
    const { t, locale } = useSite();
    const isAr = locale === 'ar';
    const [inputVal, setInputVal] = useState('');
    const [contactVal, setContactVal] = useState('');
    const [academicStudents, setAcademicStudents] = useState<AcademicStudent[]>([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const clearResults = () => {
        setAcademicStudents([]);
        setSearched(false);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputVal.trim() || !contactVal.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const studentNo = inputVal.trim();
            const contact = contactVal.trim();
            const url = route
                ? route('student.portal.search', { query: studentNo, contact })
                : `/student/portal/search?query=${encodeURIComponent(studentNo)}&contact=${encodeURIComponent(contact)}`;
            const res = await fetch(url, { headers: { Accept: 'application/json' } });
            if (res.status === 429) {
                clearResults();
                setError(
                    isAr
                        ? 'عدد كبير من المحاولات — يرجى الانتظار قليلاً ثم المحاولة مجدداً.'
                        : 'Too many attempts — please wait a moment and try again.',
                );
                return;
            }
            if (res.ok) {
                const data = await res.json();
                setAcademicStudents(data.academic_students || []);
                setSearched(true);
            } else {
                clearResults();
                setError(isAr ? 'تعذر إكمال البحث. حاول مرة أخرى.' : 'Could not complete the search. Please try again.');
            }
        } catch (err) {
            console.error('Failed to search portal:', err);
            clearResults();
            setError(isAr ? 'تعذر إكمال البحث. حاول مرة أخرى.' : 'Could not complete the search. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const statusBadge = (status: string) => {
        const label =
            status === 'active'
                ? isAr
                    ? 'نشط'
                    : 'Active'
                : status === 'graduated'
                  ? isAr
                    ? 'متخرج'
                    : 'Graduated'
                  : status === 'suspended' || status === 'withdrawn'
                    ? isAr
                      ? status === 'suspended'
                        ? 'موقوف'
                        : 'منسحب'
                      : status === 'suspended'
                        ? 'Suspended'
                        : 'Withdrawn'
                    : isAr
                      ? 'قيد المراجعة'
                      : 'Pending';

        return (
            <span
                className={
                    status === 'active' || status === 'graduated'
                        ? 'inline-block border border-teal px-[10px] py-[5px] text-[10px] font-bold uppercase tracking-[0.1em] text-teal-dark'
                        : status === 'suspended' || status === 'withdrawn'
                          ? 'inline-block border border-coral px-[10px] py-[5px] text-[10px] font-bold uppercase tracking-[0.1em] text-coral'
                          : 'inline-block border border-line px-[10px] py-[5px] text-[10px] font-bold uppercase tracking-[0.1em] text-ink-muted'
                }
            >
                {label}
            </span>
        );
    };

    const totalResults = academicStudents.length;

    return (
        <>
            <SeoHead
                title={isAr ? 'بوابة الطالب' : 'Student Portal'}
                description={isAr ? 'استعلم عن سجلك الأكاديمي في الكلية' : 'Search your college academic record'}
            />
            <SiteLayout headerVariant="solid">
                <InnerHero
                    index="09"
                    eyebrow={isAr ? 'بوابة الطالب' : 'Student portal'}
                    title={isAr ? 'استعلام عن السجل الأكاديمي' : 'Academic record lookup'}
                    intro={
                        isAr
                            ? 'ابحث برقم القيد مع البريد أو الهاتف المسجل في سجلك للاستعلام عن التسجيل الأكاديمي'
                            : 'Search with your student ID and the email or phone on your record to look up your college enrollment'
                    }
                />

                <section className="bg-cream py-[70px] site-md:py-[100px]">
                    <div className="site-container">
                        <div className="mx-auto max-w-[860px]">
                            <form onSubmit={handleSearch} className="bg-white p-[26px] site-md:p-[30px]">
                                <div className="grid gap-[26px] site-md:grid-cols-[1fr_1fr_auto] site-md:items-end">
                                    <label className="block">
                                        <span className="mb-2 block text-[12px] text-ink-muted">{isAr ? 'رقم القيد' : 'Student ID'}</span>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute inset-y-0 start-0 flex w-6 items-center">
                                                <Search className="size-4 text-ink-muted" aria-hidden="true" />
                                            </span>
                                            <input
                                                type="text"
                                                value={inputVal}
                                                onChange={(e) => setInputVal(e.target.value)}
                                                placeholder={isAr ? 'مثال: 2024001' : 'e.g. 2024001'}
                                                dir="ltr"
                                                className={`${underlineInput} ps-8`}
                                            />
                                        </div>
                                    </label>
                                    <label className="block">
                                        <span className="mb-2 block text-[12px] text-ink-muted">
                                            {isAr ? 'البريد أو الهاتف المسجل' : 'Record email or phone'}
                                        </span>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute inset-y-0 start-0 flex w-6 items-center">
                                                <AtSign className="size-4 text-ink-muted" aria-hidden="true" />
                                            </span>
                                            <input
                                                type="text"
                                                value={contactVal}
                                                onChange={(e) => setContactVal(e.target.value)}
                                                placeholder="name@example.com"
                                                dir="ltr"
                                                className={`${underlineInput} ps-8`}
                                            />
                                        </div>
                                    </label>
                                    <button
                                        type="submit"
                                        disabled={loading || !inputVal.trim() || !contactVal.trim()}
                                        className="inline-flex items-center justify-center gap-2 border border-transparent bg-ink px-[21px] py-[14px] text-[13px] font-bold whitespace-nowrap text-white transition-colors hover:bg-ink-2 disabled:opacity-50"
                                    >
                                        <Search className="size-4" aria-hidden="true" />
                                        {loading ? t.enroll.submitting : isAr ? 'بحث' : 'Search'}
                                    </button>
                                </div>
                                <p className="m-0 mt-5 text-[11px] leading-[1.9] text-ink-muted">
                                    {isAr
                                        ? 'لأسباب تتعلق بالخصوصية، يظهر السجل فقط عند تطابق رقم القيد مع البريد أو الهاتف المسجل.'
                                        : 'For privacy reasons, a record is only shown when the student ID matches the email or phone on file.'}
                                </p>
                            </form>

                            {error ? (
                                <p className="mt-6 border border-coral bg-white px-[22px] py-[16px] text-center text-[13px] font-semibold text-coral">
                                    {error}
                                </p>
                            ) : null}

                            {searched ? (
                                <div className="mt-12">
                                    <h2 className="m-0 mb-[26px] text-[22px] font-semibold tracking-[-0.04em]">
                                        {isAr ? `نتائج البحث (${totalResults})` : `Search results (${totalResults})`}
                                    </h2>

                                    {totalResults === 0 ? (
                                        <div className="border-t border-line bg-white py-[50px] text-center">
                                            <BookOpen className="mx-auto size-10 text-ink-muted" aria-hidden="true" />
                                            <h3 className="mt-4 mb-0 text-[19px] font-semibold">{isAr ? 'لم يتم العثور على نتائج' : 'No results found'}</h3>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {academicStudents.map((student) => (
                                                <article key={student.id} className="border-t border-line bg-white p-[26px] site-md:p-[30px]">
                                                    <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
                                                        <div className="min-w-0">
                                                            {statusBadge(student.status)}
                                                            <h3 className="m-0 mt-4 text-[21px] font-semibold tracking-[-0.03em]">{student.name}</h3>
                                                            <p className="font-site-latin m-0 mt-1 text-[12px] text-ink-muted" dir="ltr">
                                                                {student.student_no}
                                                            </p>
                                                            {student.department ? (
                                                                <p className="m-0 mt-3 text-[13px] text-ink-muted">
                                                                    {student.department}
                                                                    {student.level ? ` · ${student.level}` : ''}
                                                                </p>
                                                            ) : null}
                                                            {student.subjects.length > 0 ? (
                                                                <div className="mt-4 flex flex-wrap gap-2">
                                                                    {student.subjects.map((subject) => (
                                                                        <span
                                                                            key={subject.code ?? subject.name}
                                                                            className="border border-line px-[9px] py-1 text-[11px] text-ink-muted"
                                                                        >
                                                                            {subject.code ? `${subject.code} · ` : ''}
                                                                            {subject.name}
                                                                            {typeof subject.credits === 'number' ? (
                                                                                <span className="text-ink-muted/70">
                                                                    {' '}
                                                                    {isAr ? `· ${subject.credits} وحدات` : `· ${subject.credits} cr`}
                                                                </span>
                                                                            ) : null}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : null}
                                                        </div>
                                                        <p className="m-0 max-w-[240px] text-[11px] leading-[1.9] text-ink-muted">
                                                            {isAr ? 'سجّل الدخول لعرض كشف الدرجات الكامل' : 'Log in to view your full transcript'}
                                                        </p>
                                                    </div>
                                                </article>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>
            </SiteLayout>
        </>
    );
}
