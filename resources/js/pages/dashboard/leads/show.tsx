import AppLayout from '@/layouts/app-layout';
import { useSite } from '@/context/site-context';
import { BreadcrumbItem, Lead } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Mail, Phone, Trash2 } from 'lucide-react';
import ConfirmationDialog from '@/components/confirmation-dialog';
import { useState } from 'react';
import { toast } from 'sonner';

export default function LeadShowPage({ lead }: { lead: Lead }) {
    const { t } = useSite();
    const d = t.dashboard;
    const [deleteOpen, setDeleteOpen] = useState(false);

    const { data, setData, put, processing } = useForm({
        status: lead.status,
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.leads, href: '/dashboard/leads/list' },
        { title: lead.name, href: '#' },
    ];

    const handleStatusSave = () => {
        put(route('dashboard.leads.update', lead.id), {
            preserveScroll: true,
            onSuccess: () => toast.success(d.toast.savedSuccess),
            onError: () => toast.error(d.siteContent.validationError),
        });
    };

    const handleDelete = () => {
        router.delete(route('dashboard.leads.destroy', lead.id), {
            onSuccess: () => toast.success(d.toast.deletedSuccess),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={lead.subject || lead.name} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.leads.list'))}>
                        <ArrowRight className="ms-2 h-4 w-4" /> {d.show.backToList}
                    </Button>
                    <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                        <Trash2 className="ms-2 h-4 w-4" /> {d.actions.delete}
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div>
                            <CardTitle>{lead.subject || d.leads.noSubject}</CardTitle>
                            <p className="text-muted-foreground mt-1 text-sm">{lead.name}</p>
                        </div>
                        <Badge>{d.leads.status[lead.status]}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2">
                            {lead.email && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="text-muted-foreground size-4" />
                                    <a href={`mailto:${lead.email}`} className="text-primary hover:underline" dir="ltr">
                                        {lead.email}
                                    </a>
                                </div>
                            )}
                            {lead.phone && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="text-muted-foreground size-4" />
                                    <span dir="ltr">{lead.phone}</span>
                                </div>
                            )}
                        </div>
                        <div className="bg-muted/30 rounded-lg border p-4">
                            <p className="text-sm leading-relaxed whitespace-pre-line">{lead.message}</p>
                        </div>
                        <p className="text-muted-foreground text-xs">
                            {d.columns.createdAt}: {new Date(lead.created_at).toLocaleString()}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{d.leads.updateStatus}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap items-end gap-3">
                        <div className="min-w-[200px] space-y-2">
                            <Label>{d.columns.status}</Label>
                            <Select value={data.status} onValueChange={(value) => setData('status', value as Lead['status'])}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="new">{d.leads.status.new}</SelectItem>
                                    <SelectItem value="in_progress">{d.leads.status.in_progress}</SelectItem>
                                    <SelectItem value="closed">{d.leads.status.closed}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleStatusSave} disabled={processing || data.status === lead.status}>
                            {d.form.buttons.save}
                        </Button>
                    </CardContent>
                </Card>

                <ConfirmationDialog
                    isOpen={deleteOpen}
                    onClose={() => setDeleteOpen(false)}
                    onConfirm={handleDelete}
                    title={d.leads.deleteTitle}
                    description={d.leads.deleteDescription}
                />
            </div>
        </AppLayout>
    );
}
