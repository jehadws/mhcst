import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  page?: { id: number; key: string; title: string; content: string };
}

export default function CmsPageFormPage({ page }: Props) {
  const isEditing = !!page;
  const { data, setData, post, put, processing, errors } = useForm({
    key: page?.key || '',
    title: page?.title || '',
    content: page?.content || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) put(route('dashboard.cms-pages.update', page!.id));
    else post(route('dashboard.cms-pages.store'));
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'الصفحات', href: '/dashboard/cms-pages/list' },
    { title: isEditing ? 'تعديل' : 'إضافة', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEditing ? 'تعديل صفحة' : 'صفحة جديدة'} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 max-w-3xl mx-auto">
        <Card>
          <CardHeader><CardTitle>{isEditing ? 'تعديل الصفحة' : 'صفحة جديدة'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="key">المعرف (Key) *</Label>
                <Input id="key" value={data.key} onChange={e => setData('key', e.target.value)} dir="ltr" disabled={isEditing} placeholder="about-us" />
                {errors.key && <p className="text-sm text-red-500 mt-1">{errors.key}</p>}
              </div>
              <div>
                <Label htmlFor="title">العنوان *</Label>
                <Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
              </div>
              <div>
                <Label htmlFor="content">المحتوى (HTML) *</Label>
                <Textarea id="content" value={data.content} onChange={e => setData('content', e.target.value)} rows={15} className="font-mono" dir="ltr" />
                {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content}</p>}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.cms-pages.list'))}>إلغاء</Button>
                <Button type="submit" disabled={processing}>{processing ? 'جاري...' : isEditing ? 'تحديث' : 'حفظ'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}