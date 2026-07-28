import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Instructor } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  instructor?: Instructor;
}

export default function InstructorFormPage({ instructor }: Props) {
  const isEditing = !!instructor;

  const { data, setData, post, put, processing, errors } = useForm({
    name: instructor?.name || '',
    bio_ar: instructor?.bio_ar || '',
    bio_en: instructor?.bio_en || '',
    email: instructor?.email || '',
    phone: instructor?.phone || '',
    specialization: instructor?.specialization || '',
    years_experience: instructor?.years_experience || 0,
    social_links: instructor?.social_links ? JSON.stringify(instructor.social_links) : '{}',
    is_active: instructor?.is_active ?? true,
    photo: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null) formData.append(key, value instanceof File ? value : String(value));
    });

    if (isEditing) {
      formData.append('_method', 'PUT');
      post(route('dashboard.instructors.update', instructor!.id), { forceFormData: true });
    } else {
      post(route('dashboard.instructors.store'), { forceFormData: true });
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'المدربون', href: '/dashboard/instructors/list' },
    { title: isEditing ? 'تعديل' : 'إضافة', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEditing ? 'تعديل مدرب' : 'إضافة مدرب'} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 max-w-3xl mx-auto">
        <Card>
          <CardHeader><CardTitle>{isEditing ? 'تعديل المدرب' : 'مدرب جديد'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم *</Label>
                <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="email">البريد</Label><Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} /></div>
                <div><Label htmlFor="phone">الهاتف</Label><Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} /></div>
              </div>

              <div>
                <Label htmlFor="specialization">التخصص</Label>
                <Input id="specialization" value={data.specialization} onChange={e => setData('specialization', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="years_experience">سنوات الخبرة</Label><Input id="years_experience" type="number" value={data.years_experience} onChange={e => setData('years_experience', Number(e.target.value))} /></div>
                <div className="flex items-center gap-2 pt-6">
                  <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(v) => setData('is_active', !!v)} />
                  <Label htmlFor="is_active">نشط</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="bio_ar">نبذة (عربي)</Label>
                <Textarea id="bio_ar" value={data.bio_ar} onChange={e => setData('bio_ar', e.target.value)} rows={3} />
              </div>
              <div>
                <Label htmlFor="bio_en">نبذة (إنجليزي)</Label>
                <Textarea id="bio_en" value={data.bio_en} onChange={e => setData('bio_en', e.target.value)} rows={3} />
              </div>

              <div>
                <Label htmlFor="social_links">روابط التواصل (JSON)</Label>
                <Textarea id="social_links" value={data.social_links} onChange={e => setData('social_links', e.target.value)} dir="ltr" rows={2} />
              </div>

              <div>
                <Label htmlFor="photo">الصورة</Label>
                <Input id="photo" type="file" accept="image/*" onChange={e => setData('photo', e.target.files?.[0] || null)} />
                {isEditing && instructor?.photo && <p className="text-xs text-muted-foreground mt-1">الصورة الحالية: {instructor.photo}</p>}
                {errors.photo && <p className="text-sm text-red-500 mt-1">{errors.photo}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.instructors.list'))}>إلغاء</Button>
                <Button type="submit" disabled={processing}>{processing ? 'جاري...' : isEditing ? 'تحديث' : 'حفظ'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}