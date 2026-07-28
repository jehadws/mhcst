import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Category, Course, Instructor } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
    course?: Course;
    categories: Category[];
    instructors: Instructor[];
}

export function CourseForm({ course, categories = [], instructors = [] }: Props) {
    const isEditing = !!course;

    const initialInstructorIds = course?.instructors?.map((i) => i.id) || [];

    const { data, setData, post, processing, errors } = useForm({
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
        cover_image: null as File | null,
        instructors: initialInstructorIds.map((id) => ({ id, is_lead: true })),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            post(route('dashboard.courses.update', course!.id), {
                forceFormData: true,
                data: { ...data, _method: 'PUT' },
            });
        } else {
            post(route('dashboard.courses.store'), { forceFormData: true });
        }
    };

    const handleInstructorToggle = (instructorId: number, checked: boolean) => {
        if (checked) {
            setData('instructors', [...data.instructors, { id: instructorId, is_lead: false }]);
        } else {
            setData(
                'instructors',
                data.instructors.filter((i) => i.id !== instructorId)
            );
        }
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'الدورات', href: '/dashboard/courses/list' },
        { title: isEditing ? 'تعديل' : 'إضافة', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? 'تعديل دورة' : 'إضافة دورة جديدة'} />
            <div className="mx-auto flex h-full flex-1 max-w-4xl flex-col gap-4 p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'تعديل الدورة' : 'دورة جديدة'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title_ar">عنوان الدورة (عربي) *</Label>
                                    <Input
                                        id="title_ar"
                                        value={data.title_ar}
                                        onChange={(e) => setData('title_ar', e.target.value)}
                                    />
                                    {errors.title_ar && <p className="mt-1 text-sm text-red-500">{errors.title_ar}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="title_en">عنوان الدورة (إنجليزي)</Label>
                                    <Input
                                        id="title_en"
                                        value={data.title_en}
                                        onChange={(e) => setData('title_en', e.target.value)}
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="slug">المعرف (Slug) *</Label>
                                    <Input
                                        id="slug"
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        dir="ltr"
                                    />
                                    {errors.slug && <p className="mt-1 text-sm text-red-500">{errors.slug}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="category_id">التصنيف *</Label>
                                    <Select
                                        value={data.category_id}
                                        onValueChange={(v) => setData('category_id', v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="اختر التصنيف" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((c) => (
                                                <SelectItem key={c.id} value={String(c.id)}>
                                                    {c.name_ar}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="level">المستوى</Label>
                                    <Select
                                        value={data.level}
                                        onValueChange={(v) => setData('level', v as 'beginner' | 'intermediate' | 'advanced')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">مبتدئ</SelectItem>
                                            <SelectItem value="intermediate">متوسط</SelectItem>
                                            <SelectItem value="advanced">متقدم</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="price">السعر (د.ل) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) => setData('price', Number(e.target.value))}
                                    />
                                    {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="status">الحالة</Label>
                                    <Select
                                        value={data.status}
                                        onValueChange={(v) => setData('status', v as 'draft' | 'published' | 'archived')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">مسودة</SelectItem>
                                            <SelectItem value="published">منشور</SelectItem>
                                            <SelectItem value="archived">مؤرشف</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="duration_hours">المدة (ساعات)</Label>
                                    <Input
                                        id="duration_hours"
                                        type="number"
                                        value={data.duration_hours}
                                        onChange={(e) => setData('duration_hours', Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="capacity">السعة القصوى</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        value={data.capacity}
                                        onChange={(e) => setData('capacity', Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="location_type">نوع المكان</Label>
                                    <Select
                                        value={data.location_type}
                                        onValueChange={(v) => setData('location_type', v as 'onsite' | 'online' | 'hybrid')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="onsite">حضوري</SelectItem>
                                            <SelectItem value="online">أونلاين</SelectItem>
                                            <SelectItem value="hybrid">مدمج</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="start_date">تاريخ البداية</Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={data.start_date}
                                        onChange={(e) => setData('start_date', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="end_date">تاريخ النهاية</Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={data.end_date}
                                        onChange={(e) => setData('end_date', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="venue">مكان الانعقاد / العنوان</Label>
                                <Input
                                    id="venue"
                                    value={data.venue}
                                    onChange={(e) => setData('venue', e.target.value)}
                                    placeholder="مثال: القاعة الرئيسية - طرابلس"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description_ar">الوصف (عربي)</Label>
                                <Textarea
                                    id="description_ar"
                                    value={data.description_ar}
                                    onChange={(e) => setData('description_ar', e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div>
                                <Label htmlFor="description_en">الوصف (إنجليزي)</Label>
                                <Textarea
                                    id="description_en"
                                    value={data.description_en}
                                    onChange={(e) => setData('description_en', e.target.value)}
                                    rows={4}
                                    dir="ltr"
                                />
                            </div>

                            <div>
                                <Label className="mb-2 block font-medium">المدربون</Label>
                                <div className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                                    {instructors.map((inst) => {
                                        const selected = data.instructors.some((i) => i.id === inst.id);
                                        return (
                                            <div key={inst.id} className="flex items-center gap-2">
                                                <Checkbox
                                                    id={`inst-${inst.id}`}
                                                    checked={selected}
                                                    onCheckedChange={(checked) =>
                                                        handleInstructorToggle(inst.id, !!checked)
                                                    }
                                                />
                                                <Label htmlFor={`inst-${inst.id}`} className="cursor-pointer font-normal">
                                                    {inst.name}
                                                </Label>
                                            </div>
                                        );
                                    })}
                                    {instructors.length === 0 && (
                                        <p className="text-sm text-muted-foreground">لا يوجد مدربون متاحون.</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="cover_image">صورة الغلاف</Label>
                                <Input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setData('cover_image', e.target.files?.[0] || null)}
                                />
                                {isEditing && course?.cover_image && (
                                    <img
                                        src={course.cover_image.startsWith('http') ? course.cover_image : `/storage/${course.cover_image}`}
                                        alt=""
                                        className="mt-2 h-24 w-40 rounded object-cover"
                                    />
                                )}
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.get(route('dashboard.courses.list'))}
                                >
                                    إلغاء
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'جاري...' : isEditing ? 'تحديث' : 'حفظ'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

export default function CreateCoursePage({ categories, instructors }: Props) {
    return <CourseForm categories={categories} instructors={instructors} />;
}
