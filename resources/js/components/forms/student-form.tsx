import { Student } from "@/types";
import { useSite } from "@/context/site-context";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  student?: Student;
}

export default function StudentForm({ student }: Props) {
  const { t } = useSite();
  const d = t.dashboard;
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
        <CardTitle>{isEditing ? d.form.buttons.editing : d.form.buttons.creating}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="full_name">{d.form.labels.fullName} *</Label>
            <Input id="full_name" value={data.full_name} onChange={(e) => setData('full_name', e.target.value)} />
            {errors.full_name && <p className="mt-1 text-sm text-red-500">{errors.full_name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">{d.form.labels.email}</Label>
              <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="phone">{d.form.labels.phone} *</Label>
              <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
              {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">{d.form.labels.city}</Label>
              <Input id="city" value={data.city} onChange={(e) => setData('city', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">{d.form.labels.password} {isEditing ? `(${d.form.placeholders.leaveEmpty})` : ''}</Label>
              <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.students.list'))}>{d.form.buttons.cancel}</Button>
            <Button type="submit" disabled={processing}>{processing ? d.form.buttons.saving : isEditing ? d.form.buttons.update : d.form.buttons.save}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
