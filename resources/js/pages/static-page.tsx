import { Head } from "@inertiajs/react";
import Editor from "@/components/editor";
import { BreadcrumbItem } from "@/types";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteHeader } from "@/components/site/site-header";

export default function StaticPage({ title, content }: { title: string, content: string }) {
  const breadcrumbs: BreadcrumbItem[] = [
    {
      title: 'الصفحة الرئيسية',
      href: '/',
    },
    {
      title,
      href: '/',
    },
  ];
  return (
   <>
      <Head title={title} />
      <div className="min-h-screen bg-gray-50 pb-16">
        <SiteHeader />
        <nav className="container mx-auto py-4  px-4 md:px-16 text-sm text-gray-600">
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </nav>
        <div className="container mx-auto px-4 md:px-16 py-10">
          <Editor content={content || ""} editable={false} onChange={()=>{}} />
        </div>
      </div>
    </>
  );
}
