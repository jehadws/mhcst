import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, NotificationTemplate } from '@/types';
import { Head } from '@inertiajs/react';
import NotificationTemplateForm from '@/components/forms/notification-template-form';

export default function EditNotificationTemplate({ template }: { template: NotificationTemplate }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'قوالب الإشعارات', href: '/dashboard/notification-templates/list' },
        { title: template.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`تعديل — ${template.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 max-w-3xl">
                <NotificationTemplateForm template={template} />
            </div>
        </AppLayout>
    );
}
