import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SiteSetting } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  setting?: SiteSetting;
}

export default function SiteSettingFormPage({ setting }: Props) {
  const isEditing = !!setting;

  const { data, setData, post, put, processing, errors } = useForm({
    key: setting?.key || '',
    value: setting?.value || '',
    type: setting?.type || 'text',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(route('dashboard.site-settings.update', setting!.id));
    } else {
      post(route('dashboard.site-settings.store'));
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'إعدادات الموقع', href: '/dashboard/site-settings/list' },
    { title: isEditing ? 'تعديل' : 'إضافة', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEditing ? 'تعديل إعداد' : 'إضافة إعداد'} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader><CardTitle>{isEditing ? 'تعديل الإعداد' : 'إعداد جديد'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="key">المفتاح *</Label>
                <Input id="key" value={data.key} onChange={e => setData('key', e.target.value)} dir="ltr" disabled={isEditing} />
                {errors.key && <p className="text-sm text-red-500 mt-1">{errors.key}</p>}
              </div>

              <div>
                <Label htmlFor="type">النوع *</Label>
                <Select value={data.type} onValueChange={(v) => setData('type', v as 'text' | 'image' | 'json')} disabled={isEditing}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">نص</SelectItem>
                    <SelectItem value="image">صورة</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">القيمة *</Label>
                {data.type === 'json' ? (
                  <Textarea id="value" value={data.value} onChange={e => setData('value', e.target.value)} rows={6} dir="ltr" />
                ) : data.type === 'image' ? (
                  <Input id="value" type="file" onChange={e => setData('value', e.target.files?.[0] || '')} />
                ) : (
                  <Input id="value" value={data.value} onChange={e => setData('value', e.target.value)} />
                )}
                {errors.value && <p className="text-sm text-red-500 mt-1">{errors.value}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.site-settings.list'))}>إلغاء</Button>
                <Button type="submit" disabled={processing}>{processing ? 'جاري...' : isEditing ? 'تحديث' : 'حفظ'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}