import { NotificationTemplate } from '@/types';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    template?: NotificationTemplate;
}

export default function NotificationTemplateForm({ template }: Props) {
    const isEditing = !!template;

    const { data, setData, post, put, processing, errors } = useForm({
        name: template?.name ?? '',
        channel: template?.channel ?? 'email',
        trigger_event: template?.trigger_event ?? '',
        subject: template?.subject ?? '',
        body: template?.body ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('dashboard.notification-templates.update', template!.id));
        } else {
            post(route('dashboard.notification-templates.store'));
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{isEditing ? 'تعديل قالب إشعار' : 'إضافة قالب إشعار'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">اسم القالب *</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="channel">القناة *</Label>
                            <select
                                id="channel"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.channel}
                                onChange={(e) => setData('channel', e.target.value as 'email' | 'whatsapp')}
                            >
                                <option value="email">بريد إلكتروني</option>
                                <option value="whatsapp">واتساب</option>
                            </select>
                            {errors.channel && <p className="text-sm text-red-500 mt-1">{errors.channel}</p>}
                        </div>
                        <div>
                            <Label htmlFor="trigger_event">حدث التشغيل *</Label>
                            <Input
                                id="trigger_event"
                                value={data.trigger_event}
                                onChange={(e) => setData('trigger_event', e.target.value)}
                                placeholder="enrollment.created"
                            />
                            {errors.trigger_event && <p className="text-sm text-red-500 mt-1">{errors.trigger_event}</p>}
                        </div>
                    </div>

                    {data.channel === 'email' && (
                        <div>
                            <Label htmlFor="subject">موضوع الرسالة</Label>
                            <Input id="subject" value={data.subject} onChange={(e) => setData('subject', e.target.value)} />
                            {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject}</p>}
                        </div>
                    )}

                    <div>
                        <Label htmlFor="body">نص الرسالة *</Label>
                        <Textarea id="body" value={data.body} onChange={(e) => setData('body', e.target.value)} rows={8} />
                        {errors.body && <p className="text-sm text-red-500 mt-1">{errors.body}</p>}
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {isEditing ? 'حفظ التعديلات' : 'إنشاء القالب'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.notification-templates.list'))}>
                            إلغاء
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
