import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import NotificationTemplateForm from '@/components/forms/notification-template-form';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'لوحة التحكم', href: '/dashboard' },
    { title: 'قوالب الإشعارات', href: '/dashboard/notification-templates/list' },
    { title: 'إضافة', href: '#' },
];

export default function CreateNotificationTemplate() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="إضافة قالب إشعار" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 max-w-3xl">
                <NotificationTemplateForm />
            </div>
        </AppLayout>
    );
}
