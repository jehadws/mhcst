import AppLayout from "@/layouts/app-layout";
import { useSite } from "@/context/site-context";
import { BreadcrumbItem, Lead, PaginatedData } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function LeadsListPage() {
    const { leads } = usePage<{ leads: PaginatedData<Lead> }>().props;
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.leads, href: '/dashboard/leads/list' },
    ];
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false, item: null as Lead | null });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item) return;
        router.delete(route('dashboard.leads.destroy', deleteDialog.item.id), {
            onSuccess: () => { toast.success(d.toast.deletedSuccess); setDeleteDialog({ isOpen: false, loading: false, item: null }); },
            onError: () => toast.error(d.toast.deleteFailed),
        });
    };

    const columns: ColumnDef<Lead>[] = [
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
        { accessorKey: 'name', header: d.columns.name },
        { accessorKey: 'email', header: d.columns.email, cell: ({ row }) => row.getValue('email') || '-' },
        { accessorKey: 'phone', header: d.columns.phone, cell: ({ row }) => row.getValue('phone') || '-' },
        {
            accessorKey: 'type',
            header: d.columns.type,
            cell: ({ row }) => <Badge variant="outline">{d.leadType[row.getValue('type') as keyof typeof d.leadType]}</Badge>,
        },
        {
            accessorKey: 'status',
            header: d.columns.status,
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                const colorMap: Record<string, string> = { new: 'bg-blue-500', in_progress: 'bg-yellow-500', closed: 'bg-gray-500' };
                return <Badge className={colorMap[status]}>{d.status[status as keyof typeof d.status]}</Badge>;
            },
        },
        {
            accessorKey: 'created_at',
            header: d.columns.date,
            cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleDateString('ar-LY'),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.leads.show', item.id))}><Eye className="w-4 h-4 ms-2" /> {d.actions.view}</DropdownMenuItem>
                            {item.status === 'new' && (
                                <DropdownMenuItem onClick={() => router.put(route('dashboard.leads.update', item.id), { status: 'in_progress' }, { onSuccess: () => toast.success(d.toast.updatedSuccess), onError: () => toast.error(d.toast.operationFailed) })}><CheckCircle className="w-4 h-4 ms-2 text-green-600" /> {d.actions.process}</DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setDeleteDialog({ isOpen: true, loading: false, item })} className="text-destructive"><Trash2 className="w-4 h-4 ms-2 text-destructive" /> {d.actions.delete}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const bulkActions = [
        {
            label: d.actions.process,
            action: (selectedRows: Lead[]) => {
                selectedRows.forEach((row) => {
                    router.put(route('dashboard.leads.update', row.id), { status: 'in_progress' }, {
                        onSuccess: () => toast.success(d.toast.updatedSuccess),
                        onError: () => toast.error(d.toast.operationFailed),
                    });
                });
            },
        },
        {
            label: `${d.actions.delete} ${d.entities.lead.plural}`,
            action: (selectedRows: Lead[]) => {
                router.post(route('dashboard.leads.bulk-actions'), { action: 'delete_selected', entries: selectedRows.map(r => r.id) }, {
                    onSuccess: () => toast.success(d.toast.deletedSuccess), onError: () => toast.error(d.toast.operationFailed)
                });
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={d.entities.lead.plural} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={leads.data}
                    title={d.entities.lead.plural}
                    description={d.entities.lead.description}
                    searchFields={['name', 'email', 'phone']}
                    bulkActions={bulkActions}
                    onRefresh={() => router.reload()}
                />
                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title={`${d.confirm.deleteTitle} ${d.entities.lead.singular}`}
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
