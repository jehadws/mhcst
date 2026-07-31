import AppLayout from "@/layouts/app-layout";
import { useSite } from "@/context/site-context";
import { BreadcrumbItem, PaginatedData, Student } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function StudentsListPage() {
    const { students } = usePage<{ students: PaginatedData<Student> }>().props;
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.students, href: '/dashboard/students/list' },
    ];
    const [deleteDialog, setDeleteDialog] = useState({
        isOpen: false, loading: false, item: null as Student | null,
    });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item || deleteDialog.loading) return;
        setDeleteDialog(prev => ({ ...prev, loading: true }));

        router.delete(route('dashboard.students.destroy', deleteDialog.item.id), {
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

    const columns: ColumnDef<Student>[] = [
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
            accessorKey: 'full_name',
            header: d.columns.fullName,
        },
        {
            accessorKey: 'email',
            header: d.columns.email,
            cell: ({ row }) => row.getValue('email') || '-',
        },
        {
            accessorKey: 'phone',
            header: d.columns.phone,
        },
        {
            accessorKey: 'city',
            header: d.columns.city,
            cell: ({ row }) => row.getValue('city') || '-',
        },
        {
            accessorKey: 'enrollments_count',
            header: d.columns.enrollments,
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
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.students.show', item.id))}>
                                <Eye className="w-4 h-4 ms-2" /> {d.actions.view}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.students.edit', item.id))}>
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
            label: `${d.actions.delete} ${d.entities.student.plural}`,
            action: (selectedRows: Student[]) => {
                router.post(route('dashboard.students.bulk-actions'), {
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
            <Head title={d.entities.student.plural} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={students.data}
                    title={d.entities.student.plural}
                    description={d.entities.student.description}
                    searchFields={['full_name', 'email', 'phone']}
                    bulkActions={bulkActions}
                    onAddNew={() => router.get(route('dashboard.students.create'))}
                    onRefresh={() => router.reload()}
                />

                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title={`${d.confirm.deleteTitle} ${d.entities.student.singular}`}
                    description={`${d.confirm.deleteDescription} "${deleteDialog.item?.full_name}"؟`}
                    confirmText={d.actions.delete}
                    cancelText={d.actions.cancel}
                    variant="destructive"
                    loading={deleteDialog.loading}
                />
            </div>
        </AppLayout>
    );
}
