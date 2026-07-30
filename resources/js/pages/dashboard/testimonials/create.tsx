import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import TestimonialForm from "@/components/forms/testimonial-form";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'آراء العملاء', href: '/dashboard/testimonials/list' },
  { title: 'إضافة', href: '#' },
];

export default function CreateTestimonial() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="إضافة رأي" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <TestimonialForm />
      </div>
    </AppLayout>
  );
}
