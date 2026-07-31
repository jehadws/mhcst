import AppLayout from "@/layouts/app-layout";
import { useSite } from "@/context/site-context";
import { BreadcrumbItem, NewsletterCampaign, PaginatedData } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { ColumnDef } from '@tanstack/react-table';
import ConfirmationDialog from "@/components/confirmation-dialog";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link } from "@inertiajs/react";

export default function NewsletterCampaignsPage() {
    const { campaigns } = usePage<{ campaigns: PaginatedData<NewsletterCampaign> }>().props;
    const { t, locale } = useSite();
    const d = t.dashboard;
    const c = d.campaign;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.newsletterCampaigns, href: '/dashboard/newsletter/campaigns/list' },
    ];
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false, item: null as NewsletterCampaign | null });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item) return;
        setDeleteDialog((prev) => ({ ...prev, loading: true }));
        router.delete(route('dashboard.newsletter.campaigns.destroy', deleteDialog.item.id), {
            onSuccess: () => { toast.success(d.toast.deletedSuccess); setDeleteDialog({ isOpen: false, loading: false, item: null }); },
            onError: () => toast.error(d.toast.deleteFailed),
        });
    };

    const statusBadge = (status: NewsletterCampaign['status']) => {
        const map = {
            draft: <Badge variant="secondary">{c.draftStatus}</Badge>,
            sending: <Badge className="bg-amber-500">{c.sendingStatus}</Badge>,
            sent: <Badge className="bg-emerald-500">{c.sentStatus}</Badge>,
            cancelled: <Badge variant="destructive">{c.cancelledStatus}</Badge>,
        };
        return map[status];
    };

    const columns: ColumnDef<NewsletterCampaign>[] = [
        {
            accessorKey: 'subject',
            header: c.subject,
            cell: ({ row }) => (
                <Link href={route('dashboard.newsletter.campaigns.show', row.original.id)} className="font-medium hover:underline">
                    {row.getValue('subject')}
                </Link>
            ),
        },
        {
            accessorKey: 'status',
            header: c.status,
            cell: ({ row }) => statusBadge(row.getValue('status')),
        },
        {
            accessorKey: 'recipient_count',
            header: c.recipients,
            cell: ({ row }) => row.getValue('recipient_count'),
        },
        {
            accessorKey: 'sent_count',
            header: c.sentCount,
            cell: ({ row }) => row.getValue('sent_count'),
        },
        {
            accessorKey: 'failed_count',
            header: c.failedCount,
            cell: ({ row }) => row.getValue('failed_count') || 0,
        },
        {
            accessorKey: 'sent_at',
            header: c.sentAt,
            cell: ({ row }) => {
                const date = row.getValue('sent_at') as string | null;
                return date ? new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-GB') : '-';
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.newsletter.campaigns.show', item.id))}>{c.view}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteDialog({ isOpen: true, loading: false, item })} className="text-destructive"><Trash2 className="w-4 h-4 ms-2 text-destructive" /> {d.actions.delete}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={d.entities.newsletterCampaign.plural} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={campaigns.data}
                    title={d.entities.newsletterCampaign.plural}
                    description={d.entities.newsletterCampaign.description}
                    searchFields={['subject']}
                    onRefresh={() => router.reload()}
                    onAddNew={() => router.get(route('dashboard.newsletter.campaigns.create'))}
                />
                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title={`${d.confirm.deleteTitle} ${d.entities.newsletterCampaign.singular}`}
                    description={`${d.confirm.deleteDescription} "${deleteDialog.item?.subject}"؟`}
                    confirmText={d.actions.delete}
                    cancelText={d.actions.cancel}
                    variant="destructive"
                    loading={deleteDialog.loading}
                />
            </div>
        </AppLayout>
    );
}
