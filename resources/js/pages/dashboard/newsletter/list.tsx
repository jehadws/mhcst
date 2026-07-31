import AppLayout from "@/layouts/app-layout";
import { useSite } from "@/context/site-context";
import { BreadcrumbItem, NewsletterSubscriber, PaginatedData } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function NewsletterListPage() {
    const { subscribers } = usePage<{ subscribers: PaginatedData<NewsletterSubscriber> }>().props;
    const { t, locale } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.newsletter, href: '/dashboard/newsletter/list' },
    ];
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false, item: null as NewsletterSubscriber | null });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item) return;
        setDeleteDialog((prev) => ({ ...prev, loading: true }));
        router.delete(route('dashboard.newsletter.destroy', deleteDialog.item.id), {
            onSuccess: () => { toast.success(d.toast.deletedSuccess); setDeleteDialog({ isOpen: false, loading: false, item: null }); },
            onError: () => toast.error(d.toast.deleteFailed),
        });
    };

    const columns: ColumnDef<NewsletterSubscriber>[] = [
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
        { accessorKey: 'email', header: d.columns.email, cell: ({ row }) => <span dir="ltr">{row.getValue('email')}</span> },
        { accessorKey: 'name', header: d.columns.name, cell: ({ row }) => row.getValue('name') || '-' },
        {
            accessorKey: 'is_active',
            header: d.columns.status,
            cell: ({ row }) => row.getValue('is_active') ? <Badge className="bg-emerald-500">{d.status.active}</Badge> : <Badge variant="secondary">{d.status.inactive}</Badge>,
        },
        {
            accessorKey: 'subscribed_at',
            header: d.columns.date,
            cell: ({ row }) => {
                const date = row.getValue('subscribed_at') as string | null;
                return date ? new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-GB') : '-';
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDeleteDialog({ isOpen: true, loading: false, item })} className="text-destructive"><Trash2 className="w-4 h-4 ms-2 text-destructive" /> {d.actions.delete}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const bulkActions = [
        {
            label: `${d.actions.delete} ${d.entities.newsletterSubscriber.plural}`,
            action: (selectedRows: NewsletterSubscriber[]) => {
                router.post(route('dashboard.newsletter.bulk-actions'), { action: 'delete_selected', entries: selectedRows.map(r => r.id) }, {
                    onSuccess: () => toast.success(d.toast.deletedSuccess), onError: () => toast.error(d.toast.operationFailed)
                });
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={d.entities.newsletterSubscriber.plural} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={subscribers.data}
                    title={d.entities.newsletterSubscriber.plural}
                    description={d.entities.newsletterSubscriber.description}
                    searchFields={['email', 'name']}
                    bulkActions={bulkActions}
                    onRefresh={() => router.reload()}
                />
                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title={`${d.confirm.deleteTitle} ${d.entities.newsletterSubscriber.singular}`}
                    description={`${d.confirm.deleteDescription} "${deleteDialog.item?.email}"؟`}
                    confirmText={d.actions.delete}
                    cancelText={d.actions.cancel}
                    variant="destructive"
                    loading={deleteDialog.loading}
                />
            </div>
        </AppLayout>
    );
}
