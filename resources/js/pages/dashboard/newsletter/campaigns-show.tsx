import AppLayout from "@/layouts/app-layout";
import { useSite } from "@/context/site-context";
import { BreadcrumbItem, NewsletterCampaign } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { ArrowLeft, Pencil, Send } from "lucide-react";
import { toast } from "sonner";

export default function NewsletterCampaignShowPage() {
    const { campaign } = usePage<{ campaign: NewsletterCampaign }>().props;
    const { t, locale } = useSite();
    const d = t.dashboard;
    const c = d.campaign;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.newsletterCampaigns, href: '/dashboard/newsletter/campaigns/list' },
        { title: campaign.subject, href: '#' },
    ];

    const [sendDialog, setSendDialog] = useState({ isOpen: false, loading: false });

    const handleSendConfirm = () => {
        setSendDialog((prev) => ({ ...prev, loading: true }));
        router.post(route('dashboard.newsletter.campaigns.send', campaign.id), {}, {
            onSuccess: () => { toast.success(c.sentSuccess); setSendDialog({ isOpen: false, loading: false }); },
            onError: () => toast.error(d.toast.operationFailed),
        });
    };

    const statusBadge = () => {
        const map = {
            draft: <Badge variant="secondary">{c.draftStatus}</Badge>,
            sending: <Badge className="bg-amber-500">{c.sendingStatus}</Badge>,
            sent: <Badge className="bg-emerald-500">{c.sentStatus}</Badge>,
            cancelled: <Badge variant="destructive">{c.cancelledStatus}</Badge>,
        };
        return map[campaign.status];
    };

    const stats = [
        { label: c.recipients, value: campaign.recipient_count },
        { label: c.sentCount, value: campaign.sent_count },
        { label: c.failedCount, value: campaign.failed_count },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={campaign.subject} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-2">
                    <Button variant="ghost" onClick={() => router.get(route('dashboard.newsletter.campaigns.list'))}>
                        <ArrowLeft className="h-4 w-4" /> {c.back}
                    </Button>
                    <div className="flex items-center gap-2">
                        {campaign.status === 'draft' && (
                            <Button variant="outline" onClick={() => router.get(route('dashboard.newsletter.campaigns.edit', campaign.id))}>
                                <Pencil className="h-4 w-4" /> {c.edit}
                            </Button>
                        )}
                        {campaign.status !== 'sent' && campaign.status !== 'sending' && (
                            <Button onClick={() => setSendDialog({ isOpen: true, loading: false })}>
                                <Send className="h-4 w-4" /> {c.send}
                            </Button>
                        )}
                    </div>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xl">{campaign.subject}</CardTitle>
                        {statusBadge()}
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            {stats.map((stat) => (
                                <div key={stat.label} className="rounded-lg border p-4 text-center">
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-1 text-sm">
                            {campaign.sent_at && (
                                <div>
                                    <span className="text-muted-foreground">{c.sentAt}: </span>
                                    <span>{new Date(campaign.sent_at).toLocaleString(locale === 'ar' ? 'ar-LY' : 'en-GB')}</span>
                                </div>
                            )}
                            <div>
                                <span className="text-muted-foreground">{c.createdAt}: </span>
                                <span>{new Date(campaign.created_at).toLocaleString(locale === 'ar' ? 'ar-LY' : 'en-GB')}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className="mb-2 font-semibold">{c.content}</h3>
                            <div className="prose prose-sm max-w-none prose-stone dark:prose-invert rounded-lg border p-4" dangerouslySetInnerHTML={{ __html: campaign.content }} />
                        </div>
                    </CardContent>
                </Card>

                <ConfirmationDialog
                    isOpen={sendDialog.isOpen}
                    onClose={() => setSendDialog({ isOpen: false, loading: false })}
                    onConfirm={handleSendConfirm}
                    title={c.sendCampaign}
                    description={c.sendConfirm}
                    confirmText={c.send}
                    cancelText={d.actions.cancel}
                    loading={sendDialog.loading}
                />
            </div>
        </AppLayout>
    );
}
