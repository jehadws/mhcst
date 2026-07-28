import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Testimonial } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  testimonial?: Testimonial;
}

export default function TestimonialFormPage({ testimonial }: Props) {
  const isEditing = !!testimonial;

  const { data, setData, post, put, processing, errors } = useForm({
    name: testimonial?.name || '',
    role_title: testimonial?.role_title || '',
    company: testimonial?.company || '',
    quote: testimonial?.quote || '',
    is_published: testimonial?.is_published ?? true,
    sort_order: testimonial?.sort_order || 0,
    photo: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      post(route('dashboard.testimonials.update', testimonial!.id), { forceFormData: true, data: { ...data, _method: 'PUT' } });
    } else {
      post(route('dashboard.testimonials.store'), { forceFormData: true });
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'آراء العملاء', href: '/dashboard/testimonials/list' },
    { title: isEditing ? 'تعديل' : 'إضافة', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEditing ? 'تعديل رأي' : 'إضافة رأي'} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 max-w-2xl mx-auto">
        <Card>
          <CardHeader><CardTitle>{isEditing ? 'تعديل الرأي' : 'رأي جديد'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم *</Label>
                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="role_title">المنصب</Label><Input id="role_title" value={data.role_title} onChange={e => setData('role_title', e.target.value)} /></div>
                <div><Label htmlFor="company">الشركة</Label><Input id="company" value={data.company} onChange={e => setData('company', e.target.value)} /></div>
              </div>

              <div>
                <Label htmlFor="quote">الرأي / التوصية *</Label>
                <Textarea id="quote" value={data.quote} onChange={e => setData('quote', e.target.value)} rows={4} />
                {errors.quote && <p className="text-sm text-red-500 mt-1">{errors.quote}</p>}
              </div>

              <div>
                <Label htmlFor="photo">الصورة</Label>
                <Input id="photo" type="file" accept="image/*" onChange={e => setData('photo', e.target.files?.[0] || null)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="sort_order">الترتيب</Label><Input id="sort_order" type="number" value={data.sort_order} onChange={e => setData('sort_order', Number(e.target.value))} /></div>
                <div className="flex items-center gap-2 pt-6">
                  <Checkbox id="is_published" checked={data.is_published} onCheckedChange={(v) => setData('is_published', !!v)} />
                  <Label htmlFor="is_published">منشور</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.testimonials.list'))}>إلغاء</Button>
                <Button type="submit" disabled={processing}>{processing ? 'جاري...' : isEditing ? 'تحديث' : 'حفظ'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}