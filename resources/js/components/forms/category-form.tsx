import { Category } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  category?: Category;
  parents: Category[];
}

export default function CategoryForm({ category, parents }: Props) {
  const isEditing = !!category;

  const { data, setData, post, put, processing, errors } = useForm({
    name_ar: category?.name_ar || '',
    name_en: category?.name_en || '',
    slug: category?.slug || '',
    parent_id: category?.parent_id ? String(category.parent_id) : '0',
    icon: category?.icon || '',
    sort_order: category?.sort_order || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(route('dashboard.categories.update', category!.id));
    } else {
      post(route('dashboard.categories.store'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'تعديل التصنيف' : 'تصنيف جديد'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name_ar">الاسم (عربي) *</Label>
              <Input id="name_ar" value={data.name_ar} onChange={e => setData('name_ar', e.target.value)} />
              {errors.name_ar && <p className="text-sm text-red-500 mt-1">{errors.name_ar}</p>}
            </div>
            <div>
              <Label htmlFor="name_en">الاسم (إنجليزي)</Label>
              <Input id="name_en" value={data.name_en} onChange={e => setData('name_en', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="slug">المعرف (Slug) *</Label>
              <Input id="slug" value={data.slug} onChange={e => setData('slug', e.target.value)} dir="ltr" />
              {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug}</p>}
            </div>
            <div>
              <Label htmlFor="icon">الأيقونة (Emoji)</Label>
              <Input id="icon" value={data.icon} onChange={e => setData('icon', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parent_id">التصنيف الأب</Label>
              <Select value={data.parent_id} onValueChange={(v) => setData('parent_id', v)}>
                <SelectTrigger><SelectValue placeholder="بدون" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">بدون</SelectItem>
                  {parents.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name_ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sort_order">الترتيب</Label>
              <Input id="sort_order" type="number" value={data.sort_order} onChange={e => setData('sort_order', Number(e.target.value))} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.categories.list'))}>إلغاء</Button>
            <Button type="submit" disabled={processing}>{processing ? 'جاري...' : isEditing ? 'تحديث' : 'حفظ'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
