import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, PaginatedData } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'الشهادات', href: '/dashboard/certificates/list' },
];

export default function CertificatesListPage() {
    const { certificates } = usePage<{ certificates: PaginatedData<Certificate> }>().props;
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false, item: null as Certificate | null });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item) return;
        router.delete(route('dashboard.certificates.destroy', deleteDialog.item.id), {
            onSuccess: () => { toast.success('تم الحذف'); setDeleteDialog({ isOpen: false, loading: false, item: null }); },
            onError: () => toast.error('فشل الحذف'),
        });
    };

    const columns: ColumnDef<Certificate>[] = [
        {
            id: 'select',
            header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} />,
            cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />,
            enableSorting: false,
            enableHiding: false,
        },
        { accessorKey: 'certificate_number', header: 'رقم الشهادة' },
        {
            accessorKey: 'student.full_name',
            header: 'المتدرب',
            cell: ({ row }) => row.original.student?.full_name || '-',
        },
        {
            accessorKey: 'course.title_ar',
            header: 'الدورة',
            cell: ({ row }) => row.original.course?.title_ar || '-',
        },
        {
            accessorKey: 'issued_at',
            header: 'تاريخ الإصدار',
            cell: ({ row }) => new Date(row.getValue('issued_at')).toLocaleDateString('ar-LY'),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.certificates.show', item.id))}><Eye className="w-4 h-4 ml-2" /> عرض</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`/storage/${item.file_path}`, '_blank')}><Download className="w-4 h-4 ml-2" /> تحميل</DropdownMenuItem>
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
            action: (selectedRows: Certificate[]) => {
                router.post(route('dashboard.certificates.bulk-actions'), { action: 'delete_selected', entries: selectedRows.map(r => r.id) }, {
                    onSuccess: () => toast.success('تم الحذف'), onError: () => toast.error('فشلت العملية')
                });
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="الشهادات" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={certificates.data}
                    title="الشهادات المعتمدة"
                    description="الشهادات المُصدّرة للمتدربين."
                    searchFields={['certificate_number', 'student.full_name', 'course.title_ar', 'course.title_en']}
                    bulkActions={bulkActions}
                    onAddNew={() => router.get(route('dashboard.certificates.create'))}
                    onRefresh={() => router.reload()}
                />
                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title="حذف شهادة"
                    description={`هل أنت متأكد من حذف الشهادة "${deleteDialog.item?.certificate_number}"؟`}
                    confirmText="حذف"
                    cancelText="إلغاء"
                    variant="destructive"
                    loading={deleteDialog.loading}
                />
            </div>
        </AppLayout>
    );
}
