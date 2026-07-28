import { useForm } from '@inertiajs/react'
import { CheckCircle2, Send } from 'lucide-react'
import { courses } from '@/data/courses'
import { useSite } from '@/context/site-context'
import { cn } from '@/lib/utils'

interface EnrollFormProps {
    defaultCourse?: string
    flash?: { success?: string }
}

export function EnrollForm({ defaultCourse, flash }: EnrollFormProps) {
    const { t, tr } = useSite()
    const { data, setData, post, processing, errors, reset, wasSuccessful } = useForm({
        name: '',
        email: '',
        phone: '',
        course: defaultCourse ?? '',
        message: '',
    })

    const selectClasses =
        'h-10 w-full rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40'

    function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        post(route('enroll.store'), {
            onSuccess: () => reset(),
        })
    }

    if (wasSuccessful || flash?.success) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CheckCircle2 className="size-7" />
                </span>
                <h3 className="mt-4 font-serif text-2xl font-semibold">{t.enroll.successTitle}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{t.enroll.successBody}</p>
                <button
                    type="button"
                    onClick={() => reset()}
                    className="mt-6 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
                >
                    {t.enroll.another}
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                    <label htmlFor="enroll-name" className="text-sm font-medium">
                        {t.enroll.name}
                    </label>
                    <input
                        id="enroll-name"
                        name="name"
                        autoComplete="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        aria-invalid={!!errors.name}
                        className={cn(
                            'h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40',
                            errors.name && 'border-destructive',
                        )}
                    />
                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="grid gap-2">
                    <label htmlFor="enroll-email" className="text-sm font-medium">
                        {t.enroll.email}
                    </label>
                    <input
                        id="enroll-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        aria-invalid={!!errors.email}
                        className={cn(
                            'h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40',
                            errors.email && 'border-destructive',
                        )}
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="grid gap-2">
                    <label htmlFor="enroll-phone" className="text-sm font-medium">
                        {t.enroll.phone}
                    </label>
                    <input
                        id="enroll-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        dir="ltr"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                        className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                    />
                </div>
                <div className="grid gap-2">
                    <label htmlFor="enroll-course" className="text-sm font-medium">
                        {t.enroll.course}
                    </label>
                    <select
                        id="enroll-course"
                        name="course"
                        value={data.course}
                        onChange={(e) => setData('course', e.target.value)}
                        className={cn(selectClasses, errors.course && 'border-destructive')}
                        aria-invalid={!!errors.course}
                    >
                        <option value="" disabled>
                            {t.enroll.selectCourse}
                        </option>
                        {courses.map((c) => (
                            <option key={c.slug} value={c.slug}>
                                {tr(c.title)}
                            </option>
                        ))}
                    </select>
                    {errors.course && <p className="text-xs text-destructive">{errors.course}</p>}
                </div>
                <div className="grid gap-2 sm:col-span-2">
                    <label htmlFor="enroll-message" className="text-sm font-medium">
                        {t.enroll.message}
                    </label>
                    <textarea
                        id="enroll-message"
                        name="message"
                        rows={4}
                        value={data.message}
                        onChange={(e) => setData('message', e.target.value)}
                        className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                    />
                </div>
            </div>
            <button
                type="submit"
                disabled={processing}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {processing ? (
                    t.enroll.submitting
                ) : (
                    <>
                        <Send className="size-4" />
                        {t.enroll.submit}
                    </>
                )}
            </button>
        </form>
    )
}
