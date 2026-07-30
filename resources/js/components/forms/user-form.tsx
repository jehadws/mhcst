import { User } from "@/types";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  user?: User;
}

export default function UserForm({ user }: Props) {
  const isEditing = !!user;

  const { data, setData, post, put, processing, errors } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(route('dashboard.users.update', user!.id));
    } else {
      post(route('dashboard.users.store'));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? 'تعديل بيانات المستخدم' : 'مستخدم جديد'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">الاسم *</Label>
            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">البريد الإلكتروني *</Label>
            <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} dir="ltr" />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password">كلمة المرور {isEditing ? '(اتركها فارغة للإبقاء عليها)' : '*'}</Label>
            <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.users.list'))}>إلغاء</Button>
            <Button type="submit" disabled={processing}>{processing ? 'جاري...' : isEditing ? 'تحديث' : 'حفظ'}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
