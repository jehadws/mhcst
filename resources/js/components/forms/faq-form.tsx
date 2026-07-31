import { Faq } from "@/types";
import { useSite } from "@/context/site-context";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Props {
  faq?: Faq;
}

export default function FaqForm({ faq }: Props) {
  const { t } = useSite();
  const d = t.dashboard;
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
      put(route('dashboard.faqs.update', faq!.id), {
        onSuccess: () => toast.success(d.toast.updatedSuccess),
        onError: () => toast.error(d.toast.operationFailed),
      });
    } else {
      post(route('dashboard.faqs.store'), {
        onSuccess: () => toast.success(d.toast.savedSuccess),
        onError: () => toast.error(d.toast.operationFailed),
      });
    }
  };

  return (
    <Card>
      <CardHeader><CardTitle>{isEditing ? d.form.buttons.editing : d.form.buttons.creating} {d.entities.faq.singular}</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="question">{d.columns.question} *</Label>
            <Input id="question" value={data.question} onChange={e => setData('question', e.target.value)} />
            {errors.question && <p className="text-sm text-red-500 mt-1">{errors.question}</p>}
          </div>

          <div>
            <Label htmlFor="answer">{d.columns.answer} *</Label>
            <Textarea id="answer" value={data.answer} onChange={e => setData('answer', e.target.value)} rows={6} />
            {errors.answer && <p className="text-sm text-red-500 mt-1">{errors.answer}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label htmlFor="sort_order">{d.columns.sortOrder}</Label><Input id="sort_order" type="number" value={data.sort_order} onChange={e => setData('sort_order', Number(e.target.value))} /></div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox id="is_published" checked={data.is_published} onCheckedChange={(v) => setData('is_published', !!v)} />
              <Label htmlFor="is_published">{d.form.labels.isActive}</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.faqs.list'))}>{d.form.buttons.cancel}</Button>
            <Button type="submit" disabled={processing}>{processing ? d.form.buttons.saving : isEditing ? d.form.buttons.update : d.form.buttons.save}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
