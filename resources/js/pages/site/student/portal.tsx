import { SeoHead } from '@/components/seo-head';
import { PageHero } from '@/components/site/page-hero';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
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

export default function StudentPortal() {
  const { t, locale } = useSite();
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
          locale === 'ar'
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
        setError(locale === 'ar' ? 'تعذر إكمال البحث. حاول مرة أخرى.' : 'Could not complete the search. Please try again.');
      }
    } catch (err) {
      console.error('Failed to search portal:', err);
      clearResults();
      setError(locale === 'ar' ? 'تعذر إكمال البحث. حاول مرة أخرى.' : 'Could not complete the search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="bg-info/10 text-info rounded-full px-3 py-1 text-xs font-bold">{locale === 'ar' ? 'نشط' : 'Active'}</span>;
      case 'graduated':
        return <span className="bg-success/10 text-success rounded-full px-3 py-1 text-xs font-bold">{locale === 'ar' ? 'متخرج' : 'Graduated'}</span>;
      case 'suspended':
      case 'withdrawn':
        return (
          <span className="bg-destructive/10 text-destructive rounded-full px-3 py-1 text-xs font-bold">
            {locale === 'ar' ? (status === 'suspended' ? 'موقوف' : 'منسحب') : status === 'suspended' ? 'Suspended' : 'Withdrawn'}
          </span>
        );
      default:
        return (
          <span className="bg-warning/10 text-warning rounded-full px-3 py-1 text-xs font-bold">{locale === 'ar' ? 'قيد المراجعة' : 'Pending'}</span>
        );
    }
  };

  const totalResults = academicStudents.length;

  return (
    <>
      <SeoHead
        title={locale === 'ar' ? 'بوابة الطالب' : 'Student Portal'}
        description={locale === 'ar' ? 'استعلم عن سجلك الأكاديمي في الكلية' : 'Search your college academic record'}
      />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageHero
            title={locale === 'ar' ? 'استعلام عن السجل الأكاديمي' : 'Academic record lookup'}
            description={
              locale === 'ar'
                ? 'ابحث برقم القيد مع البريد أو الهاتف المسجل في سجلك للاستعلام عن التسجيل الأكاديمي'
                : 'Search with your student ID and the email or phone on your record to look up your college enrollment'
            }
            crumbs={[{ label: locale === 'ar' ? 'بوابة الطالب' : 'Student portal', href: '/student/portal' }]}
          />

          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <form onSubmit={handleSearch} className="border-border/80 bg-card rounded-2xl border p-6 shadow-xl sm:p-8">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute start-3.5 top-1/2 size-4 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={locale === 'ar' ? 'رقم القيد...' : 'Student ID...'}
                    className="border-input bg-background focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-3 ps-10 pe-4 text-sm transition-colors outline-none focus:ring-2"
                  />
                </div>
                <div className="relative flex-1">
                  <AtSign className="text-muted-foreground absolute start-3.5 top-1/2 size-4 -translate-y-1/2" />
                  <input
                    type="text"
                    value={contactVal}
                    onChange={(e) => setContactVal(e.target.value)}
                    placeholder={locale === 'ar' ? 'البريد أو الهاتف المسجل...' : 'Record email or phone...'}
                    className="border-input bg-background focus:border-primary focus:ring-primary/20 w-full rounded-lg border py-3 ps-10 pe-4 text-sm transition-colors outline-none focus:ring-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !inputVal.trim() || !contactVal.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-bold shadow-md transition-all disabled:opacity-50"
                >
                  <Search className="size-4" />
                  {loading ? t.enroll.submitting : locale === 'ar' ? 'بحث' : 'Search'}
                </button>
              </div>
              <p className="text-muted-foreground mt-3 text-xs">
                {locale === 'ar'
                  ? 'لأسباب تتعلق بالخصوصية، يظهر السجل فقط عند تطابق رقم القيد مع البريد أو الهاتف المسجل.'
                  : 'For privacy reasons, a record is only shown when the student ID matches the email or phone on file.'}
              </p>
            </form>

            {error && (
              <div className="border-destructive/30 bg-destructive/10 text-destructive mt-6 rounded-2xl border p-4 text-center text-sm font-semibold">
                {error}
              </div>
            )}

            {searched && (
              <div className="mt-8 space-y-8">
                <h2 className="font-display text-foreground text-xl leading-snug font-extrabold">
                  {locale === 'ar' ? `نتائج البحث (${totalResults})` : `Search Results (${totalResults})`}
                </h2>

                {totalResults === 0 ? (
                  <div className="border-border bg-card rounded-2xl border p-10 text-center">
                    <BookOpen className="text-muted-foreground/60 mx-auto size-12" />
                    <h3 className="font-display mt-4 text-lg leading-snug font-extrabold">
                      {locale === 'ar' ? 'لم يتم العثور على نتائج' : 'No Results Found'}
                    </h3>
                  </div>
                ) : (
                  <section className="space-y-4">
                    <h3 className="font-display text-primary flex items-center gap-2 text-lg leading-snug font-extrabold">
                      <BookOpen className="size-5" />
                      {locale === 'ar' ? 'السجل الأكاديمي' : 'College Academic Record'}
                    </h3>
                    {academicStudents.map((student) => (
                      <div key={student.id} className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="mb-2">{statusBadge(student.status)}</div>
                            <h4 className="text-lg font-bold">{student.name}</h4>
                            <p className="text-muted-foreground text-sm">{student.student_no}</p>
                            {student.department && (
                              <p className="mt-2 text-sm">
                                {student.department}
                                {student.level ? ` · ${student.level}` : ''}
                              </p>
                            )}
                            {student.subjects.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {student.subjects.map((subject) => (
                                  <span
                                    key={subject.code ?? subject.name}
                                    className="border-border bg-secondary inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
                                  >
                                    <BookOpen className="text-muted-foreground size-3" />
                                    <span>
                                      {subject.code ? `${subject.code} · ` : ''}
                                      {subject.name}
                                    </span>
                                    {typeof subject.credits === 'number' && (
                                      <span className="text-muted-foreground">
                                        {locale === 'ar' ? ` · ${subject.credits} وحدات` : ` · ${subject.credits} cr`}
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-muted-foreground max-w-xs text-xs">
                            {locale === 'ar' ? 'سجّل الدخول لعرض كشف الدرجات الكامل' : 'Log in to view your full transcript'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </section>
                )}
              </div>
            )}
          </div>
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
