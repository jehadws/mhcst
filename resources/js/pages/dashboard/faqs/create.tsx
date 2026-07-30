import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import FaqForm from "@/components/forms/faq-form";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'الأسئلة الشائعة', href: '/dashboard/faqs/list' },
  { title: 'إضافة', href: '#' },
];

export default function CreateFaq() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="إضافة سؤال" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <FaqForm />
      </div>
    </AppLayout>
  );
}
