import AppLayout from "@/layouts/app-layout";
import { Banner, BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import BannerForm from "@/components/forms/banner-form";

interface Props {
  banner: Banner;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'البنرات', href: '/dashboard/banners/list' },
  { title: 'تعديل', href: '#' },
];

export default function EditBanner({ banner }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="تعديل بنر" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <BannerForm banner={banner} />
      </div>
    </AppLayout>
  );
}
