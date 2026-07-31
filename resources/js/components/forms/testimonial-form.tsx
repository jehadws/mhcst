import { Testimonial } from "@/types";
import { useSite } from "@/context/site-context";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUploader from "@/components/image-uploader";
import { toast } from "sonner";

interface Props {
  testimonial?: Testimonial;
}

export default function TestimonialForm({ testimonial }: Props) {
  const { t } = useSite();
  const d = t.dashboard;
  const isEditing = !!testimonial;

  const { data, setData, post, put, processing, errors } = useForm({
    name: testimonial?.name || '',
    role_title: testimonial?.role_title || '',
    company: testimonial?.company || '',
    quote: testimonial?.quote || '',
    is_published: testimonial?.is_published ?? true,
    sort_order: testimonial?.sort_order || 0,
    photo: testimonial?.photo || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(route('dashboard.testimonials.update', testimonial!.id), {
        onSuccess: () => toast.success(d.toast.updatedSuccess),
        onError: () => toast.error(d.toast.operationFailed),
      });
    } else {
      post(route('dashboard.testimonials.store'), {
        onSuccess: () => toast.success(d.toast.savedSuccess),
        onError: () => toast.error(d.toast.operationFailed),
      });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{isEditing ? d.form.buttons.editing : d.form.buttons.creating} {d.entities.testimonial.singular}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{d.columns.fullName} *</Label>
            <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="role_title">{d.form.labels.roleTitle}</Label><Input id="role_title" value={data.role_title} onChange={e => setData('role_title', e.target.value)} /></div>
            <div><Label htmlFor="company">{d.form.labels.company}</Label><Input id="company" value={data.company} onChange={e => setData('company', e.target.value)} /></div>
          </div>

          <div>
            <Label htmlFor="quote">{d.form.labels.quote} *</Label>
            <Textarea id="quote" value={data.quote} onChange={e => setData('quote', e.target.value)} rows={4} />
            {errors.quote && <p className="text-sm text-red-500 mt-1">{errors.quote}</p>}
          </div>

          <div>
            <ImageUploader value={data.photo} onChange={(path) => setData('photo', path)} folder="testimonials" label={d.form.labels.photo} />
            {errors.photo && <p className="text-sm text-red-500 mt-1">{errors.photo}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="sort_order">{d.columns.sortOrder}</Label><Input id="sort_order" type="number" value={data.sort_order} onChange={e => setData('sort_order', Number(e.target.value))} /></div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox id="is_published" checked={data.is_published} onCheckedChange={(v) => setData('is_published', !!v)} />
              <Label htmlFor="is_published">{d.form.labels.isActive}</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.testimonials.list'))}>{d.form.buttons.cancel}</Button>
            <Button type="submit" disabled={processing}>{processing ? d.form.buttons.saving : isEditing ? d.form.buttons.update : d.form.buttons.save}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
