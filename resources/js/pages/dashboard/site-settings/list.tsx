import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SiteSetting } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'إعدادات الموقع', href: '/dashboard/site-settings/list' },
];

const typeLabels: Record<string, string> = { text: 'نص', image: 'صورة', json: 'JSON' };
const typeColors: Record<string, string> = { text: 'bg-blue-500', image: 'bg-purple-500', json: 'bg-orange-500' };

export default function SiteSettingsListPage() {
    const { settings } = usePage<{ settings: Record<string, SiteSetting> }>().props;

    const data = Object.values(settings);

    const columns: ColumnDef<SiteSetting>[] = [
        {
            id: 'select',
            header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} />,
            cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />,
            enableSorting: false,
            enableHiding: false,
        },
        { accessorKey: 'key', header: 'المفتاح' },
        {
            accessorKey: 'value',
            header: 'القيمة',
            cell: ({ row }) => {
                const type = row.original.type;
                const value = row.getValue('value') as string;
                if (type === 'image') return <img src={`/storage/${value}`} alt="" className="w-12 h-12 object-cover rounded" />;
                if (type === 'json') return <span className="text-xs font-mono text-muted-foreground">{value?.substring(0, 50)}...</span>;
                return <span className="line-clamp-1 max-w-xs">{value}</span>;
            },
        },
        {
            accessorKey: 'type',
            header: 'النوع',
            cell: ({ row }) => {
                const type = row.getValue('type') as string;
                return <Badge className={typeColors[type]}>{typeLabels[type]}</Badge>;
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
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.site-settings.edit', item.id))}><Edit className="w-4 h-4 ml-2" /> تعديل</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="إعدادات الموقع" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={data}
                    title="إعدادات الموقع"
                    description="إدارة الإعدادات العامة للمنصة."
                    searchKey="search"
                    onAddNew={() => router.get(route('dashboard.site-settings.create'))}
                    onRefresh={() => router.reload()}
                />
            </div>
        </AppLayout>
    );
}
