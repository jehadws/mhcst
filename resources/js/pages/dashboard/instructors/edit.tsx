import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Instructor } from "@/types";
import { Head } from "@inertiajs/react";
import InstructorForm from "@/components/forms/instructor-form";

interface Props {
  instructor: Instructor;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'المدربون', href: '/dashboard/instructors/list' },
  { title: 'تعديل', href: '#' },
];

export default function EditInstructor({ instructor }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="تعديل مدرب" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <InstructorForm instructor={instructor} />
      </div>
    </AppLayout>
  );
}
