import { useState } from 'react'
import { Award, BookOpen, GraduationCap, Search } from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { SeoHead } from '@/components/seo-head'
import { useSite } from '@/context/site-context'

interface Enrollment {
    id: number
    full_name: string
    email: string
    phone: string
    status: string
    created_at: string
    course?: {
        title_ar: string
        title_en?: string
        slug: string
    }
    student?: {
        full_name: string
        email?: string
    }
    certificate?: {
        id: number
        certificate_number: string
    }
}

export default function StudentPortal() {
    const { t, locale } = useSite()
    const [inputVal, setInputVal] = useState('')
    const [enrollments, setEnrollments] = useState<Enrollment[]>([])
    const [searched, setSearched] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputVal.trim()) return

        setLoading(true)
        try {
            const url = route ? route('student.portal.search', { query: inputVal.trim() }) : `/student/portal/search?query=${encodeURIComponent(inputVal.trim())}`
            const res = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                },
            })
            if (res.ok) {
                const data = await res.json()
                setEnrollments(data.enrollments || [])
                setSearched(true)
            }
        } catch (err) {
            console.error('Failed to search enrollments:', err)
        } finally {
            setLoading(false)
        }
    }

    const statusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">{locale === 'ar' ? 'مكتملة' : 'Completed'}</span>
            case 'confirmed':
                return <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600 dark:text-blue-400">{locale === 'ar' ? 'مقبول' : 'Active / Confirmed'}</span>
            case 'cancelled':
                return <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">{locale === 'ar' ? 'ملغي' : 'Cancelled'}</span>
            default:
                return <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">{locale === 'ar' ? 'قيد المراجعة' : 'Pending'}</span>
        }
    }

    return (
        <>
            <SeoHead
                title={locale === 'ar' ? 'بوابة المتدربين' : 'Student Learner Portal'}
                description={locale === 'ar' ? 'استعلم عن دوراتك المسجلة وحالة قبولك وتحصيل شهاداتك التدريبية' : 'Search your enrolled courses and download verified certificates'}
            />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">
                    {/* Hero */}
                    <div className="relative border-b border-border/60 bg-gradient-to-b from-primary/10 via-background to-background py-14 sm:py-16">
                        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                                <GraduationCap className="size-3.5" />
                                <span>{locale === 'ar' ? 'بوابة المتدربين' : 'Learner Portal'}</span>
                            </span>
                            <h1 className="mt-4 font-serif text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                                {locale === 'ar' ? 'استعلام عن الدورات والشهادات' : 'My Courses & Certificates'}
                            </h1>
                            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
                                {locale === 'ar'
                                    ? 'أدخل رقم الهاتف أو البريد الإلكتروني للوصول لسجل دوراتك وتحصيل شهاداتك'
                                    : 'Enter your phone number or email address to view your enrollments and certificates'}
                            </p>
                        </div>
                    </div>

                    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                        {/* Search Form */}
                        <form onSubmit={handleSearch} className="rounded-3xl border border-border/80 bg-card p-6 shadow-xl sm:p-8">
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <div className="relative flex-1">
                                    <Search className="absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={inputVal}
                                        onChange={(e) => setInputVal(e.target.value)}
                                        placeholder={locale === 'ar' ? 'أدخل البريد الإلكتروني أو رقم الهاتف...' : 'Enter your email or phone number...'}
                                        className="w-full rounded-xl border border-input bg-background py-3 pe-4 ps-10 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || !inputVal.trim()}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50"
                                >
                                    <Search className="size-4" />
                                    {loading ? t.enroll.submitting : locale === 'ar' ? 'بحث' : 'Search'}
                                </button>
                            </div>
                        </form>

                        {/* Search Results */}
                        {searched && (
                            <div className="mt-8 space-y-4">
                                <h2 className="font-serif text-xl font-bold text-foreground">
                                    {locale === 'ar' ? `نتائج البحث (${enrollments.length})` : `Search Results (${enrollments.length})`}
                                </h2>

                                {enrollments.length === 0 ? (
                                    <div className="rounded-3xl border border-border bg-card p-10 text-center">
                                        <BookOpen className="mx-auto size-12 text-muted-foreground/60" />
                                        <h3 className="mt-4 font-serif text-lg font-bold">
                                            {locale === 'ar' ? 'لم يتم العثور على تسجيلات' : 'No Enrollments Found'}
                                        </h3>
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {locale === 'ar'
                                                ? 'تأكد من إدخال رقم الهاتف أو البريد الإلكتروني الذي استعملته أثناء التسجيل.'
                                                : 'Please make sure you entered the exact email or phone number used during enrollment.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 sm:grid-cols-1">
                                        {enrollments.map((enr) => {
                                            const courseName = courseTitle(enr.course, locale)
                                            const learnerName = enr.student?.full_name || enr.full_name
                                            const learnerEmail = enr.student?.email || enr.email

                                            return (
                                                <div key={enr.id} className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2">
                                                                {statusBadge(enr.status)}
                                                                <span className="text-xs text-muted-foreground">{new Date(enr.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <h3 className="font-serif text-lg font-bold text-foreground">{courseName}</h3>
                                                            <p className="text-xs text-muted-foreground">
                                                                {locale === 'ar' ? 'المتدرب:' : 'Learner:'} {learnerName} ({learnerEmail})
                                                            </p>
                                                        </div>

                                                        {enr.certificate && (
                                                            <a
                                                                href={`/verify-certificate/${enr.certificate.certificate_number}/download`}
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
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
                <SiteFooter />
            </div>
        </>
    )
}

function courseTitle(course?: Enrollment['course'], locale?: string) {
    if (!course) return '-'
    return locale === 'ar' ? course.title_ar : (course.title_en || course.title_ar)
}
