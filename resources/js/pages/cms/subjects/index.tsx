import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs, semesterLabel } from '@/lib/cms-helpers';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { CmsDepartment, CmsSubject } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useState } from 'react';

export default function SubjectsIndex({ subjects, departments }: { subjects: PaginatedData<CmsSubject>; departments: CmsDepartment[] }) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.subjects, href: '/cms/subjects' },
    ]);

    const [deleteItem, setDeleteItem] = useState<CmsSubject | null>(null);

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/cms/subjects/${deleteItem.id}`, {
            onSuccess: () => setDeleteItem(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.nav.subjects} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-display text-3xl font-extrabold leading-snug">{c.subjects.title}</h1>
                        <p className="text-sm text-muted-foreground">{c.subjects.subtitle}</p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href="/cms/subjects/create">
                            <Plus className="w-4 h-4" /> {c.subjects.add}
                        </Link>
                    </Button>
                </div>

                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-muted text-muted-foreground border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.subjects.code}</th>
                                <th className="p-4 font-semibold">{c.subjects.name}</th>
                                <th className="p-4 font-semibold">{c.common.department}</th>
                                <th className="p-4 font-semibold">{c.subjects.credits}</th>
                                <th className="p-4 font-semibold">{c.subjects.semester}</th>
                                <th className="p-4 font-semibold">{c.subjects.hasLab}</th>
                                <th className="p-4 font-semibold text-left">{c.common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {subjects.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">{c.subjects.empty}</td>
                                </tr>
                            ) : (
                                subjects.data.map((subj) => (
                                    <tr key={subj.id} className="hover:bg-muted/50">
                                        <td className="p-4 font-bold tabular-nums">{subj.code}</td>
                                        <td className="p-4 font-semibold">{subj.name}</td>
                                        <td className="p-4">{subj.department?.name || '—'}</td>
                                        <td className="p-4">{subj.credits} {c.subjects.creditsUnit}</td>
                                        <td className="p-4">{semesterLabel(c, subj.semester)}</td>
                                        <td className="p-4">
                                            {subj.has_lab ? (
                                                <span className="px-2 py-0.5 rounded-full text-xs bg-info/10 text-info font-semibold">{c.subjects.lab}</span>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">{c.subjects.theoretical}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/cms/subjects/${subj.id}/edit`}>
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteItem(subj)} className="text-destructive hover:text-destructive/80">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <ConfirmationDialog
                    isOpen={!!deleteItem}
                    onClose={() => setDeleteItem(null)}
                    onConfirm={handleDelete}
                    title={c.subjects.deleteTitle}
                    description={c.subjects.deleteDescription.replace('{name}', deleteItem?.name ?? '')}
                />
            </div>
        </AppLayout>
    );
}
