import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { CmsLevel, CmsStudent, CmsSubject } from '@/types/cms';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EnrollmentCreate({ students, subjects, levels }: { students: CmsStudent[]; subjects: CmsSubject[]; levels: CmsLevel[] }) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.enrollments, href: '/cms/enrollments' },
        { label: c.enrollments.addTitle, href: '/cms/enrollments/create' },
    ]);

    const singleForm = useForm({
        student_id: students[0]?.id ? String(students[0].id) : '',
        subject_id: subjects[0]?.id ? String(subjects[0].id) : '',
        academic_year: '2025-2026',
        semester: 'first',
        status: 'active',
    });

    const bulkForm = useForm({
        level_id: levels[0]?.id ? String(levels[0].id) : '',
        subject_id: subjects[0]?.id ? String(subjects[0].id) : '',
        academic_year: '2025-2026',
        semester: 'first',
    });

    const submitSingle = (e: React.FormEvent) => {
        e.preventDefault();
        singleForm.post('/cms/enrollments');
    };

    const submitBulk = (e: React.FormEvent) => {
        e.preventDefault();
        bulkForm.post('/cms/enrollments/bulk');
    };

    const levelOptionLabel = (lvl: CmsLevel) =>
        `${lvl.department?.name} - ${c.levels.yearLabel.replace('{year}', String(lvl.year))} (${c.levels.sectionLabel.replace('{section}', lvl.section)})`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.enrollments.addTitle} />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">{c.enrollments.addHeading}</h1>

                <Tabs defaultValue="single">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="single">{c.enrollments.tabSingle}</TabsTrigger>
                        <TabsTrigger value="bulk">{c.enrollments.tabBulk}</TabsTrigger>
                    </TabsList>

                    <TabsContent value="single">
                        <form onSubmit={submitSingle} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border">
                            <div>
                                <Label htmlFor="student_id">{c.enrollments.selectStudent}</Label>
                                <select
                                    id="student_id"
                                    className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                    value={singleForm.data.student_id}
                                    onChange={(e) => singleForm.setData('student_id', e.target.value)}
                                >
                                    {students.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name} ({s.student_no})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="subject_id">{c.enrollments.selectSubject}</Label>
                                <select
                                    id="subject_id"
                                    className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                    value={singleForm.data.subject_id}
                                    onChange={(e) => singleForm.setData('subject_id', e.target.value)}
                                >
                                    {subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="academic_year">{c.enrollments.academicYear}</Label>
                                    <input
                                        id="academic_year"
                                        className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                        value={singleForm.data.academic_year}
                                        onChange={(e) => singleForm.setData('academic_year', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="semester">{c.enrollments.semester}</Label>
                                    <select
                                        id="semester"
                                        className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                        value={singleForm.data.semester}
                                        onChange={(e) => singleForm.setData('semester', e.target.value as typeof singleForm.data.semester)}
                                    >
                                        <option value="first">{c.labels.semesters.first}</option>
                                        <option value="second">{c.labels.semesters.second}</option>
                                        <option value="summer">{c.labels.semesters.summer}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <Button type="submit" disabled={singleForm.processing}>{c.enrollments.saveEnrollment}</Button>
                                <Button variant="outline" asChild><Link href="/cms/enrollments">{c.common.cancel}</Link></Button>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent value="bulk">
                        <form onSubmit={submitBulk} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border">
                            <div>
                                <Label htmlFor="level_id">{c.enrollments.selectLevel}</Label>
                                <select
                                    id="level_id"
                                    className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                    value={bulkForm.data.level_id}
                                    onChange={(e) => bulkForm.setData('level_id', e.target.value)}
                                >
                                    {levels.map((lvl) => (
                                        <option key={lvl.id} value={lvl.id}>
                                            {levelOptionLabel(lvl)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="bulk_subject_id">{c.enrollments.bulkSubject}</Label>
                                <select
                                    id="bulk_subject_id"
                                    className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                    value={bulkForm.data.subject_id}
                                    onChange={(e) => bulkForm.setData('subject_id', e.target.value)}
                                >
                                    {subjects.map((sub) => (
                                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="bulk_academic_year">{c.enrollments.academicYear}</Label>
                                    <input
                                        id="bulk_academic_year"
                                        className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                        value={bulkForm.data.academic_year}
                                        onChange={(e) => bulkForm.setData('academic_year', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="bulk_semester">{c.enrollments.semester}</Label>
                                    <select
                                        id="bulk_semester"
                                        className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                        value={bulkForm.data.semester}
                                        onChange={(e) => bulkForm.setData('semester', e.target.value as typeof bulkForm.data.semester)}
                                    >
                                        <option value="first">{c.labels.semesters.first}</option>
                                        <option value="second">{c.labels.semesters.second}</option>
                                        <option value="summer">{c.labels.semesters.summer}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pt-4">
                                <Button type="submit" disabled={bulkForm.processing}>{c.enrollments.enrollAll}</Button>
                                <Button variant="outline" asChild><Link href="/cms/enrollments">{c.common.cancel}</Link></Button>
                            </div>
                        </form>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
