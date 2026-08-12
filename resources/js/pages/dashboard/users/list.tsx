import AppLayout from "@/layouts/app-layout";
import { useSite } from "@/context/site-context";
import { BreadcrumbItem, User } from "@/types";
import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { roleLabel } from "@/lib/dashboard-access";
import { toast } from "sonner";

interface UserRow extends User {
    roles?: string[];
}

interface Props {
    users: UserRow[];
}

export default function UsersListPage({ users = [] }: Props) {
    const { t, locale } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.users, href: '/dashboard/users/list' },
    ];
    const [deleteDialog, setDeleteDialog] = useState({
        isOpen: false, loading: false, item: null as User | null,
    });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item || deleteDialog.loading) return;
        setDeleteDialog(prev => ({ ...prev, loading: true }));

        router.delete(route('dashboard.users.destroy', deleteDialog.item.id), {
            onSuccess: () => {
                toast.success(d.toast.deletedSuccess);
                setDeleteDialog({ isOpen: false, loading: false, item: null });
            },
            onError: () => {
                toast.error(d.toast.deleteFailed);
                setDeleteDialog(prev => ({ ...prev, loading: false }));
            }
        });
    };

    const columns: ColumnDef<UserRow>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    className="ms-2"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    className="ms-2"
                    checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'name',
            header: d.columns.name,
        },
        {
            accessorKey: 'email',
            header: d.columns.email,
        },
        {
            id: 'roles',
            header: d.columns.roles,
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {(row.original.roles ?? []).map((role) => (
                        <Badge key={role} variant="secondary" className="text-xs">
                            {roleLabel(role, locale === 'ar' ? 'ar' : 'en')}
                        </Badge>
                    ))}
                </div>
            ),
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
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.users.show', item.id))}>
                                <Eye className="w-4 h-4 ms-2" /> {d.actions.view}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.users.edit', item.id))}>
                                <Edit className="w-4 h-4 ms-2" /> {d.actions.edit}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setDeleteDialog({ isOpen: true, loading: false, item })}
                                className="text-destructive"
                            >
                                <Trash2 className="w-4 h-4 ms-2 text-destructive" /> {d.actions.delete}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const bulkActions = [
        {
            label: `${d.actions.delete} ${d.entities.user.plural}`,
            action: (selectedRows: UserRow[]) => {
                router.post(route('dashboard.users.bulk-actions'), {
                    action: 'delete_selected',
                    entries: selectedRows.map(r => r.id),
                }, {
                    onSuccess: () => toast.success(d.toast.deletedSuccess),
                    onError: () => toast.error(d.toast.operationFailed),
                });
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={d.entities.user.plural} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={users}
                    title={d.entities.user.plural}
                    description={d.entities.user.description}
                    searchFields={['name', 'email']}
                    bulkActions={bulkActions}
                    onAddNew={() => router.get(route('dashboard.users.create'))}
                    onRefresh={() => router.reload()}
                />

                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title={`${d.confirm.deleteTitle} ${d.entities.user.singular}`}
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
