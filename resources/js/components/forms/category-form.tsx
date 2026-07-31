import { Category } from "@/types";
import { useSite } from "@/context/site-context";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Props {
  category?: Category;
  parents: Category[];
}

export default function CategoryForm({ category, parents }: Props) {
  const { t } = useSite();
  const d = t.dashboard;
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
      put(route('dashboard.categories.update', category!.id), {
        onSuccess: () => toast.success(d.toast.updatedSuccess),
        onError: () => toast.error(d.toast.operationFailed),
      });
    } else {
      post(route('dashboard.categories.store'), {
        onSuccess: () => toast.success(d.toast.savedSuccess),
        onError: () => toast.error(d.toast.operationFailed),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? d.form.buttons.editing : d.form.buttons.creating}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name_ar">{d.form.labels.nameAr} *</Label>
              <Input id="name_ar" value={data.name_ar} onChange={e => setData('name_ar', e.target.value)} />
              {errors.name_ar && <p className="text-sm text-red-500 mt-1">{errors.name_ar}</p>}
            </div>
            <div>
              <Label htmlFor="name_en">{d.form.labels.nameEn}</Label>
              <Input id="name_en" value={data.name_en} onChange={e => setData('name_en', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="slug">{d.form.labels.slug} *</Label>
              <Input id="slug" value={data.slug} onChange={e => setData('slug', e.target.value)} dir="ltr" />
              {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug}</p>}
            </div>
            <div>
              <Label htmlFor="icon">Icon (Emoji)</Label>
              <Input id="icon" value={data.icon} onChange={e => setData('icon', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parent_id">{d.form.labels.category}</Label>
              <Select value={data.parent_id} onValueChange={(v) => setData('parent_id', v)}>
                <SelectTrigger><SelectValue placeholder="-" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">-</SelectItem>
                  {parents.map(p => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name_ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sort_order">{d.columns.sortOrder}</Label>
              <Input id="sort_order" type="number" value={data.sort_order} onChange={e => setData('sort_order', Number(e.target.value))} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.categories.list'))}>{d.form.buttons.cancel}</Button>
            <Button type="submit" disabled={processing}>{processing ? d.form.buttons.saving : isEditing ? d.form.buttons.update : d.form.buttons.save}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
