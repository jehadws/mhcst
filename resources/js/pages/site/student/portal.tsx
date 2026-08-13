import { SeoHead } from '@/components/seo-head';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite } from '@/context/site-context';
import { Award, BookOpen, GraduationCap, Search, School } from 'lucide-react';
import { useState } from 'react';

interface TrainingEnrollment {
  id: number;
  full_name: string;
  status: string;
  created_at: string;
  course?: {
    title_ar: string;
    title_en?: string;
    slug: string;
  };
  certificate?: {
    certificate_number: string;
    download_url?: string;
  };
}

interface AcademicStudent {
  id: number;
  student_no: string;
  name: string;
  status: string;
  department?: string;
  level?: string;
  subjects: string[];
}

export default function StudentPortal() {
  const { t, locale } = useSite();
  const [inputVal, setInputVal] = useState('');
  const [trainingEnrollments, setTrainingEnrollments] = useState<TrainingEnrollment[]>([]);
  const [academicStudents, setAcademicStudents] = useState<AcademicStudent[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    setLoading(true);
    try {
      const url = route
        ? route('student.portal.search', { query: inputVal.trim() })
        : `/student/portal/search?query=${encodeURIComponent(inputVal.trim())}`;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        setTrainingEnrollments(data.training_enrollments || data.enrollments || []);
        setAcademicStudents(data.academic_students || []);
        setSearched(true);
      }
    } catch (err) {
      console.error('Failed to search portal:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {locale === 'ar' ? 'مكتملة' : 'Completed'}
          </span>
        );
      case 'confirmed':
      case 'active':
        return (
          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">
            {locale === 'ar' ? 'نشط' : 'Active'}
          </span>
        );
      case 'cancelled':
      case 'dropped':
        return (
          <span className="bg-destructive/10 text-destructive rounded-full px-3 py-1 text-xs font-bold">
            {locale === 'ar' ? 'ملغي' : 'Cancelled'}
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
            {locale === 'ar' ? 'قيد المراجعة' : 'Pending'}
          </span>
        );
    }
  };

  const totalResults = trainingEnrollments.length + academicStudents.length;

  return (
    <>
      <SeoHead
        title={locale === 'ar' ? 'بوابة الطالب' : 'Student Portal'}
        description={
          locale === 'ar'
            ? 'استعلم عن دوراتك التدريبية أو سجلك الأكاديمي في الكلية'
            : 'Search training courses or your college academic record'
        }
      />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <div className="border-border bg-secondary relative border-b py-14 sm:py-16">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              <span className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold">
                <GraduationCap className="size-3.5" />
                <span>{locale === 'ar' ? 'بوابة الطالب' : 'Student Portal'}</span>
              </span>
              <h1 className="text-foreground mt-4 font-serif text-4xl font-extrabold tracking-tight sm:text-5xl">
                {locale === 'ar' ? 'استعلام عن الدورات والسجل الأكاديمي' : 'Courses & Academic Record'}
              </h1>
              <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-sm sm:text-base">
                {locale === 'ar'
                  ? 'ابحث برقم القيد أو البريد أو الهاتف — يشمل الدورات التدريبية والتسجيل الأكاديمي'
                  : 'Search by student ID, email, or phone — includes training courses and college enrollment'}
              </p>
            </div>
          </div>

          <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            <form onSubmit={handleSearch} className="border-border/80 bg-card rounded-3xl border p-6 shadow-xl sm:p-8">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="text-muted-foreground absolute start-3.5 top-1/2 size-4 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder={locale === 'ar' ? 'رقم القيد، البريد، أو الهاتف...' : 'Student ID, email, or phone...'}
                    className="border-input bg-background focus:border-primary focus:ring-primary/20 w-full rounded-xl border py-3 ps-10 pe-4 text-sm transition-colors outline-none focus:ring-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !inputVal.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all disabled:opacity-50"
                >
                  <Search className="size-4" />
                  {loading ? t.enroll.submitting : locale === 'ar' ? 'بحث' : 'Search'}
                </button>
              </div>
            </form>

            {searched && (
              <div className="mt-8 space-y-8">
                <h2 className="text-foreground font-serif text-xl font-bold">
                  {locale === 'ar' ? `نتائج البحث (${totalResults})` : `Search Results (${totalResults})`}
                </h2>

                {totalResults === 0 ? (
                  <div className="border-border bg-card rounded-3xl border p-10 text-center">
                    <BookOpen className="text-muted-foreground/60 mx-auto size-12" />
                    <h3 className="mt-4 font-serif text-lg font-bold">{locale === 'ar' ? 'لم يتم العثور على نتائج' : 'No Results Found'}</h3>
                  </div>
                ) : (
                  <>
                    {academicStudents.length > 0 && (
                      <section className="space-y-4">
                        <h3 className="flex items-center gap-2 font-bold text-indigo-700 dark:text-indigo-300">
                          <School className="size-5" />
                          {locale === 'ar' ? 'السجل الأكاديمي (CMS)' : 'College Academic Record'}
                        </h3>
                        {academicStudents.map((student) => (
                          <div key={student.id} className="border-border bg-card rounded-2xl border p-6 shadow-sm">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="mb-2">{statusBadge(student.status)}</div>
                                <h4 className="text-lg font-bold">{student.name}</h4>
                                <p className="text-muted-foreground text-sm">{student.student_no}</p>
                                {student.department && (
                                  <p className="text-sm mt-2">{student.department}{student.level ? ` · ${student.level}` : ''}</p>
                                )}
                                {student.subjects.length > 0 && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {locale === 'ar' ? 'المواد:' : 'Subjects:'} {student.subjects.join(', ')}
                                  </p>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground max-w-xs">
                                {locale === 'ar'
                                  ? 'سجّل الدخول لعرض كشف الدرجات الكامل'
                                  : 'Log in to view your full transcript'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </section>
                    )}

                    {trainingEnrollments.length > 0 && (
                      <section className="space-y-4">
                        <h3 className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-300">
                          <Award className="size-5" />
                          {locale === 'ar' ? 'الدورات التدريبية' : 'Training Courses'}
                        </h3>
                        {trainingEnrollments.map((enr) => {
                          const courseName = courseTitle(enr.course, locale);
                          const learnerName = enr.full_name;

                          return (
                            <div key={`training-${enr.id}`} className="border-border bg-card overflow-hidden rounded-2xl border p-6 shadow-sm">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    {statusBadge(enr.status)}
                                    <span className="text-muted-foreground text-xs">{new Date(enr.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <h4 className="text-foreground font-serif text-lg font-bold">{courseName}</h4>
                                  <p className="text-muted-foreground text-xs">
                                    {locale === 'ar' ? 'المتدرب:' : 'Learner:'} {learnerName}
                                  </p>
                                </div>
                                {enr.certificate?.download_url && (
                                  <a
                                    href={enr.certificate.download_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow transition-colors hover:bg-emerald-700"
                                  >
                                    <Award className="size-4" />
                                    <span>{locale === 'ar' ? 'تحميل الشهادة' : 'Download Certificate'}</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </section>
                    )}
                  </>
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

function courseTitle(course?: TrainingEnrollment['course'], locale?: string) {
  if (!course) return '-';
  return locale === 'ar' ? course.title_ar : course.title_en || course.title_ar;
}
