import { BlogPost } from "@/types";
import { useSite } from "@/context/site-context";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploader from "@/components/image-uploader";
import VideoUploader from "@/components/video-uploader";
import { toast } from "sonner";
import { useState } from "react";

interface Props {
  post?: BlogPost;
}

export default function BlogPostForm({ post }: Props) {
  const { t } = useSite();
  const d = t.dashboard;
  const isEditing = !!post;

  const [mediaKind, setMediaKind] = useState<'image' | 'video'>(
    post?.cover_video ? 'video' : 'image'
  );

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
    cover_video: post?.cover_video || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(route('dashboard.blog-posts.update', post!.id), {
        onSuccess: () => toast.success(d.toast.updatedSuccess),
        onError: () => toast.error(d.toast.operationFailed),
      });
    } else {
      submitPost(route('dashboard.blog-posts.store'), {
        onSuccess: () => toast.success(d.toast.savedSuccess),
        onError: () => toast.error(d.toast.operationFailed),
      });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{isEditing ? d.form.buttons.editing : d.form.buttons.creating} {d.entities.blogPost.singular}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">{d.columns.title} *</Label>
            <Input id="title" value={data.title} onChange={e => setData('title', e.target.value)} />
            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="slug">{d.form.labels.slug} *</Label>
              <Input id="slug" value={data.slug} onChange={e => setData('slug', e.target.value)} dir="ltr" />
              {errors.slug && <p className="text-sm text-red-500 mt-1">{errors.slug}</p>}
            </div>
            <div>
              <Label htmlFor="status">{d.form.labels.status}</Label>
              <Select value={data.status} onValueChange={(v) => setData('status', v as 'draft' | 'published')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{d.status.draft}</SelectItem>
                  <SelectItem value="published">{d.status.published}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="excerpt">{d.form.labels.excerpt}</Label>
            <Textarea id="excerpt" value={data.excerpt} onChange={e => setData('excerpt', e.target.value)} rows={2} />
          </div>

          <div>
            <Label htmlFor="content">{d.form.labels.content} *</Label>
            <Textarea id="content" value={data.content} onChange={e => setData('content', e.target.value)} rows={12} />
            {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content}</p>}
          </div>

          {/* Media kind toggle */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Label>{d.form.labels.coverImage}</Label>
              <div className="ms-auto flex rounded-md border overflow-hidden text-sm">
                <button
                  type="button"
                  onClick={() => setMediaKind('image')}
                  className={`px-3 py-1 transition-colors ${mediaKind === 'image' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  {d.form.labels.mediaImage ?? 'صورة'}
                </button>
                <button
                  type="button"
                  onClick={() => setMediaKind('video')}
                  className={`px-3 py-1 transition-colors ${mediaKind === 'video' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                >
                  {d.form.labels.mediaVideo ?? 'فيديو'}
                </button>
              </div>
            </div>

            {mediaKind === 'image' ? (
              <div>
                <ImageUploader value={data.cover_image} onChange={(path) => setData('cover_image', path)} folder="blog" label={d.form.labels.coverImage} />
                {errors.cover_image && <p className="text-sm text-red-500 mt-1">{errors.cover_image}</p>}
              </div>
            ) : (
              <div className="space-y-3">
                <VideoUploader
                  value={data.cover_video}
                  onChange={(path) => setData('cover_video', path)}
                  folder="blog"
                  label={d.form.labels.coverVideo ?? 'فيديو الغلاف'}
                />
                {errors.cover_video && <p className="text-sm text-red-500 mt-1">{errors.cover_video}</p>}
                <div>
                  <ImageUploader
                    value={data.cover_image}
                    onChange={(path) => setData('cover_image', path)}
                    folder="blog"
                    label={d.form.labels.videoPoster ?? 'صورة مصغرة (Poster)'}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {d.form.labels.videoPosterHint ?? 'الصورة المصغرة تُستخدم في قائمة الأخبار وكصورة ترويجية للفيديو.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="published_at">{d.form.labels.publishedAt}</Label>
            <Input id="published_at" type="datetime-local" value={data.published_at} onChange={e => setData('published_at', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="seo_title">{d.form.labels.seoTitle}</Label><Input id="seo_title" value={data.seo_title} onChange={e => setData('seo_title', e.target.value)} /></div>
            <div><Label htmlFor="seo_description">{d.form.labels.seoDescription}</Label><Input id="seo_description" value={data.seo_description} onChange={e => setData('seo_description', e.target.value)} /></div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.blog-posts.list'))}>{d.form.buttons.cancel}</Button>
            <Button type="submit" disabled={processing}>{processing ? d.form.buttons.saving : isEditing ? d.form.buttons.update : d.form.buttons.save}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

