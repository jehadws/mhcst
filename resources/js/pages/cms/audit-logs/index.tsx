import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem, PaginatedData } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AuditLog {
    id: number;
    action: string;
    entity_type: string;
    entity_id: number | null;
    ip_address: string | null;
    created_at: string;
    user?: { id: number; name: string; email: string } | null;
}

export default function AuditLogsIndex({
    logs,
    filters,
}: {
    logs: PaginatedData<AuditLog>;
    filters: { entity_type?: string; action?: string };
}) {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.auditLog, href: '/cms/audit-logs' },
    ]);

    const applyFilter = (key: string, value: string) => {
        router.get('/cms/audit-logs', { ...filters, [key]: value || undefined }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.audit.title} />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">{c.audit.title}</h1>
                        <p className="text-sm text-muted-foreground">{c.audit.subtitle}</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/cms/settings">{c.nav.academicSettings}</Link>
                    </Button>
                </div>

                <div className="flex gap-3 flex-wrap">
                    <select
                        className="rounded-lg border bg-background px-3 py-2 text-sm"
                        value={filters.entity_type ?? ''}
                        onChange={(e) => applyFilter('entity_type', e.target.value)}
                    >
                        <option value="">{c.audit.allEntities}</option>
                        <option value="departments">{c.nav.departments}</option>
                        <option value="students">{c.nav.students}</option>
                        <option value="grades">{c.nav.grades}</option>
                        <option value="schedules">{c.nav.schedules}</option>
                        <option value="enrollments">{c.nav.enrollments}</option>
                    </select>
                    <select
                        className="rounded-lg border bg-background px-3 py-2 text-sm"
                        value={filters.action ?? ''}
                        onChange={(e) => applyFilter('action', e.target.value)}
                    >
                        <option value="">{c.audit.allActions}</option>
                        <option value="post">POST</option>
                        <option value="put">PUT</option>
                        <option value="delete">DELETE</option>
                    </select>
                </div>

                <div className="bg-card border rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-muted-foreground border-b">
                            <tr>
                                <th className="p-4 text-start font-semibold">{c.audit.date}</th>
                                <th className="p-4 text-start font-semibold">{c.audit.user}</th>
                                <th className="p-4 text-start font-semibold">{c.audit.action}</th>
                                <th className="p-4 text-start font-semibold">{c.audit.entity}</th>
                                <th className="p-4 text-start font-semibold">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        {c.audit.empty}
                                    </td>
                                </tr>
                            ) : (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-muted/30">
                                        <td className="p-4 text-xs whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="p-4">{log.user?.name ?? '—'}</td>
                                        <td className="p-4">
                                            <Badge variant="outline">{log.action.toUpperCase()}</Badge>
                                        </td>
                                        <td className="p-4 font-mono text-xs">
                                            {log.entity_type}
                                            {log.entity_id ? ` #${log.entity_id}` : ''}
                                        </td>
                                        <td className="p-4 text-xs text-muted-foreground">{log.ip_address ?? '—'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
