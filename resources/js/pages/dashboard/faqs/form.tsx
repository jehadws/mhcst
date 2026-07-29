import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Faq } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  faq?: Faq;
}

export default function FaqFormPage({ faq }: Props) {
  const isEditing = !!faq;

  const { data, setData, post, put, processing, errors } = useForm({
    question: faq?.question || '',
    answer: faq?.answer || '',
    sort_order: faq?.sort_order || 0,
    is_published: faq?.is_published ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(route('dashboard.faqs.update', faq!.id));
    } else {
      post(route('dashboard.faqs.store'));
    }
  };

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'الأسئلة الشائعة', href: '/dashboard/faqs/list' },
    { title: isEditing ? 'تعديل' : 'إضافة', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={isEditing ? 'تعديل سؤال' : 'إضافة سؤال'} />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <Card>
          <CardHeader><CardTitle>{isEditing ? 'تعديل السؤال' : 'سؤال جديد'}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="question">السؤال *</Label>
                <Input id="question" value={data.question} onChange={e => setData('question', e.target.value)} />
                {errors.question && <p className="text-sm text-red-500 mt-1">{errors.question}</p>}
              </div>

              <div>
                <Label htmlFor="answer">الإجابة *</Label>
                <Textarea id="answer" value={data.answer} onChange={e => setData('answer', e.target.value)} rows={6} />
                {errors.answer && <p className="text-sm text-red-500 mt-1">{errors.answer}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="sort_order">الترتيب</Label><Input id="sort_order" type="number" value={data.sort_order} onChange={e => setData('sort_order', Number(e.target.value))} /></div>
                <div className="flex items-center gap-2 pt-6">
                  <Checkbox id="is_published" checked={data.is_published} onCheckedChange={(v) => setData('is_published', !!v)} />
                  <Label htmlFor="is_published">منشور</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.faqs.list'))}>إلغاء</Button>
                <Button type="submit" disabled={processing}>{processing ? 'جاري...' : isEditing ? 'تحديث' : 'حفظ'}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}