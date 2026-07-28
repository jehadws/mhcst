import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Lead, PaginatedData } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'الرسائل والاستفسارات', href: '/dashboard/leads/list' },
];

const statusLabels: Record<string, string> = { new: 'جديد', in_progress: 'قيد المعالجة', closed: 'مغلق' };
const statusColors: Record<string, string> = { new: 'bg-blue-500', in_progress: 'bg-yellow-500', closed: 'bg-gray-500' };
const typeLabels: Record<string, string> = { contact: 'تواصل', quote_request: 'طلب عرض سعر' };

export default function LeadsListPage() {
    const { leads } = usePage<{ leads: PaginatedData<Lead> }>().props;
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false, item: null as Lead | null });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item) return;
        router.delete(route('dashboard.leads.destroy', deleteDialog.item.id), {
            onSuccess: () => { toast.success('تم الحذف'); setDeleteDialog({ isOpen: false, loading: false, item: null }); },
            onError: () => toast.error('فشل الحذف'),
        });
    };

    const columns: ColumnDef<Lead>[] = [
        {
            id: 'select',
            header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} />,
            cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />,
            enableSorting: false,
            enableHiding: false,
        },
        { accessorKey: 'name', header: 'الاسم' },
        { accessorKey: 'email', header: 'البريد', cell: ({ row }) => row.getValue('email') || '-' },
        { accessorKey: 'phone', header: 'الهاتف', cell: ({ row }) => row.getValue('phone') || '-' },
        {
            accessorKey: 'type',
            header: 'النوع',
            cell: ({ row }) => <Badge variant="outline">{typeLabels[row.getValue('type') as string]}</Badge>,
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
            accessorKey: 'created_at',
            header: 'التاريخ',
            cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleDateString('ar-LY'),
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.leads.show', item.id))}><Eye className="w-4 h-4 ml-2" /> عرض</DropdownMenuItem>
                            {item.status === 'new' && (
                                <DropdownMenuItem onClick={() => router.put(route('dashboard.leads.update', item.id), { status: 'in_progress' })}><CheckCircle className="w-4 h-4 ml-2 text-green-600" /> معالجة</DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => setDeleteDialog({ isOpen: true, loading: false, item })} className="text-destructive"><Trash2 className="w-4 h-4 ml-2 text-destructive" /> حذف</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const bulkActions = [
        {
            label: 'تحديد كمُعالج',
            action: (selectedRows: Lead[]) => {
                selectedRows.forEach(row => router.put(route('dashboard.leads.update', row.id), { status: 'in_progress' }));
                toast.success('تم تحديث الحالة');
            },
        },
        {
            label: 'حذف المحدد',
            action: (selectedRows: Lead[]) => {
                router.post(route('dashboard.leads.bulk-actions'), { action: 'delete_selected', entries: selectedRows.map(r => r.id) }, {
                    onSuccess: () => toast.success('تم الحذف'), onError: () => toast.error('فشلت العملية')
                });
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="الرسائل والاستفسارات" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={leads.data}
                    title="الرسائل والاستفسارات"
                    description="رسائل التواصل وطلبات عروض الأسعار."
                    searchKey="search"
                    bulkActions={bulkActions}
                    onRefresh={() => router.reload()}
                />
                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title="حذف رسالة"
                    description="هل أنت متأكد من حذف هذه الرسالة؟"
                    confirmText="حذف"
                    cancelText="إلغاء"
                    variant="destructive"
                    loading={deleteDialog.loading}
                />
            </div>
        </AppLayout>
    );
}
