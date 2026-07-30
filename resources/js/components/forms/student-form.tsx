import { Student } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  student?: Student;
}

export default function StudentForm({ student }: Props) {
  const isEditing = !!student;

  const { data, setData, post, put, processing, errors } = useForm({
    full_name: student?.full_name || '',
    email: student?.email || '',
    phone: student?.phone || '',
    city: student?.city || '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(route('dashboard.students.update', student!.id));
    } else {
      post(route('dashboard.students.store'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'تعديل بيانات المتدرب' : 'متدرب جديد'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name">الاسم الكامل *</Label>
            <Input id="full_name" value={data.full_name} onChange={(e) => setData('full_name', e.target.value)} />
            {errors.full_name && <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">المدينة</Label>
              <Input id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور {isEditing ? '(اتركها فارغة للإبقاء عليها)' : ''}</Label>
              <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.students.list'))}>إلغاء</Button>
            <Button type="submit" disabled={processing}>{processing ? 'جاري...' : isEditing ? 'تحديث' : 'حفظ'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
