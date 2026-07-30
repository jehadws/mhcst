import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Category, PaginatedData } from "@/types";
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
    { title: 'التصنيفات', href: '/dashboard/categories/list' },
];

export default function CategoriesListPage() {
    const { categories } = usePage<{ categories: PaginatedData<Category> }>().props;
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false, item: null as Category | null });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item) return;
        router.delete(route('dashboard.categories.destroy', deleteDialog.item.id), {
            onSuccess: () => { toast.success('تم الحذف'); setDeleteDialog({ isOpen: false, loading: false, item: null }); },
            onError: () => toast.error('فشل الحذف'),
        });
    };

    const columns: ColumnDef<Category>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} />
            ),
            cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'name_ar',
            header: 'الاسم',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span className="text-lg">{row.original.icon}</span>
                    <span>{row.getValue('name_ar')}</span>
                </div>
            ),
        },
        { accessorKey: 'slug', header: 'المعرف' },
        { accessorKey: 'sort_order', header: 'الترتيب' },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.categories.show', item.id))}><Eye className="w-4 h-4 ml-2" /> عرض</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.categories.edit', item.id))}><Edit className="w-4 h-4 ml-2" /> تعديل</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteDialog({ isOpen: true, loading: false, item })} className="text-destructive"><Trash2 className="w-4 h-4 ml-2 text-destructive" /> حذف</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const bulkActions = [
        {
            label: 'حذف المحدد',
            action: (selectedRows: Category[]) => {
                router.post(route('dashboard.categories.bulk-actions'), { action: 'delete_selected', entries: selectedRows.map(r => r.id) }, {
                    onSuccess: () => toast.success('تم الحذف'), onError: () => toast.error('فشلت العملية')
                });
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="التصنيفات" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={categories.data}
                    title="التصنيفات"
                    description="تصنيفات الدورات التدريبية."
                    searchFields={['name_ar', 'name_en']}
                    bulkActions={bulkActions}
                    onAddNew={() => router.get(route('dashboard.categories.create'))}
                    onRefresh={() => router.reload()}
                />
                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title="حذف تصنيف"
                    description={`هل أنت متأكد من حذف "${deleteDialog.item?.name_ar}"؟`}
                    confirmText="حذف"
                    cancelText="إلغاء"
                    variant="destructive"
                    loading={deleteDialog.loading}
                />
            </div>
        </AppLayout>
    );
}
