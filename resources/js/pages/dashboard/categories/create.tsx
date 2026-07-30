import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Category } from "@/types";
import { Head } from "@inertiajs/react";
import CategoryForm from "@/components/forms/category-form";

interface Props {
  parents: Category[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'التصنيفات', href: '/dashboard/categories/list' },
  { title: 'إضافة', href: '#' },
];

export default function CreateCategory({ parents }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="إضافة تصنيف" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <CategoryForm parents={parents} />
      </div>
    </AppLayout>
  );
}
