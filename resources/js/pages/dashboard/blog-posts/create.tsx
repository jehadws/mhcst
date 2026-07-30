import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import BlogPostForm from "@/components/forms/blog-post-form";

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'المدونة', href: '/dashboard/blog-posts/list' },
  { title: 'إضافة', href: '#' },
];

export default function CreateBlogPost() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="إضافة مقال" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <BlogPostForm />
      </div>
    </AppLayout>
  );
}
