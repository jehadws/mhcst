import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { CmsLevel } from '@/types/cms';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit, Printer } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useState } from 'react';

export default function LevelsIndex({ levels }: { levels: PaginatedData<CmsLevel> }) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.levels, href: '/cms/levels' },
    ]);

    const [deleteItem, setDeleteItem] = useState<CmsLevel | null>(null);

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(`/cms/levels/${deleteItem.id}`, {
            onSuccess: () => setDeleteItem(null),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.nav.levels} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="font-display text-3xl font-extrabold leading-snug">{c.levels.title}</h1>
                        <p className="text-sm text-muted-foreground">{c.levels.subtitle}</p>
                    </div>
                    <Button asChild className="gap-2">
                        <Link href="/cms/levels/create">
                            <Plus className="w-4 h-4" /> {c.levels.add}
                        </Link>
                    </Button>
                </div>

                <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-muted text-muted-foreground border-b">
                            <tr>
                                <th className="p-4 font-semibold">{c.levels.department}</th>
                                <th className="p-4 font-semibold">{c.levels.academicYear}</th>
                                <th className="p-4 font-semibold">{c.levels.section}</th>
                                <th className="p-4 font-semibold">{c.levels.capacity}</th>
                                <th className="p-4 font-semibold">{c.levels.studentsCount}</th>
                                <th className="p-4 font-semibold text-left">{c.common.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {levels.data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">{c.levels.empty}</td>
                                </tr>
                            ) : (
                                levels.data.map((lvl) => (
                                    <tr key={lvl.id} className="hover:bg-muted/50">
                                        <td className="p-4 font-semibold">{lvl.department?.name || '—'}</td>
                                        <td className="p-4">{c.levels.yearLabel.replace('{year}', String(lvl.year))}</td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                                                {c.levels.sectionLabel.replace('{section}', lvl.section)}
                                            </span>
                                        </td>
                                        <td className="p-4">{lvl.capacity} {c.levels.studentsUnit}</td>
                                        <td className="p-4 font-semibold text-success">{lvl.students_count ?? 0}</td>
                                        <td className="p-4 text-left">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" asChild title={c.levels.printList}>
                                                    <a href={`/cms/levels/${lvl.id}/students-print`} target="_blank" rel="noopener noreferrer">
                                                        <Printer className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/cms/levels/${lvl.id}/edit`}>
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setDeleteItem(lvl)} className="text-destructive hover:text-destructive/80">
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
                    title={c.levels.deleteTitle}
                    description={c.levels.deleteDescription}
                />
            </div>
        </AppLayout>
    );
}
