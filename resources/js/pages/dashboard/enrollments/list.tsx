import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Enrollment, PaginatedData } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'التسجيلات', href: '/dashboard/enrollments/list' },
];

const statusLabels: Record<string, string> = {
    pending: 'معلق',
    confirmed: 'مؤكد',
    completed: 'مكتمل',
    cancelled: 'ملغي',
};

const paymentLabels: Record<string, string> = {
    unpaid: 'غير مدفوع',
    partial: 'جزئي',
    paid: 'مدفوع',
};

const paymentColors: Record<string, string> = {
    unpaid: 'bg-red-500',
    partial: 'bg-yellow-500',
    paid: 'bg-green-500',
};

export default function EnrollmentsListPage() {
    const { enrollments } = usePage<{ enrollments: PaginatedData<Enrollment> }>().props;

    const columns: ColumnDef<Enrollment>[] = [
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
            accessorKey: 'full_name',
            header: 'اسم المتدرب',
        },
        {
            accessorKey: 'course.title_ar',
            header: 'الدورة',
            cell: ({ row }) => row.original.course?.title_ar || '-',
        },
        {
            accessorKey: 'status',
            header: 'الحالة',
            cell: ({ row }) => <Badge variant="outline">{statusLabels[row.getValue('status') as string]}</Badge>,
        },
        {
            accessorKey: 'payment_status',
            header: 'الدفع',
            cell: ({ row }) => {
                const ps = row.getValue('payment_status') as string;
                return <Badge className={paymentColors[ps]}>{paymentLabels[ps]}</Badge>;
            },
        },
        {
            accessorKey: 'amount_paid',
            header: 'المبلغ',
            cell: ({ row }) => `${row.original.amount_paid} / ${row.original.amount_due} د.ل`,
        },
        {
            accessorKey: 'source',
            header: 'المصدر',
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.enrollments.show', item.id))}><Eye className="w-4 h-4 ml-2" /> عرض</DropdownMenuItem>
                            {item.status === 'pending' && (
                                <DropdownMenuItem onClick={() => router.post(route('dashboard.enrollments.status', item.id), { status: 'confirmed' })}>
                                    <CheckCircle className="w-4 h-4 ml-2 text-green-600" /> تأكيد
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const bulkActions = [
        {
            label: 'تأكيد المحدد',
            action: (selectedRows: Enrollment[]) => {
                selectedRows.forEach(row => {
                    router.post(route('dashboard.enrollments.status', row.id), { status: 'confirmed' });
                });
                toast.success('تم تأكيد التسجيلات');
            },
        },
        {
            label: 'حذف المحدد',
            action: (selectedRows: Enrollment[]) => {
                router.post(route('dashboard.enrollments.bulk-actions'), {
                    action: 'delete_selected',
                    entries: selectedRows.map(r => r.id),
                }, { onSuccess: () => toast.success('تم الحذف') });
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="التسجيلات" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={enrollments.data}
                    title="التسجيلات"
                    description="إدارة طلبات التسجيل في الدورات."
                    searchKey="search"
                    bulkActions={bulkActions}
                    onAddNew={() => router.get(route('dashboard.enrollments.create'))}
                    onRefresh={() => router.reload()}
                />
            </div>
        </AppLayout>
    );
}
