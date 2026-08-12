import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import UserForm from "@/components/forms/user-form";

interface Props {
  availableRoles: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'المستخدمون', href: '/dashboard/users/list' },
  { title: 'إضافة', href: '#' },
];

export default function CreateUser({ availableRoles }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="إضافة مستخدم" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <UserForm availableRoles={availableRoles} />
      </div>
    </AppLayout>
  );
}
