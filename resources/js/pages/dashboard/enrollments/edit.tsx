import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Enrollment } from "@/types";
import { Head } from "@inertiajs/react";
import EnrollmentForm from "@/components/forms/enrollment-form";

interface Props {
  enrollment: Enrollment;
  courses: Array<{ id: number; title_ar: string }>;
  students: Array<{ id: number; full_name: string }>;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'التسجيلات', href: '/dashboard/enrollments/list' },
  { title: 'تعديل', href: '#' },
];

export default function EditEnrollment({ enrollment, courses, students }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="تعديل تسجيل" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <EnrollmentForm enrollment={enrollment} courses={courses} students={students} />
      </div>
    </AppLayout>
  );
}
