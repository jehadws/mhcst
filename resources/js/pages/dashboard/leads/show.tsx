import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Lead } from "@/types";
import { useSite } from "@/context/site-context";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
  lead: Lead;
}

export default function LeadShowPage({ lead }: Props) {
  const { t } = useSite();
  const d = t.dashboard;
  const [status, setStatus] = useState(lead.status);

  const handleUpdateStatus = () => {
    router.put(route('dashboard.leads.update', lead.id), { status }, {
      onSuccess: () => toast.success(d.toast.updatedSuccess),
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: d.sidebar.items.dashboard, href: '/dashboard' },
    { title: d.sidebar.items.leads, href: '/dashboard/leads/list' },
    { title: lead.name, href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={lead.name} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <Button variant="outline" onClick={() => router.get(route('dashboard.leads.list'))} className="w-fit">
          <ArrowRight className="w-4 h-4 ms-2" /> {d.show.backToList}
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{d.show.details} {d.entities.lead.singular}</CardTitle>
            <Badge>{d.leadType[lead.type as keyof typeof d.leadType] || lead.type}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-muted-foreground">{d.form.labels.name}:</span> {lead.name}</div>
              <div><span className="text-muted-foreground">{d.show.date}:</span> {new Date(lead.created_at).toLocaleString('ar-LY')}</div>
              <div><span className="text-muted-foreground">{d.show.emailLabel}:</span> {lead.email || '-'}</div>
              <div><span className="text-muted-foreground">{d.show.phoneLabel}:</span> {lead.phone || '-'}</div>
              {lead.subject && <div className="col-span-2"><span className="text-muted-foreground">{d.show.subject}:</span> {lead.subject}</div>}
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <p className="text-muted-foreground text-sm mb-1">{d.show.message}:</p>
              <p>{lead.message}</p>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
              <span className="text-muted-foreground">{d.show.statusHistory}:</span>
              <Select value={status} onValueChange={(v) => setStatus(v as 'new' | 'in_progress' | 'closed')}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{d.status.new}</SelectItem>
                  <SelectItem value="in_progress">{d.status.inProgress}</SelectItem>
                  <SelectItem value="closed">{d.status.closed}</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleUpdateStatus} disabled={status === lead.status}>{d.form.buttons.save}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
