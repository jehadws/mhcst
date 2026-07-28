import AppLayout from "@/layouts/app-layout";
import { BlogPost, BreadcrumbItem } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  post?: BlogPost;
}

export default function BlogPostFormPage({ post }: Props) {
  const isEditing = !!post;

  const { data, setData, post: submitPost, put, processing, errors } = useForm({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    status: post?.status || 'draft',
    published_at: post?.published_at ? post.published_at.slice(0, 16) : '',
    seo_title: post?.seo_title || '',
    seo_description: post?.seo_description || '',
    cover_image: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      submitPost(route('dashboard.blog-posts.update', post!.id), { forceFormData: true, data: { ...data, _method: 'PUT' } });
    } else {
      submitPost(route('dashboard.blog-posts.store'), { forceFormData: true });
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'المدونة', href: '/dashboard/blog-posts/list' },
    { title: isEditing ? 'تعديل' : 'إضافة', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEditing ? 'تعديل مقال' : 'إضافة مقال'} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4 max-w-4xl mx-auto">
        <Card>
          <CardHeader><CardTitle>{isEditing ? 'تعديل المقال' : 'مقال جديد'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">العنوان *</Label>
                <Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} />
                {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="slug">المعرف (Slug) *</Label>
                  <Input id="slug" value={data.slug} onChange={e => setData('slug', e.target.value)} dir="ltr" />
                  {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug}</p>}
                </div>
                <div>
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={data.status} onValueChange={(v) => setData('status', v as 'draft' | 'published')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">مسودة</SelectItem>
                      <SelectItem value="published">منشور</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">مقتطف</Label>
                <Textarea id="excerpt" value={data.excerpt} onChange={e => setData('excerpt', e.target.value)} rows={2} />
              </div>

              <div>
                <Label htmlFor="content">المحتوى *</Label>
                <Textarea id="content" value={data.content} onChange={e => setData('content', e.target.value)} rows={12} />
                {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content}</p>}
              </div>

              <div>
                <Label htmlFor="cover_image">صورة الغلاف</Label>
                <Input id="cover_image" type="file" accept="image/*" onChange={e => setData('cover_image', e.target.files?.[0] || null)} />
                {isEditing && post?.cover_image && <img src={post.cover_image.startsWith('http') ? post.cover_image : `/storage/${post.cover_image}`} alt="" className="mt-2 w-32 h-20 object-cover rounded" />}
              </div>

              <div>
                <Label htmlFor="published_at">تاريخ النشر</Label>
                <Input id="published_at" type="datetime-local" value={data.published_at} onChange={e => setData('published_at', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="seo_title">SEO Title</Label><Input id="seo_title" value={data.seo_title} onChange={e => setData('seo_title', e.target.value)} /></div>
                <div><Label htmlFor="seo_description">SEO Description</Label><Input id="seo_description" value={data.seo_description} onChange={e => setData('seo_description', e.target.value)} /></div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.blog-posts.list'))}>إلغاء</Button>
                <Button type="submit" disabled={processing}>{processing ? 'جاري...' : isEditing ? 'تحديث' : 'حفظ'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}