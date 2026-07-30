import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  enrollments: { id: number; full_name: string; course: { title_ar: string } }[];
}

export default function CertificateForm({ enrollments }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    enrollment_id: '',
    certificate_number: '',
    file: null as File | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('dashboard.certificates.store'), { forceFormData: true });
  };

  return (
    <Card>
      <CardHeader><CardTitle>إصدار شهادة جديدة</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="enrollment_id">التسجيل *</Label>
            <Select value={data.enrollment_id} onValueChange={(v) => setData('enrollment_id', v)}>
              <SelectTrigger><SelectValue placeholder="اختر المتدرب والدورة" /></SelectTrigger>
              <SelectContent>
                {enrollments.map(e => (
                  <SelectItem key={e.id} value={String(e.id)}>{e.full_name} — {e.course.title_ar}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.enrollment_id && <p className="text-sm text-red-500 mt-1">{errors.enrollment_id}</p>}
          </div>

          <div>
            <Label htmlFor="certificate_number">رقم الشهادة *</Label>
            <Input id="certificate_number" value={data.certificate_number} onChange={e => setData('certificate_number', e.target.value)} dir="ltr" placeholder="MSET-XXXXXX" />
            {errors.certificate_number && <p className="text-sm text-red-500 mt-1">{errors.certificate_number}</p>}
          </div>

          <div>
            <Label htmlFor="file">ملف الشهادة (PDF) *</Label>
            <Input id="file" type="file" accept=".pdf,image/*" onChange={e => setData('file', e.target.files?.[0] || null)} />
            {errors.file && <p className="text-sm text-red-500 mt-1">{errors.file}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.certificates.list'))}>إلغاء</Button>
            <Button type="submit" disabled={processing}>{processing ? 'جاري...' : 'إصدار الشهادة'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
