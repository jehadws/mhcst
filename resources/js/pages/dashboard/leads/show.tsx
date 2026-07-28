import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Lead } from "@/types";
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

const statusLabels: Record<string, string> = { new: 'جديد', in_progress: 'قيد المعالجة', closed: 'مغلق' };
const typeLabels: Record<string, string> = { contact: 'تواصل', quote_request: 'طلب عرض سعر' };

export default function LeadShowPage({ lead }: Props) {
  const [status, setStatus] = useState(lead.status);

  const handleUpdateStatus = () => {
    router.put(route('dashboard.leads.update', lead.id), { status }, {
      onSuccess: () => toast.success('تم تحديث الحالة'),
    });
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'الرسائل', href: '/dashboard/leads/list' },
    { title: lead.name, href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={lead.name} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 max-w-3xl mx-auto">
        <Button variant="outline" onClick={() => router.get(route('dashboard.leads.list'))} className="w-fit">
          <ArrowRight className="w-4 h-4 ml-2" /> رجوع
        </Button>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>تفاصيل الرسالة</CardTitle>
            <Badge>{typeLabels[lead.type]}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-muted-foreground">الاسم:</span> {lead.name}</div>
              <div><span className="text-muted-foreground">التاريخ:</span> {new Date(lead.created_at).toLocaleString('ar-LY')}</div>
              <div><span className="text-muted-foreground">البريد:</span> {lead.email || '-'}</div>
              <div><span className="text-muted-foreground">الهاتف:</span> {lead.phone || '-'}</div>
              {lead.subject && <div className="col-span-2"><span className="text-muted-foreground">الموضوع:</span> {lead.subject}</div>}
            </div>

            <div className="border rounded-lg p-4 bg-muted/50">
              <p className="text-muted-foreground text-sm mb-1">الرسالة:</p>
              <p>{lead.message}</p>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t">
              <span className="text-muted-foreground">تحديث الحالة:</span>
              <Select value={status} onValueChange={(v) => setStatus(v as 'new' | 'in_progress' | 'closed')}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">جديد</SelectItem>
                  <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                  <SelectItem value="closed">مغلق</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleUpdateStatus} disabled={status === lead.status}>حفظ</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}