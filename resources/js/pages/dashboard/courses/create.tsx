import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Category, Instructor } from "@/types";
import { Head } from "@inertiajs/react";
import CourseForm from "@/components/forms/course-form";

interface Props {
  categories: Category[];
  instructors: Instructor[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'الدورات', href: '/dashboard/courses/list' },
  { title: 'إضافة', href: '#' },
];

export default function CreateCourse({ categories, instructors }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="إضافة دورة جديدة" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <CourseForm categories={categories} instructors={instructors} />
      </div>
    </AppLayout>
  );
}
