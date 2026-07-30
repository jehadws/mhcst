import { BlogPost } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from "@/components/image-uploader";

interface Props {
  post?: BlogPost;
}

export default function BlogPostForm({ post }: Props) {
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
    cover_image: post?.cover_image || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(route('dashboard.blog-posts.update', post!.id));
    } else {
      submitPost(route('dashboard.blog-posts.store'));
    }
  };

  return (
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
            <ImageUploader
              value={data.cover_image}
              onChange={(path) => setData('cover_image', path)}
              folder="blog"
              label="صورة الغلاف"
            />
            {errors.cover_image && <p className="text-sm text-red-500 mt-1">{errors.cover_image}</p>}
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
  );
}
