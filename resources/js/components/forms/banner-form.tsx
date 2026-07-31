import { Banner } from "@/types";
import { useSite } from "@/context/site-context";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUploader from "@/components/image-uploader";

interface Props {
  banner?: Banner;
}

export default function BannerForm({ banner }: Props) {
  const { t } = useSite();
  const d = t.dashboard;
  const isEditing = !!banner;

  const { data, setData, post, put, processing, errors } = useForm({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    cta_text: banner?.cta_text || '',
    cta_link: banner?.cta_link || '',
    sort_order: banner?.sort_order || 0,
    is_active: banner?.is_active ?? true,
    image: banner?.image || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(route('dashboard.banners.update', banner!.id));
    } else {
      post(route('dashboard.banners.store'));
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{isEditing ? d.form.buttons.editing : d.form.buttons.creating}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <ImageUploader value={data.image} onChange={(path) => setData('image', path)} folder="banners" label={d.form.labels.image} />
            {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
          </div>

          <div><Label htmlFor="title">{d.columns.title}</Label><Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} /></div>
          <div><Label htmlFor="subtitle">{d.columns.subtitle}</Label><Input id="subtitle" value={data.subtitle} onChange={e => setData('subtitle', e.target.value)} /></div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="cta_text">{d.form.labels.ctaText}</Label><Input id="cta_text" value={data.cta_text} onChange={e => setData('cta_text', e.target.value)} /></div>
            <div><Label htmlFor="cta_link">{d.form.labels.ctaLink}</Label><Input id="cta_link" value={data.cta_link} onChange={e => setData('cta_link', e.target.value)} dir="ltr" /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="sort_order">{d.columns.sortOrder}</Label><Input id="sort_order" type="number" value={data.sort_order} onChange={e => setData('sort_order', Number(e.target.value))} /></div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(v) => setData('is_active', !!v)} />
              <Label htmlFor="is_active">{d.form.labels.isActive}</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.banners.list'))}>{d.form.buttons.cancel}</Button>
            <Button type="submit" disabled={processing}>{processing ? d.form.buttons.saving : isEditing ? d.form.buttons.update : d.form.buttons.save}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
