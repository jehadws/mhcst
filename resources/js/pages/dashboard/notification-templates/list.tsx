import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, NotificationTemplate } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table/data-table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Edit, Eye, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useState } from 'react';

export default function NotificationTemplatesListPage({ templates }: { templates: NotificationTemplate[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'قوالب الإشعارات', href: '/dashboard/notification-templates/list' },
    ];

    const [deleteItem, setDeleteItem] = useState<NotificationTemplate | null>(null);

    const handleDelete = () => {
        if (!deleteItem) return;
        router.delete(route('dashboard.notification-templates.destroy', deleteItem.id), {
            onSuccess: () => setDeleteItem(null),
        });
    };

    const columns: ColumnDef<NotificationTemplate>[] = [
        { accessorKey: 'name', header: 'الاسم' },
        {
            accessorKey: 'channel',
            header: 'القناة',
            cell: ({ row }) => (
                <Badge variant="secondary">{row.getValue('channel') === 'email' ? 'بريد' : 'واتساب'}</Badge>
            ),
        },
        { accessorKey: 'trigger_event', header: 'حدث التشغيل' },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.notification-templates.show', item.id))}>
                                <Eye className="w-4 h-4 ms-2" /> عرض
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.notification-templates.edit', item.id))}>
                                <Edit className="w-4 h-4 ms-2" /> تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteItem(item)} className="text-destructive">
                                <Trash2 className="w-4 h-4 ms-2 text-destructive" /> حذف
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="قوالب الإشعارات" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">قوالب الإشعارات</h1>
                    <Button onClick={() => router.get(route('dashboard.notification-templates.create'))} className="gap-2">
                        <Plus className="w-4 h-4" /> إضافة قالب
                    </Button>
                </div>

                <DataTable columns={columns} data={templates} />

                <ConfirmationDialog
                    isOpen={!!deleteItem}
                    onClose={() => setDeleteItem(null)}
                    onConfirm={handleDelete}
                    title="حذف القالب"
                    description="هل أنت متأكد من حذف هذا القالب؟"
                />
            </div>
        </AppLayout>
    );
}
