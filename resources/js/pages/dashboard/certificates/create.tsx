import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import CertificateForm from "@/components/forms/certificate-form";

interface Props {
  enrollments: { id: number; full_name: string; course: { title_ar: string } }[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'الشهادات', href: '/dashboard/certificates/list' },
  { title: 'إضافة', href: '#' },
];

export default function CreateCertificate({ enrollments }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="إصدار شهادة" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <CertificateForm enrollments={enrollments} />
      </div>
    </AppLayout>
  );
}
