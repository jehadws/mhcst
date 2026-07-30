import AppLayout from "@/layouts/app-layout";
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'المتدربين', href: '/dashboard/students/list' },
];

export default function StudentsListPage() {
    const { students } = usePage<{ students: PaginatedData<Student> }>().props;
    const [deleteDialog, setDeleteDialog] = useState({
        isOpen: false, loading: false, item: null as Student | null,
    });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item || deleteDialog.loading) return;
        setDeleteDialog(prev => ({ ...prev, loading: true }));

        router.delete(route('dashboard.students.destroy', deleteDialog.item.id), {
            onSuccess: () => {
                toast.success('تم الحذف بنجاح');
                setDeleteDialog({ isOpen: false, loading: false, item: null });
            },
            onError: () => {
                toast.error('فشل الحذف');
                setDeleteDialog(prev => ({ ...prev, loading: false }));
            }
        });
    };

    const columns: ColumnDef<Student>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'full_name',
            header: 'الاسم الكامل',
        },
        {
            accessorKey: 'email',
            header: 'البريد الإلكتروني',
            cell: ({ row }) => row.getValue('email') || '-',
        },
        {
            accessorKey: 'phone',
            header: 'الهاتف',
        },
        {
            accessorKey: 'city',
            header: 'المدينة',
            cell: ({ row }) => row.getValue('city') || '-',
        },
        {
            accessorKey: 'enrollments_count',
            header: 'التسجيلات',
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
                                <Eye className="w-4 h-4 ml-2" /> عرض
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.students.edit', item.id))}>
                                <Edit className="w-4 h-4 ml-2" /> تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setDeleteDialog({ isOpen: true, loading: false, item })}
                                className="text-destructive"
                            >
                                <Trash2 className="w-4 h-4 ml-2 text-destructive" /> حذف
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const bulkActions = [
        {
            label: 'حذف المحدد',
            action: (selectedRows: Student[]) => {
                router.post(route('dashboard.students.bulk-actions'), {
                    action: 'delete_selected',
                    entries: selectedRows.map(r => r.id),
                }, {
                    onSuccess: () => toast.success('تم الحذف بنجاح'),
                    onError: () => toast.error('فشلت العملية'),
                });
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="المتدربين" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={students.data}
                    title="المتدربين"
                    description="إدارة بيانات المتدربين المسجلين في المنصة."
                    searchFields={['full_name', 'email', 'phone']}
                    bulkActions={bulkActions}
                    onAddNew={() => router.get(route('dashboard.students.create'))}
                    onRefresh={() => router.reload()}
                />

                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title="حذف متدرب"
                    description={`هل أنت متأكد من حذف "${deleteDialog.item?.full_name}"؟`}
                    confirmText="حذف"
                    cancelText="إلغاء"
                    variant="destructive"
                    loading={deleteDialog.loading}
                />
            </div>
        </AppLayout>
    );
}
