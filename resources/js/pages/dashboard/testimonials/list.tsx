import AppLayout from "@/layouts/app-layout";
import { useSite } from "@/context/site-context";
import { BreadcrumbItem, PaginatedData, Testimonial } from "@/types";
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

export default function TestimonialsListPage() {
    const { testimonials } = usePage<{ testimonials: PaginatedData<Testimonial> }>().props;
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.testimonials, href: '/dashboard/testimonials/list' },
    ];
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false, item: null as Testimonial | null });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item) return;
        router.delete(route('dashboard.testimonials.destroy', deleteDialog.item.id), {
            onSuccess: () => { toast.success(d.toast.deletedSuccess); setDeleteDialog({ isOpen: false, loading: false, item: null }); },
            onError: () => toast.error(d.toast.deleteFailed),
        });
    };

    const columns: ColumnDef<Testimonial>[] = [
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
            accessorKey: 'name',
            header: d.columns.name,
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    {row.original.photo ? (
                        <img src={`/storage/${row.original.photo}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs">{row.original.name.charAt(0)}</div>
                    )}
                    <div>
                        <div>{row.getValue('name')}</div>
                        <div className="text-xs text-muted-foreground">{row.original.role_title} {row.original.company && `- ${row.original.company}`}</div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'quote',
            header: d.columns.quote,
            cell: ({ row }) => <span className="line-clamp-1 max-w-xs">{row.getValue('quote')}</span>,
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
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.testimonials.show', item.id))}><Eye className="w-4 h-4 ms-2" /> {d.actions.view}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.testimonials.edit', item.id))}><Edit className="w-4 h-4 ms-2" /> {d.actions.edit}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteDialog({ isOpen: true, loading: false, item })} className="text-destructive"><Trash2 className="w-4 h-4 ms-2 text-destructive" /> {d.actions.delete}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const bulkActions = [
        {
            label: `${d.actions.delete} ${d.entities.testimonial.plural}`,
            action: (selectedRows: Testimonial[]) => {
                router.post(route('dashboard.testimonials.bulk-actions'), { action: 'delete_selected', entries: selectedRows.map(r => r.id) }, {
                    onSuccess: () => toast.success(d.toast.deletedSuccess), onError: () => toast.error(d.toast.operationFailed)
                });
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={d.entities.testimonial.plural} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={testimonials.data}
                    title={d.entities.testimonial.plural}
                    description={d.entities.testimonial.description}
                    searchFields={['name', 'quote']}
                    bulkActions={bulkActions}
                    onAddNew={() => router.get(route('dashboard.testimonials.create'))}
                    onRefresh={() => router.reload()}
                />
                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title={`${d.confirm.deleteTitle} ${d.entities.testimonial.singular}`}
                    description={`${d.confirm.deleteDescription} "${deleteDialog.item?.name}"؟`}
                    confirmText={d.actions.delete}
                    cancelText={d.actions.cancel}
                    variant="destructive"
                    loading={deleteDialog.loading}
                />
            </div>
        </AppLayout>
    );
}
