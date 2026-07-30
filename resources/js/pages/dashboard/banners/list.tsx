import AppLayout from "@/layouts/app-layout";
import { Banner, BreadcrumbItem } from "@/types";
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'البنرات', href: '/dashboard/banners/list' },
];

export default function BannersListPage() {
    const { banners } = usePage<{ banners: Banner[] }>().props;
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false, item: null as Banner | null });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item) return;
        router.delete(route('dashboard.banners.destroy', deleteDialog.item.id), {
            onSuccess: () => { toast.success('تم الحذف'); setDeleteDialog({ isOpen: false, loading: false, item: null }); },
            onError: () => toast.error('فشل الحذف'),
        });
    };

    const columns: ColumnDef<Banner>[] = [
        {
            id: 'select',
            header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} />,
            cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />,
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'image',
            header: 'الصورة',
            cell: ({ row }) => (
                <img src={row.original.image.startsWith('http') ? row.original.image : `/storage/${row.original.image}`} alt="" className="w-20 h-12 object-cover rounded" />
            ),
        },
        { accessorKey: 'title', header: 'العنوان', cell: ({ row }) => row.getValue('title') || '-' },
        { accessorKey: 'subtitle', header: 'الوصف', cell: ({ row }) => <span className="line-clamp-1 max-w-xs">{row.original.subtitle || '-'}</span> },
        {
            accessorKey: 'is_active',
            header: 'الحالة',
            cell: ({ row }) => (
                <Badge className={row.getValue('is_active') ? 'bg-green-500' : 'bg-gray-500'}>
                    {row.getValue('is_active') ? 'نشط' : 'معطل'}
                </Badge>
            ),
        },
        { accessorKey: 'sort_order', header: 'الترتيب' },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.banners.show', item.id))}><Eye className="w-4 h-4 ml-2" /> عرض</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.banners.edit', item.id))}><Edit className="w-4 h-4 ml-2" /> تعديل</DropdownMenuItem>
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
            action: (selectedRows: Banner[]) => {
                router.post(route('dashboard.banners.bulk-actions'), { action: 'delete_selected', entries: selectedRows.map(r => r.id) }, {
                    onSuccess: () => toast.success('تم الحذف'), onError: () => toast.error('فشلت العملية')
                });
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="البنرات" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={banners}
                    title="البنرات الإعلانية"
                    description="الصور المعروضة في الصفحة الرئيسية."
                    searchFields={['title', 'subtitle']}
                    bulkActions={bulkActions}
                    onAddNew={() => router.get(route('dashboard.banners.create'))}
                    onRefresh={() => router.reload()}
                />
                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title="حذف بنر"
                    description="هل أنت متأكد من حذف هذا البنر؟"
                    confirmText="حذف"
                    cancelText="إلغاء"
                    variant="destructive"
                    loading={deleteDialog.loading}
                />
            </div>
        </AppLayout>
    );
}
