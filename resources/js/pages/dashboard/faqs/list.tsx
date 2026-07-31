import AppLayout from "@/layouts/app-layout";
import { useSite } from "@/context/site-context";
import { BreadcrumbItem, Faq } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function FaqsListPage() {
    const { faqs } = usePage<{ faqs: Faq[] }>().props;
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.faqs, href: '/dashboard/faqs/list' },
    ];
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false, item: null as Faq | null });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item) return;
        router.delete(route('dashboard.faqs.destroy', deleteDialog.item.id), {
            onSuccess: () => { toast.success(d.toast.deletedSuccess); setDeleteDialog({ isOpen: false, loading: false, item: null }); },
            onError: () => toast.error(d.toast.deleteFailed),
        });
    };

    const columns: ColumnDef<Faq>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} className="ms-2" />
            ),
            cell: ({ row }) => (
                <Checkbox className="ms-2" checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'question',
            header: d.columns.question,
            cell: ({ row }) => <span className="line-clamp-1 max-w-md">{row.getValue('question')}</span>,
        },
        {
            accessorKey: 'answer',
            header: d.columns.answer,
            cell: ({ row }) => <span className="line-clamp-1 max-w-md text-muted-foreground">{row.getValue('answer')}</span>,
        },
        {
            accessorKey: 'is_published',
            header: d.columns.isPublished,
            cell: ({ row }) => (
                <Badge className={row.getValue('is_published') ? 'bg-green-500' : 'bg-gray-500'}>
                    {row.getValue('is_published') ? d.status.published : d.status.inactive}
                </Badge>
            ),
        },
        { accessorKey: 'sort_order', header: d.columns.sortOrder },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.faqs.show', item.id))}><Eye className="w-4 h-4 ms-2" /> {d.actions.view}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.faqs.edit', item.id))}><Edit className="w-4 h-4 ms-2" /> {d.actions.edit}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteDialog({ isOpen: true, loading: false, item })} className="text-destructive"><Trash2 className="w-4 h-4 ms-2 text-destructive" /> {d.actions.delete}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const bulkActions = [
        {
            label: `${d.actions.delete} ${d.entities.faq.plural}`,
            action: (selectedRows: Faq[]) => {
                router.post(route('dashboard.faqs.bulk-actions'), { action: 'delete_selected', entries: selectedRows.map(r => r.id) }, {
                    onSuccess: () => toast.success(d.toast.deletedSuccess), onError: () => toast.error(d.toast.operationFailed)
                });
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={d.entities.faq.plural} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={faqs}
                    title={d.entities.faq.plural}
                    description={d.entities.faq.description}
                    searchFields={['question', 'answer']}
                    bulkActions={bulkActions}
                    onAddNew={() => router.get(route('dashboard.faqs.create'))}
                    onRefresh={() => router.reload()}
                />
                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title={`${d.confirm.deleteTitle} ${d.entities.faq.singular}`}
                    description={`${d.confirm.deleteDescription} "${deleteDialog.item?.question}"؟`}
                    confirmText={d.actions.delete}
                    cancelText={d.actions.cancel}
                    variant="destructive"
                    loading={deleteDialog.loading}
                />
            </div>
        </AppLayout>
    );
}
