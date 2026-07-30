import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import InstructorForm from "@/components/forms/instructor-form";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'المدربون', href: '/dashboard/instructors/list' },
  { title: 'إضافة', href: '#' },
];

export default function CreateInstructor() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="إضافة مدرب" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <InstructorForm />
      </div>
    </AppLayout>
  );
}
