import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Faq } from "@/types";
import { Head } from "@inertiajs/react";
import FaqForm from "@/components/forms/faq-form";

interface Props {
  faq: Faq;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'الأسئلة الشائعة', href: '/dashboard/faqs/list' },
  { title: 'تعديل', href: '#' },
];

export default function EditFaq({ faq }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="تعديل سؤال" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <FaqForm faq={faq} />
      </div>
    </AppLayout>
  );
}
