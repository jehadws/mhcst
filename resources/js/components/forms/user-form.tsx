import { User } from "@/types";
import { useSite } from "@/context/site-context";
import { roleLabel } from "@/lib/dashboard-access";
import { router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Props {
  user?: User & { roles?: string[] };
  availableRoles?: string[];
}

export default function UserForm({ user, availableRoles = [] }: Props) {
  const { t, locale } = useSite();
  const d = t.dashboard;
  const isEditing = !!user;

  const { data, setData, post, put, processing, errors } = useForm({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    roles: user?.roles ?? [],
  });

  const toggleRole = (role: string, checked: boolean) => {
    setData('roles', checked
      ? [...data.roles, role]
      : data.roles.filter((r) => r !== role));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      put(route('dashboard.users.update', user!.id), {
        onSuccess: () => toast.success(d.toast.updatedSuccess),
        onError: () => toast.error(d.toast.operationFailed),
      });
    } else {
      post(route('dashboard.users.store'), {
        onSuccess: () => toast.success(d.toast.savedSuccess),
        onError: () => toast.error(d.toast.operationFailed),
      });
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
            <Label htmlFor="name">{d.form.labels.name} *</Label>
            <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">{d.form.labels.email} *</Label>
            <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} dir="ltr" />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="password">{d.form.labels.password} {isEditing ? `(${d.form.placeholders.leaveEmpty})` : '*'}</Label>
            <Input id="password" type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          <div>
            <Label>{d.form.labels.roles} *</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {availableRoles.map((role) => (
                <label key={role} className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-muted/50">
                  <Checkbox
                    checked={data.roles.includes(role)}
                    onCheckedChange={(checked) => toggleRole(role, checked === true)}
                  />
                  <span className="text-sm">{roleLabel(role, locale === 'ar' ? 'ar' : 'en')}</span>
                </label>
              ))}
            </div>
            {errors.roles && <p className="mt-1 text-sm text-red-500">{errors.roles}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.users.list'))}>{d.form.buttons.cancel}</Button>
            <Button type="submit" disabled={processing}>{processing ? d.form.buttons.saving : isEditing ? d.form.buttons.update : d.form.buttons.save}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
