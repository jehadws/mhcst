import { Banner } from '@/types';
import { useSite } from '@/context/site-context';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import ImageUploader from '@/components/image-uploader';
import { toast } from 'sonner';

interface Props {
  banner?: Banner;
}

export default function BannerForm({ banner }: Props) {
  const { t } = useSite();
  const d = t.dashboard;
  const c = d.banner;
  const isEditing = !!banner;

  const { data, setData, post: submitPost, put, processing, errors } = useForm({
    image: banner?.image || null,
    title: banner?.title || '',
    title_ar: banner?.title_ar || '',
    subtitle: banner?.subtitle || '',
    subtitle_ar: banner?.subtitle_ar || '',
    cta_text: banner?.cta_text || '',
    cta_text_ar: banner?.cta_text_ar || '',
    cta_link: banner?.cta_link || '',
    sort_order: banner?.sort_order ?? 0,
    is_active: banner?.is_active ?? true,
  });

  const errorFor = (key: string) => (errors as Record<string, string>)[key];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(route('dashboard.banners.update', banner!.id), {
        onSuccess: () => toast.success(d.toast.updatedSuccess),
        onError: () => toast.error(d.toast.operationFailed),
      });
    } else {
      submitPost(route('dashboard.banners.store'), {
        onSuccess: () => toast.success(d.toast.savedSuccess),
        onError: () => toast.error(d.toast.operationFailed),
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? d.form.buttons.editing : d.form.buttons.creating} {d.entities.banner.singular}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <ImageUploader value={data.image} onChange={(path) => setData('image', path)} folder="banners" label={c.image} />
            {errorFor('image') && <p className="text-sm text-red-500 mt-1">{errorFor('image')}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="banner-title">{c.title}</Label>
              <Input id="banner-title" value={data.title} onChange={(e) => setData('title', e.target.value)} />
              {errorFor('title') && <p className="text-sm text-red-500 mt-1">{errorFor('title')}</p>}
            </div>
            <div>
              <Label htmlFor="banner-title-ar">{c.titleAr}</Label>
              <Input id="banner-title-ar" value={data.title_ar} onChange={(e) => setData('title_ar', e.target.value)} dir="rtl" />
              {errorFor('title_ar') && <p className="text-sm text-red-500 mt-1">{errorFor('title_ar')}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="banner-subtitle">{c.subtitle}</Label>
              <Textarea id="banner-subtitle" value={data.subtitle} onChange={(e) => setData('subtitle', e.target.value)} rows={2} />
              {errorFor('subtitle') && <p className="text-sm text-red-500 mt-1">{errorFor('subtitle')}</p>}
            </div>
            <div>
              <Label htmlFor="banner-subtitle-ar">{c.subtitleAr}</Label>
              <Textarea id="banner-subtitle-ar" value={data.subtitle_ar} onChange={(e) => setData('subtitle_ar', e.target.value)} rows={2} dir="rtl" />
              {errorFor('subtitle_ar') && <p className="text-sm text-red-500 mt-1">{errorFor('subtitle_ar')}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="banner-cta-text">{c.ctaText}</Label>
              <Input id="banner-cta-text" value={data.cta_text} onChange={(e) => setData('cta_text', e.target.value)} />
              {errorFor('cta_text') && <p className="text-sm text-red-500 mt-1">{errorFor('cta_text')}</p>}
            </div>
            <div>
              <Label htmlFor="banner-cta-text-ar">{c.ctaTextAr}</Label>
              <Input id="banner-cta-text-ar" value={data.cta_text_ar} onChange={(e) => setData('cta_text_ar', e.target.value)} dir="rtl" />
              {errorFor('cta_text_ar') && <p className="text-sm text-red-500 mt-1">{errorFor('cta_text_ar')}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="banner-cta-link">{c.ctaLink}</Label>
              <Input id="banner-cta-link" value={data.cta_link} onChange={(e) => setData('cta_link', e.target.value)} dir="ltr" placeholder="/departments" />
              {errorFor('cta_link') && <p className="text-sm text-red-500 mt-1">{errorFor('cta_link')}</p>}
            </div>
            <div>
              <Label htmlFor="banner-sort-order">{c.sortOrder}</Label>
              <Input
                id="banner-sort-order"
                type="number"
                value={data.sort_order}
                onChange={(e) => setData('sort_order', Number(e.target.value))}
                dir="ltr"
              />
              {errorFor('sort_order') && <p className="text-sm text-red-500 mt-1">{errorFor('sort_order')}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="banner-active" checked={data.is_active} onCheckedChange={(checked) => setData('is_active', checked === true)} />
            <Label htmlFor="banner-active">{c.isActive}</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.banners.list'))}>
              {d.form.buttons.cancel}
            </Button>
            <Button type="submit" disabled={processing}>
              {processing ? d.form.buttons.saving : isEditing ? d.form.buttons.update : d.form.buttons.save}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

