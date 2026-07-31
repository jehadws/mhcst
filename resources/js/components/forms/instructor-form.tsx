import { Instructor } from "@/types";
import { useSite } from "@/context/site-context";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUploader from "@/components/image-uploader";
import KeyValueInput from "@/components/shared/key-value-input";

interface Props {
  instructor?: Instructor;
}

const toKeyValueArray = (links: unknown): { key: string; value: string }[] => {
  if (!links) return [];
  if (Array.isArray(links)) return links;
  return Object.entries(links).map(([key, value]) => ({ key, value: String(value) }));
};

export default function InstructorForm({ instructor }: Props) {
  const { t } = useSite();
  const d = t.dashboard;
  const isEditing = !!instructor;

  const { data, setData, post, put, processing, errors } = useForm({
    name: instructor?.name || '',
    bio_ar: instructor?.bio_ar || '',
    bio_en: instructor?.bio_en || '',
    email: instructor?.email || '',
    phone: instructor?.phone || '',
    specialization: instructor?.specialization || '',
    years_experience: instructor?.years_experience || 0,
    social_links: toKeyValueArray(instructor?.social_links),
    is_active: instructor?.is_active ?? true,
    photo: instructor?.photo || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(route('dashboard.instructors.update', instructor!.id));
    } else {
      post(route('dashboard.instructors.store'));
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{isEditing ? d.form.buttons.editing : d.form.buttons.creating}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{d.form.labels.name} *</Label>
            <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="email">{d.form.labels.email}</Label><Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} /></div>
            <div><Label htmlFor="phone">{d.form.labels.phone}</Label><Input id="phone" value={data.phone} onChange={e => setData('phone', e.target.value)} /></div>
          </div>

          <div>
            <Label htmlFor="specialization">{d.form.labels.specialization}</Label>
            <Input id="specialization" value={data.specialization} onChange={e => setData('specialization', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="years_experience">{d.form.labels.yearsExperience}</Label><Input id="years_experience" type="number" value={data.years_experience} onChange={e => setData('years_experience', Number(e.target.value))} /></div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox id="is_active" checked={data.is_active} onCheckedChange={(v) => setData('is_active', !!v)} />
              <Label htmlFor="is_active">{d.form.labels.isActive}</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="bio_ar">{d.form.labels.bioAr}</Label>
            <Textarea id="bio_ar" value={data.bio_ar} onChange={e => setData('bio_ar', e.target.value)} rows={3} />
          </div>
          <div>
            <Label htmlFor="bio_en">{d.form.labels.bioEn}</Label>
            <Textarea id="bio_en" value={data.bio_en} onChange={e => setData('bio_en', e.target.value)} rows={3} />
          </div>

          <div>
            <Label>{d.columns.specialization}</Label>
            <div className="mt-2">
              <KeyValueInput value={data.social_links} onChange={(links) => setData('social_links', links)} keyPlaceholder={d.form.placeholders.socialPlatform} valuePlaceholder={d.form.placeholders.socialUrl} />
            </div>
            {errors.social_links && <p className="text-sm text-red-500 mt-1">{errors.social_links}</p>}
          </div>

          <div>
            <ImageUploader value={data.photo} onChange={(path) => setData('photo', path)} folder="instructors" label={d.form.labels.photo} />
            {errors.photo && <p className="text-sm text-red-500 mt-1">{errors.photo}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.instructors.list'))}>{d.form.buttons.cancel}</Button>
            <Button type="submit" disabled={processing}>{processing ? d.form.buttons.saving : isEditing ? d.form.buttons.update : d.form.buttons.save}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
