import AppLayout from '@/layouts/app-layout';
import { useSite } from '@/context/site-context';
import { BreadcrumbItem, Lead } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MoreHorizontal, Trash2 } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useState } from 'react';
import { toast } from 'sonner';

const statusVariant = (status: Lead['status']) => {
    if (status === 'new') return 'default';
    if (status === 'in_progress') return 'secondary';
    return 'outline';
};

export default function LeadsListPage({ leads }: { leads: Lead[] }) {
    const { t } = useSite();
    const d = t.dashboard;
    const [deleteItem, setDeleteItem] = useState<Lead | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.leads, href: '/dashboard/leads/list' },
    ];

    const statusLabel = (status: Lead['status']) => d.leads.status[status];

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(route('dashboard.leads.destroy', deleteItem.id), {
            onSuccess: () => {
                toast.success(d.toast.deletedSuccess);
                setDeleteItem(null);
            },
            onError: () => toast.error(d.toast.deleteFailed),
        });
    };

    const columns: ColumnDef<Lead>[] = [
        { accessorKey: 'name', header: d.columns.name },
        { accessorKey: 'email', header: d.columns.email },
        {
            accessorKey: 'subject',
            header: d.columns.subject,
            cell: ({ row }) => row.getValue('subject') || '—',
        },
        {
            accessorKey: 'status',
            header: d.columns.status,
            cell: ({ row }) => (
                <Badge variant={statusVariant(row.original.status)}>
                    {statusLabel(row.original.status)}
                </Badge>
            ),
        },
        {
            accessorKey: 'created_at',
            header: d.columns.createdAt,
            cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleString(),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.leads.show', item.id))}>
                                <Eye className="ms-2 h-4 w-4" /> {d.actions.view}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteItem(item)} className="text-destructive">
                                <Trash2 className="ms-2 h-4 w-4 text-destructive" /> {d.actions.delete}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={d.entities.lead.plural} />
            <div className="flex flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">{d.entities.lead.plural}</h1>
                    <p className="text-muted-foreground text-sm">{d.entities.lead.description}</p>
                </div>
                <DataTable columns={columns} data={leads} />
                <ConfirmationDialog
                    isOpen={!!deleteItem}
                    onClose={() => setDeleteItem(null)}
                    onConfirm={handleDelete}
                    title={d.leads.deleteTitle}
                    description={d.leads.deleteDescription}
                />
            </div>
        </AppLayout>
    );
}
