import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, NotificationTemplate } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Edit } from 'lucide-react';

export default function ShowNotificationTemplate({ template }: { template: NotificationTemplate }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'قوالب الإشعارات', href: '/dashboard/notification-templates/list' },
        { title: template.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={template.name} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 max-w-3xl">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.notification-templates.list'))}>
                        <ArrowRight className="ms-2 h-4 w-4" /> العودة للقائمة
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.notification-templates.edit', template.id))}>
                        <Edit className="ms-2 h-4 w-4" /> تعديل
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{template.name}</CardTitle>
                        <Badge variant="secondary">{template.channel === 'email' ? 'بريد إلكتروني' : 'واتساب'}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div>
                            <p className="text-muted-foreground mb-1">حدث التشغيل</p>
                            <p className="font-mono">{template.trigger_event}</p>
                        </div>
                        {template.subject && (
                            <div>
                                <p className="text-muted-foreground mb-1">الموضوع</p>
                                <p>{template.subject}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-muted-foreground mb-1">نص الرسالة</p>
                            <pre className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">{template.body}</pre>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
