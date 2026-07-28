import AppLayout from "@/layouts/app-layout";
import { Banner, BreadcrumbItem } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  banner?: Banner;
}

export default function BannerFormPage({ banner }: Props) {
  const isEditing = !!banner;

  const { data, setData, post, put, processing, errors } = useForm({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    cta_text: banner?.cta_text || '',
    cta_link: banner?.cta_link || '',
    sort_order: banner?.sort_order || 0,
    is_active: banner?.is_active ?? true,
    image: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      post(route('dashboard.banners.update', banner!.id), { forceFormData: true, data: { ...data, _method: 'PUT' } });
    } else {
      post(route('dashboard.banners.store'), { forceFormData: true });
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'البنرات', href: '/dashboard/banners/list' },
    { title: isEditing ? 'تعديل' : 'إضافة', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEditing ? 'تعديل بنر' : 'إضافة بنر'} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 max-w-2xl mx-auto">
        <Card>
          <CardHeader><CardTitle>{isEditing ? 'تعديل البنر' : 'بنر جديد'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="image">الصورة *</Label>
                <Input id="image" type="file" accept="image/*" onChange={e => setData('image', e.target.files?.[0] || null)} />
                {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
                {isEditing && banner?.image && <img src={banner.image.startsWith('http') ? banner.image : `/storage/${banner.image}`} alt="" className="mt-2 w-32 h-20 object-cover rounded" />}
              </div>

              <div><Label htmlFor="title">العنوان</Label><Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} /></div>
              <div><Label htmlFor="subtitle">الوصف الفرعي</Label><Input id="subtitle" value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} /></div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="cta_text">نص الزر</Label><Input id="cta_text" value={data.cta_text} onChange={e => setData('cta_text', e.target.value)} /></div>
                <div><Label htmlFor="cta_link">رابط الزر</Label><Input id="cta_link" value={data.cta_link} onChange={e => setData('cta_link', e.target.value)} dir="ltr" /></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="sort_order">الترتيب</Label><Input id="sort_order" type="number" value={data.sort_order} onChange={e => setData('sort_order', Number(e.target.value))} /></div>
                <div className="flex items-center gap-2 pt-6">
                  <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(v) => setData('is_active', !!v)} />
                  <Label htmlFor="is_active">نشط</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.banners.list'))}>إلغاء</Button>
                <Button type="submit" disabled={processing}>{processing ? 'جاري...' : isEditing ? 'تحديث' : 'حفظ'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}