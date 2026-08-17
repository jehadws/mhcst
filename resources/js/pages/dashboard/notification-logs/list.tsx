import AppLayout from '@/layouts/app-layout';
import { useSite } from '@/context/site-context';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table/data-table';
import { Badge } from '@/components/ui/badge';

interface NotificationLogRow {
    id: number;
    recipient: string;
    channel: 'email' | 'whatsapp';
    status: 'sent' | 'failed';
    sent_at: string;
    template?: { id: number; name: string; trigger_event: string } | null;
}

export default function NotificationLogsListPage({ logs }: { logs: NotificationLogRow[] }) {
    const { t } = useSite();
    const d = t.dashboard;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.notificationLogs, href: '/dashboard/notification-logs/list' },
    ];

    const columns: ColumnDef<NotificationLogRow>[] = [
        {
            accessorKey: 'sent_at',
            header: d.columns.sentAt,
            cell: ({ row }) => new Date(row.getValue('sent_at')).toLocaleString(),
        },
        { accessorKey: 'recipient', header: d.columns.recipient },
        {
            accessorKey: 'channel',
            header: d.columns.channel,
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {row.getValue('channel') === 'email' ? d.notificationLogs.channelEmail : d.notificationLogs.channelWhatsapp}
                </Badge>
            ),
        },
        {
            id: 'template',
            header: d.columns.template,
            cell: ({ row }) => row.original.template?.name ?? '—',
        },
        {
            accessorKey: 'status',
            header: d.columns.status,
            cell: ({ row }) => (
                <Badge variant={row.getValue('status') === 'sent' ? 'default' : 'destructive'}>
                    {row.getValue('status') === 'sent' ? d.notificationLogs.sent : d.notificationLogs.failed}
                </Badge>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={d.notificationLogs.title} />
            <div className="flex flex-col gap-4 p-4">
                <div>
                    <h1 className="text-2xl font-bold">{d.notificationLogs.title}</h1>
                    <p className="text-muted-foreground text-sm">{d.notificationLogs.description}</p>
                </div>
                <DataTable columns={columns} data={logs} />
            </div>
        </AppLayout>
    );
}
