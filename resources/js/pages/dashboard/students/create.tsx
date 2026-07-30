import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import StudentForm from "@/components/forms/student-form";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'المتدربين', href: '/dashboard/students/list' },
  { title: 'إضافة', href: '#' },
];

export default function CreateStudent() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="إضافة متدرب" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <StudentForm />
      </div>
    </AppLayout>
  );
}
