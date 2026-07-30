import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Category, Course, Instructor } from "@/types";
import { Head } from "@inertiajs/react";
import CourseForm from "@/components/forms/course-form";

interface Props {
  course: Course;
  categories: Category[];
  instructors: Instructor[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'الدورات', href: '/dashboard/courses/list' },
  { title: 'تعديل', href: '#' },
];

export default function EditCourse({ course, categories, instructors }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="تعديل دورة" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <CourseForm course={course} categories={categories} instructors={instructors} />
      </div>
    </AppLayout>
  );
}
