import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Testimonial } from "@/types";
import { Head } from "@inertiajs/react";
import TestimonialForm from "@/components/forms/testimonial-form";

interface Props {
  testimonial: Testimonial;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'آراء العملاء', href: '/dashboard/testimonials/list' },
  { title: 'تعديل', href: '#' },
];

export default function EditTestimonial({ testimonial }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="تعديل رأي" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <TestimonialForm testimonial={testimonial} />
      </div>
    </AppLayout>
  );
}
