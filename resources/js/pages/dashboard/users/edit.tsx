import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, User } from "@/types";
import { Head } from "@inertiajs/react";
import UserForm from "@/components/forms/user-form";

interface Props {
  user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'المستخدمون', href: '/dashboard/users/list' },
  { title: 'تعديل', href: '#' },
];

export default function EditUser({ user }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="تعديل مستخدم" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <UserForm user={user} />
      </div>
    </AppLayout>
  );
}
