import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import BannerForm from "@/components/forms/banner-form";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'البنرات', href: '/dashboard/banners/list' },
  { title: 'إضافة', href: '#' },
];

export default function CreateBanner() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="إضافة بنر" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <BannerForm />
      </div>
    </AppLayout>
  );
}
