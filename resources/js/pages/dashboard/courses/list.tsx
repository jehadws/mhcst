import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Course, PaginatedData } from "@/types";
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
    { title: 'الدورات', href: '/dashboard/courses/list' },
];

const levelLabels: Record<string, string> = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
};

const statusColors: Record<string, string> = {
    draft: 'bg-gray-500',
    published: 'bg-green-500',
    archived: 'bg-red-500',
};

const statusLabels: Record<string, string> = {
    draft: 'مسودة',
    published: 'منشور',
    archived: 'مؤرشف',
};

export default function CoursesListPage() {
    const { courses } = usePage<{ courses: PaginatedData<Course> }>().props;
    const [deleteDialog, setDeleteDialog] = useState({
        isOpen: false, loading: false, item: null as Course | null,
    });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item) return;
        router.delete(route('dashboard.courses.destroy', deleteDialog.item.id), {
            onSuccess: () => {
                toast.success('تم الحذف');
                setDeleteDialog({ isOpen: false, loading: false, item: null });
            },
            onError: () => toast.error('فشل الحذف'),
        });
    };

    const columns: ColumnDef<Course>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} />
            ),
            cell: ({ row }) => (
                <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'title_ar',
            header: 'عنوان الدورة',
        },
        {
            accessorKey: 'category.name_ar',
            header: 'التصنيف',
            cell: ({ row }) => row.original.category?.name_ar || '-',
        },
        {
            accessorKey: 'level',
            header: 'المستوى',
            cell: ({ row }) => levelLabels[row.getValue('level') as string] || row.getValue('level'),
        },
        {
            accessorKey: 'price',
            header: 'السعر',
            cell: ({ row }) => `${row.getValue('price')} د.ل`,
        },
        {
            accessorKey: 'status',
            header: 'الحالة',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>;
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
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.courses.show', item.id))}><Eye className="w-4 h-4 ml-2" /> عرض</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.courses.edit', item.id))}><Edit className="w-4 h-4 ml-2" /> تعديل</DropdownMenuItem>
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
            action: (selectedRows: Course[]) => {
                router.post(route('dashboard.courses.bulk-actions'), {
                    action: 'delete_selected',
                    entries: selectedRows.map(r => r.id),
                }, { onSuccess: () => toast.success('تم الحذف'), onError: () => toast.error('فشلت العملية') });
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="الدورات" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={courses.data}
                    title="الدورات التدريبية"
                    description="إدارة الدورات والمحتوى التدريبي."
                    searchKey="search"
                    bulkActions={bulkActions}
                    onAddNew={() => router.get(route('dashboard.courses.create'))}
                    onRefresh={() => router.reload()}
                />
                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title="حذف دورة"
                    description={`هل أنت متأكد من حذف "${deleteDialog.item?.title_ar}"؟`}
                    confirmText="حذف"
                    cancelText="إلغاء"
                    variant="destructive"
                    loading={deleteDialog.loading}
                />
            </div>
        </AppLayout>
    );
}
