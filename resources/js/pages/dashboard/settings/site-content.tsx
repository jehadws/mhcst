import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import FormField from '@/components/shared/form-field';
import FormHeader from '@/components/shared/form-header';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Editor from '@/components/editor';


type SiteContent = {
  id: number;
  slug: string;
  title: string;
  content: string;
}

type FormValues = {
  title: string;
  content: string;
}

export default function EditSiteContentPage() {
  const { content } = usePage<{ content: SiteContent }>().props;

  const breadcrumbs = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: content.title, href: `/dashboard/pages/${content.slug}` }
  ];

  const form = useForm<FormValues>({
    title: content.title,
    content: content.content,
  });

  const handleInputChange = (name: keyof FormValues, value: string) => {
    form.setData(name, value);
    if (form.errors[name]) {
      form.clearErrors(name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    form.put(`/dashboard/pages/${content.slug}`, {
      preserveScroll: true,
      onError: (errors) => {
        toast.error('الرجاء إصلاح أخطاء التحقق');
        console.error('Validation errors:', errors);
      },
      onSuccess: () => {
        toast.success('تم تحديث المحتوى بنجاح');
      },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`تعديل ${content.title}`} />

      <div className="bg-background flex h-full min-h-screen flex-1 flex-col gap-4 p-4">
        <FormHeader
          title={`تعديل ${content.title}`}
          description="ادخل جميع البيانات المطلوبة"
          onCancel={() => window.history.back()}
          onSave={handleSubmit}
          form={form}
        />

        <div className="grid grid-cols-1 gap-6">
          <FormField
            label="العنوان"
            error={form.errors.title}
            className="mb-6"
          >
            <Input
              id="title"
              name="title"
              value={form.data.title || ''}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={cn(form.errors.title && 'border-destructive')}
              required
            />
          </FormField>

          <FormField
            label="المحتوى"
            htmlFor="content"
            error={form.errors.content}
          >
            <Editor
              content={form.data.content || ''}
              onChange={(value) => handleInputChange("content", value)}
            />
          </FormField>
        </div>
      </div>
    </AppLayout>
  );
}
