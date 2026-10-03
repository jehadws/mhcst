import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { useSite } from '@/context/site-context';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ColumnDef } from '@tanstack/react-table';

interface NotificationLogRow {
  id: number;
  recipient: string;
  channel: 'email' | 'whatsapp';
  status: 'sent' | 'failed';
  error_message?: string | null;
  trigger_event?: string | null;
  sent_at: string;
  template?: { id: number; name: string; trigger_event: string } | null;
}

const STATUS_FILTERS = ['all', 'sent', 'failed'] as const;

export default function NotificationLogsListPage({
  logs,
  status,
  counts,
}: {
  logs: NotificationLogRow[];
  status?: 'sent' | 'failed' | null;
  counts: { all: number; sent: number; failed: number };
}) {
  const { t } = useSite();
  const d = t.dashboard;
  const n = d.notificationLogs;

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
      cell: ({ row }) => <Badge variant="secondary">{row.getValue('channel') === 'email' ? n.channelEmail : n.channelWhatsapp}</Badge>,
    },
    {
      id: 'event',
      header: n.triggerEvent,
      cell: ({ row }) => (
        <span className="font-mono text-xs" dir="ltr">
          {row.original.trigger_event ?? row.original.template?.trigger_event ?? '—'}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: d.columns.status,
      cell: ({ row }) => (
        <Badge variant={row.getValue('status') === 'sent' ? 'default' : 'destructive'}>{row.getValue('status') === 'sent' ? n.sent : n.failed}</Badge>
      ),
    },
    {
      accessorKey: 'error_message',
      header: n.error,
      cell: ({ row }) => {
        const error = row.original.error_message;
        if (!error) return <span className="text-muted-foreground">—</span>;
        return <span className="text-destructive max-w-[26rem] text-xs break-words">{error}</span>;
      },
    },
  ];

  const countFor = (filter: (typeof STATUS_FILTERS)[number]) => (filter === 'all' ? counts.all : counts[filter]);

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={n.title} />
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-3xl leading-snug font-extrabold">{n.title}</h1>
          <p className="text-muted-foreground text-sm">{n.description}</p>
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={n.filterLabel}>
          {STATUS_FILTERS.map((filter) => (
            <Button
              key={filter}
              asChild
              size="sm"
              variant="outline"
              className={cn('gap-2', (status ?? 'all') === filter && 'bg-primary text-primary-foreground hover:bg-primary/90')}
            >
              <Link
                href={filter === 'all' ? route('dashboard.notification-logs.list') : route('dashboard.notification-logs.list', { status: filter })}
              >
                {filter === 'all' ? n.all : filter === 'sent' ? n.sent : n.failed}
                <span className="font-mono text-xs opacity-70">{countFor(filter)}</span>
              </Link>
            </Button>
          ))}
        </div>
        <DataTable columns={columns} data={logs} />
      </div>
    </AppLayout>
  );
}
