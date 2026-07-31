import AppLayout from "@/layouts/app-layout";
import { useSite } from "@/context/site-context";
import { BreadcrumbItem } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Editor from "@/components/editor";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function NewsletterCampaignCreatePage() {
    const { t } = useSite();
    const d = t.dashboard;
    const c = d.campaign;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.newsletterCampaigns, href: '/dashboard/newsletter/campaigns/list' },
        { title: d.actions.create, href: '#' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        subject: '',
        content: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('dashboard.newsletter.campaigns.store'), {
            onSuccess: () => toast.success(c.created),
            onError: () => toast.error(d.toast.operationFailed),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.create} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Card>
                    <CardHeader><CardTitle>{c.create}</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="subject">{c.subject} *</Label>
                                <Input id="subject" value={data.subject} onChange={e => setData('subject', e.target.value)} placeholder={c.subjectPlaceholder} />
                                {errors.subject && <p className="text-sm text-red-500 mt-1">{errors.subject}</p>}
                            </div>

                            <div>
                                <Label>{c.content} *</Label>
                                <div className="rounded-lg border border-input bg-background">
                                    <Editor content={data.content} onChange={(html) => setData('content', html)} />
                                </div>
                                {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content}</p>}
                                <p className="text-xs text-muted-foreground mt-1">{c.unsubscribeNote}</p>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => router.get(route('dashboard.newsletter.campaigns.list'))}>{d.actions.cancel}</Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? c.sending : <><Save className="h-4 w-4" /> {c.saveDraft}</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
