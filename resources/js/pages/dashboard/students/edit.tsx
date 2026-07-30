import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Student } from "@/types";
import { Head } from "@inertiajs/react";
import StudentForm from "@/components/forms/student-form";

interface Props {
  student: Student;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'المتدربين', href: '/dashboard/students/list' },
  { title: 'تعديل', href: '#' },
];

export default function EditStudent({ student }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="تعديل متدرب" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <StudentForm student={student} />
      </div>
    </AppLayout>
  );
}
