import AppLayout from "@/layouts/app-layout";
import { useSite } from "@/context/site-context";
import { BreadcrumbItem, Enrollment, PaginatedData } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, MoreHorizontal, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function EnrollmentsListPage() {
    const { enrollments } = usePage<{ enrollments: PaginatedData<Enrollment> }>().props;
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.enrollments, href: '/dashboard/enrollments/list' },
    ];

    const columns: ColumnDef<Enrollment>[] = [
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
            accessorKey: 'course.title_ar',
            header: d.columns.course,
            cell: ({ row }) => row.original.course?.title_ar || '-',
        },
        {
            accessorKey: 'status',
            header: d.columns.status,
            cell: ({ row }) => <Badge variant="outline">{d.status[row.getValue('status') as keyof typeof d.status]}</Badge>,
        },
        {
            accessorKey: 'payment_status',
            header: d.columns.payment,
            cell: ({ row }) => {
                const ps = row.getValue('payment_status') as string;
                const colorMap: Record<string, string> = { unpaid: 'bg-red-500', partial: 'bg-yellow-500', paid: 'bg-green-500' };
                return <Badge className={colorMap[ps]}>{d.payment[ps as keyof typeof d.payment]}</Badge>;
            },
        },
        {
            accessorKey: 'amount_paid',
            header: d.columns.amount,
            cell: ({ row }) => `${row.original.amount_paid} / ${row.original.amount_due} د.ل`,
        },
        {
            accessorKey: 'source',
            header: d.columns.source,
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.enrollments.show', item.id))}><Eye className="w-4 h-4 ms-2" /> {d.actions.view}</DropdownMenuItem>
                            {item.status === 'pending' && (
                                <DropdownMenuItem onClick={() => router.post(route('dashboard.enrollments.status', item.id), { status: 'confirmed' }, { onSuccess: () => toast.success(d.toast.confirmedSuccess), onError: () => toast.error(d.toast.operationFailed) })}>
                                    <CheckCircle className="w-4 h-4 ms-2 text-green-600" /> {d.actions.confirm}
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
            label: d.actions.confirm,
            action: (selectedRows: Enrollment[]) => {
                selectedRows.forEach((row) => {
                    router.post(route('dashboard.enrollments.status', row.id), { status: 'confirmed' }, {
                        onSuccess: () => toast.success(d.toast.confirmedSuccess),
                        onError: () => toast.error(d.toast.operationFailed),
                    });
                });
            },
        },
        {
            label: `${d.actions.delete} ${d.entities.enrollment.plural}`,
            action: (selectedRows: Enrollment[]) => {
                router.post(route('dashboard.enrollments.bulk-actions'), {
                    action: 'delete_selected',
                    entries: selectedRows.map(r => r.id),
                }, { onSuccess: () => toast.success(d.toast.deletedSuccess), onError: () => toast.error(d.toast.operationFailed) });
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={d.entities.enrollment.plural} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={enrollments.data}
                    title={d.entities.enrollment.plural}
                    description={d.entities.enrollment.description}
                    searchFields={['full_name', 'email', 'phone']}
                    bulkActions={bulkActions}
                    onAddNew={() => router.get(route('dashboard.enrollments.create'))}
                    onRefresh={() => router.reload()}
                />
            </div>
        </AppLayout>
    );
}
