import { Category, Course, Instructor } from "@/types";
import { useSite } from "@/context/site-context";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUploader from "@/components/image-uploader";

interface Props {
  course?: Course;
  categories: Category[];
  instructors: Instructor[];
}

export default function CourseForm({ course, categories = [], instructors = [] }: Props) {
  const { t } = useSite();
  const d = t.dashboard;
  const isEditing = !!course;

  const initialInstructorIds = course?.instructors?.map((i) => i.id) || [];

  const { data, setData, post, put, processing, errors } = useForm({
    category_id: course?.category_id ? String(course.category_id) : '',
    title_ar: course?.title_ar || '',
    title_en: course?.title_en || '',
    slug: course?.slug || '',
    description_ar: course?.description_ar || '',
    description_en: course?.description_en || '',
    level: course?.level || 'beginner',
    duration_hours: course?.duration_hours || 0,
    location_type: course?.location_type || 'onsite',
    venue: course?.venue || '',
    start_date: course?.start_date ? course.start_date.split('T')[0] : '',
    end_date: course?.end_date ? course.end_date.split('T')[0] : '',
    capacity: course?.capacity || 20,
    price: course?.price || 0,
    status: course?.status || 'draft',
    cover_image: course?.cover_image || null,
    instructors: initialInstructorIds.map((id) => ({ id, is_lead: true })) as Array<{ id: number; is_lead: boolean }>,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(route('dashboard.courses.update', course!.id));
    } else {
      post(route('dashboard.courses.store'));
    }
  };

  const handleInstructorToggle = (instructorId: number, checked: boolean) => {
    if (checked) {
      setData('instructors', [...data.instructors, { id: instructorId, is_lead: false }]);
    } else {
      setData('instructors', data.instructors.filter((i) => i.id !== instructorId));
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
              <Label htmlFor="title_ar">{d.form.labels.titleAr} *</Label>
              <Input id="title_ar" value={data.title_ar} onChange={(e) => setData('title_ar', e.target.value)} />
              {errors.title_ar && <p className="mt-1 text-sm text-red-500">{errors.title_ar}</p>}
            </div>
            <div>
              <Label htmlFor="title_en">{d.form.labels.titleEn}</Label>
              <Input id="title_en" value={data.title_en} onChange={(e) => setData('title_en', e.target.value)} dir="ltr" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="slug">{d.form.labels.slug} *</Label>
              <Input id="slug" value={data.slug} onChange={(e) => setData('slug', e.target.value)} dir="ltr" />
              {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug}</p>}
            </div>
            <div>
              <Label htmlFor="category_id">{d.form.labels.category} *</Label>
              <Select value={data.category_id} onValueChange={(v) => setData('category_id', v)}>
                <SelectTrigger><SelectValue placeholder={d.form.placeholders.selectCategory} /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name_ar}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="level">{d.form.labels.level}</Label>
              <Select value={data.level} onValueChange={(v) => setData('level', v as 'beginner' | 'intermediate' | 'advanced')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">{d.level.beginner}</SelectItem>
                  <SelectItem value="intermediate">{d.level.intermediate}</SelectItem>
                  <SelectItem value="advanced">{d.level.advanced}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="price">{d.form.labels.price} *</Label>
              <Input id="price" type="number" step="0.01" value={data.price} onChange={(e) => setData('price', Number(e.target.value))} />
              {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
            </div>
            <div>
              <Label htmlFor="status">{d.form.labels.status}</Label>
              <Select value={data.status} onValueChange={(v) => setData('status', v as 'draft' | 'published' | 'archived')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{d.status.draft}</SelectItem>
                  <SelectItem value="published">{d.status.published}</SelectItem>
                  <SelectItem value="archived">{d.status.archived}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="duration_hours">{d.form.labels.durationHours}</Label>
              <Input id="duration_hours" type="number" value={data.duration_hours} onChange={(e) => setData('duration_hours', Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="capacity">{d.form.labels.capacity}</Label>
              <Input id="capacity" type="number" value={data.capacity} onChange={(e) => setData('capacity', Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="location_type">{d.form.labels.locationType}</Label>
              <Select value={data.location_type} onValueChange={(v) => setData('location_type', v as 'onsite' | 'online' | 'hybrid')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="onsite">{d.locationType.onsite}</SelectItem>
                  <SelectItem value="online">{d.locationType.online}</SelectItem>
                  <SelectItem value="hybrid">{d.locationType.hybrid}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">{d.form.labels.startDate}</Label>
              <Input id="start_date" type="date" value={data.start_date} onChange={(e) => setData('start_date', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="end_date">{d.form.labels.endDate}</Label>
              <Input id="end_date" type="date" value={data.end_date} onChange={(e) => setData('end_date', e.target.value)} />
            </div>
          </div>

          <div>
            <Label htmlFor="venue">{d.form.labels.venue}</Label>
            <Input id="venue" value={data.venue} onChange={(e) => setData('venue', e.target.value)} placeholder={d.form.placeholders.venueExample} />
          </div>

          <div>
            <Label htmlFor="description_ar">{d.form.labels.descriptionAr}</Label>
            <Textarea id="description_ar" value={data.description_ar} onChange={(e) => setData('description_ar', e.target.value)} rows={4} />
          </div>

          <div>
            <Label htmlFor="description_en">{d.form.labels.descriptionEn}</Label>
            <Textarea id="description_en" value={data.description_en} onChange={(e) => setData('description_en', e.target.value)} rows={4} dir="ltr" />
          </div>

          <div>
            <Label className="mb-2 block font-medium">{d.form.labels.instructors}</Label>
            <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
              {instructors.map((inst) => {
                const selected = data.instructors.some((i) => i.id === inst.id);
                return (
                  <div key={inst.id} className="flex items-center gap-2">
                    <Checkbox id={`inst-${inst.id}`} checked={selected} onCheckedChange={(checked) => handleInstructorToggle(inst.id, !!checked)} />
                    <Label htmlFor={`inst-${inst.id}`} className="cursor-pointer font-normal">{inst.name}</Label>
                  </div>
                );
              })}
              {instructors.length === 0 && (
                <p className="text-sm text-muted-foreground">{d.form.placeholders.noInstructors}</p>
              )}
            </div>
          </div>

          <div>
            <ImageUploader value={data.cover_image} onChange={(path) => setData('cover_image', path)} folder="courses" label={d.form.labels.coverImage} />
            {errors.cover_image && <p className="text-sm text-red-500 mt-1">{errors.cover_image}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.courses.list'))}>{d.form.buttons.cancel}</Button>
            <Button type="submit" disabled={processing}>{processing ? d.form.buttons.saving : isEditing ? d.form.buttons.update : d.form.buttons.save}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
