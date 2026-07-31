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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ImageUploader from "@/components/image-uploader";
import { ChevronDown, FileText, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

interface Props {
  course?: Course;
  categories: Category[];
  instructors: Instructor[];
}

type LessonItem = { title_ar: string; title_en: string; duration_minutes: number };
type CurriculumItem = { section_title_ar: string; section_title_en: string; lessons: LessonItem[] };

type CourseFormData = {
  category_id: string;
  title_ar: string;
  title_en: string;
  slug: string;
  description_ar: string;
  description_en: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  location_type: 'onsite' | 'online' | 'hybrid';
  venue: string;
  start_date: string;
  end_date: string;
  capacity: number;
  price: number;
  status: 'draft' | 'published' | 'archived';
  cover_image: string | null;
  instructors: Array<{ id: number; is_lead: boolean }>;
  curriculums: CurriculumItem[];
  attachment_files: File[];
};

export default function CourseForm({ course, categories = [], instructors = [] }: Props) {
  const { t } = useSite();
  const d = t.dashboard;
  const isEditing = !!course;

  const initialInstructorIds = course?.instructors?.map((i) => i.id) || [];
  const initialCurriculums: CurriculumItem[] = (course?.curriculums || []).map((c) => ({
    section_title_ar: c.section_title_ar || "",
    section_title_en: c.section_title_en || "",
    lessons: Array.isArray(c.lessons) ? c.lessons.map((l) => ({
      title_ar: l.title_ar || "",
      title_en: l.title_en || "",
      duration_minutes: l.duration_minutes || 0,
    })) : [],
  }));

  const { data, setData, post, put, processing, errors } = useForm<CourseFormData>({
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
    instructors: initialInstructorIds.map((id) => ({ id, is_lead: true })),
    curriculums: initialCurriculums,
    attachment_files: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(route('dashboard.courses.update', course!.id), {
        onSuccess: () => toast.success(d.toast.updatedSuccess),
        onError: () => toast.error(d.toast.operationFailed),
      });
    } else {
      post(route('dashboard.courses.store'), {
        onSuccess: () => toast.success(d.toast.savedSuccess),
        onError: () => toast.error(d.toast.operationFailed),
      });
    }
  };

  const handleInstructorToggle = (instructorId: number, checked: boolean) => {
    if (checked) {
      setData('instructors', [...data.instructors, { id: instructorId, is_lead: false }]);
    } else {
      setData('instructors', data.instructors.filter((i) => i.id !== instructorId));
    }
  };

  const addSection = () => {
    setData('curriculums', [...data.curriculums, { section_title_ar: '', section_title_en: '', lessons: [] }]);
  };

  const removeSection = (index: number) => {
    setData('curriculums', data.curriculums.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, field: keyof CurriculumItem, value: string) => {
    setData('curriculums', data.curriculums.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const addLesson = (sectionIndex: number) => {
    setData('curriculums', data.curriculums.map((s, i) =>
      i === sectionIndex ? { ...s, lessons: [...s.lessons, { title_ar: '', title_en: '', duration_minutes: 0 }] } : s
    ));
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    setData('curriculums', data.curriculums.map((s, i) =>
      i === sectionIndex ? { ...s, lessons: s.lessons.filter((_, li) => li !== lessonIndex) } : s
    ));
  };

  const updateLesson = (sectionIndex: number, lessonIndex: number, field: string, value: string | number) => {
    setData('curriculums', data.curriculums.map((s, i) =>
      i === sectionIndex
        ? { ...s, lessons: s.lessons.map((l, li) => (li === lessonIndex ? { ...l, [field]: value } : l)) }
        : s
    ));
  };

  const handleAttachmentFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setData('attachment_files', [...data.attachment_files, ...files]);
    }
    e.target.value = '';
  };

  const removeAttachmentFile = (index: number) => {
    setData('attachment_files', data.attachment_files.filter((_, i) => i !== index));
  };

  const deleteExistingAttachment = (attachmentId: number) => {
    router.delete(route('dashboard.course-attachments.destroy', attachmentId), {
      onSuccess: () => toast.success(d.toast.deletedSuccess),
      onError: () => toast.error(d.toast.operationFailed),
    });
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

          {/* Curriculum Builder */}
          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">{d.form.labels.curriculum}</Label>
              <Button type="button" variant="outline" size="sm" onClick={addSection}>
                <Plus className="size-4" /> {d.form.labels.addSection}
              </Button>
            </div>

            {data.curriculums.length === 0 && (
              <p className="text-sm text-muted-foreground">{d.form.labels.noSections}</p>
            )}

            {data.curriculums.map((section, sectionIndex) => (
              <Collapsible key={sectionIndex} defaultOpen className="rounded-lg border border-border/80">
                <CollapsibleTrigger className="flex w-full items-center justify-between gap-3 bg-muted/30 px-4 py-3 text-sm font-semibold hover:bg-muted/50">
                  <span className="flex items-center gap-2">
                    <ChevronDown className="size-4 text-muted-foreground transition-transform" />
                    {section.section_title_ar || `${d.form.labels.addSection} ${sectionIndex + 1}`}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs font-normal text-muted-foreground">{section.lessons.length} {d.form.labels.lessons}</span>
                    <Button type="button" variant="ghost" size="icon" className="size-7" onClick={() => removeSection(sectionIndex)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 px-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`section-ar-${sectionIndex}`}>{d.form.labels.sectionTitleAr}</Label>
                      <Input id={`section-ar-${sectionIndex}`} value={section.section_title_ar} onChange={(e) => updateSection(sectionIndex, 'section_title_ar', e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor={`section-en-${sectionIndex}`}>{d.form.labels.sectionTitleEn}</Label>
                      <Input id={`section-en-${sectionIndex}`} dir="ltr" value={section.section_title_en} onChange={(e) => updateSection(sectionIndex, 'section_title_en', e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2 rounded-lg bg-background p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">{d.form.labels.lessons}</span>
                      <Button type="button" variant="outline" size="sm" onClick={() => addLesson(sectionIndex)}>
                        <Plus className="size-3.5" /> {d.form.labels.addLesson}
                      </Button>
                    </div>

                    {section.lessons.length === 0 && (
                      <p className="text-xs text-muted-foreground">{d.form.labels.noLessons}</p>
                    )}

                    {section.lessons.map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="flex items-center gap-2 rounded-md border border-border/70 bg-card p-2">
                        <Input
                          value={lesson.title_ar}
                          placeholder={d.form.labels.lessonTitleAr}
                          onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'title_ar', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          dir="ltr"
                          value={lesson.title_en}
                          placeholder={d.form.labels.lessonTitleEn}
                          onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'title_en', e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={lesson.duration_minutes}
                          placeholder={d.form.labels.durationMinutes}
                          onChange={(e) => updateLesson(sectionIndex, lessonIndex, 'duration_minutes', Number(e.target.value))}
                          className="w-32"
                        />
                        <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" onClick={() => removeLesson(sectionIndex, lessonIndex)}>
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          {/* Attachments */}
          <div className="space-y-3 rounded-xl border border-border p-4">
            <Label className="text-base font-semibold">{d.form.labels.attachments}</Label>

            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/20 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground">
              <Upload className="size-5" />
              <span>{d.form.labels.uploadAttachmentsHint}</span>
              <input type="file" multiple className="hidden" onChange={handleAttachmentFiles} />
            </label>

            {data.attachment_files.length > 0 && (
              <div className="space-y-2">
                {data.attachment_files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 truncate">
                      <FileText className="size-4 shrink-0 text-primary" />
                      <span className="truncate">{file.name}</span>
                    </span>
                    <Button type="button" variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => removeAttachmentFile(index)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {isEditing && course?.attachments && course.attachments.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">{d.form.labels.existingAttachments}</p>
                {course.attachments.map((att) => (
                  <div key={att.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-card px-3 py-2 text-sm">
                    <a href={`/storage/${att.file_path}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 truncate hover:text-primary">
                      <FileText className="size-4 shrink-0 text-primary" />
                      <span className="truncate">{att.title_ar || att.title_en}</span>
                    </a>
                    <Button type="button" variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => deleteExistingAttachment(att.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!isEditing && data.attachment_files.length === 0 && (
              <p className="text-xs text-muted-foreground">{d.form.labels.noAttachments}</p>
            )}
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
