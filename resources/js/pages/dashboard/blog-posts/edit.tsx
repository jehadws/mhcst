import AppLayout from "@/layouts/app-layout";
import { BlogPost, BreadcrumbItem } from "@/types";
import { Head } from "@inertiajs/react";
import BlogPostForm from "@/components/forms/blog-post-form";

interface Props {
  post: BlogPost;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'لوحة التحكم', href: '/dashboard' },
  { title: 'المدونة', href: '/dashboard/blog-posts/list' },
  { title: 'تعديل', href: '#' },
];

export default function EditBlogPost({ post }: Props) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="تعديل مقال" />
      <div className="flex h-full flex-1 flex-col gap-4 p-4">
        <BlogPostForm post={post} />
      </div>
    </AppLayout>
  );
}
