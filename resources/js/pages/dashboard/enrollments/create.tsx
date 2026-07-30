import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import EnrollmentForm from "@/components/forms/enrollment-form";

interface Props {
  courses: Array<{ id: number; title_ar: string }>;
  students: Array<{ id: number; full_name: string }>;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'التسجيلات', href: '/dashboard/enrollments/list' },
  { title: 'إضافة', href: '#' },
];

export default function CreateEnrollment({ courses, students }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="تسجيل جديد" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <EnrollmentForm courses={courses} students={students} />
      </div>
    </AppLayout>
  );
}
