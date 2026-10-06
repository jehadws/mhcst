import AppLayout from "@/layouts/app-layout";
import { useSite } from "@/context/site-context";
import { Banner, BreadcrumbItem } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Eye, ImageOff, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function BannersListPage() {
    const { banners } = usePage<{ banners: Banner[] }>().props;
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: "/dashboard" },
        { title: d.sidebar.items.banners, href: "/dashboard/banners/list" },
    ];
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false, item: null as Banner | null });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item) return;
        router.delete(route("dashboard.banners.destroy", deleteDialog.item.id), {
            onSuccess: () => { toast.success(d.toast.deletedSuccess); setDeleteDialog({ isOpen: false, loading: false, item: null }); },
            onError: () => toast.error(d.toast.deleteFailed),
        });
    };

    const columns: ColumnDef<Banner>[] = [
        {
            accessorKey: "image",
            header: d.banner.image,
            cell: ({ row }) => row.original.image ? (
                <img src={row.original.image.startsWith("http") ? row.original.image : `/storage/${row.original.image}`} alt={row.original.title || d.entities.banner.singular} className="h-10 w-16 rounded object-cover" />
            ) : (
                <ImageOff className="h-4 w-4 text-muted-foreground" />
            ),
        },
        {
            accessorKey: "title",
            header: d.columns.title,
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.title || d.columns.title}</div>
                    <div className="text-xs text-muted-foreground">{row.original.subtitle || ""}</div>
                </div>
            ),
        },
        {
            accessorKey: "cta_link",
            header: d.banner.ctaLink,
            cell: ({ row }) => <span dir="ltr" className="line-clamp-1 max-w-xs text-xs">{row.original.cta_link || "—"}</span>,
        },
        {
            accessorKey: "sort_order",
            header: d.banner.sortOrder,
        },
        {
            accessorKey: "is_active",
            header: d.columns.isActive,
            cell: ({ row }) => (
                <Badge className={row.getValue("is_active") ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}>
                    {row.getValue("is_active") ? d.status.active : d.status.inactive}
                </Badge>
            ),
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(route("dashboard.banners.show", item.id))}><Eye className="w-4 h-4 ms-2" /> {d.actions.view}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.get(route("dashboard.banners.edit", item.id))}><Edit className="w-4 h-4 ms-2" /> {d.actions.edit}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteDialog({ isOpen: true, loading: false, item })} className="text-destructive"><Trash2 className="w-4 h-4 ms-2 text-destructive" /> {d.actions.delete}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={d.entities.banner.plural} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <DataTable
                    columns={columns}
                    data={banners}
                    title={d.entities.banner.plural}
                    description={d.entities.banner.description}
                    searchFields={["title", "subtitle", "cta_link"]}
                    onAddNew={() => router.get(route("dashboard.banners.create"))}
                    onRefresh={() => router.reload()}
                />
                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title={`${d.confirm.deleteTitle} ${d.entities.banner.singular}`}
                    description={`${d.confirm.deleteDescription} "${deleteDialog.item?.title || ""}"`}
                    confirmText={d.actions.delete}
                    cancelText={d.actions.cancel}
                    variant="destructive"
                    loading={deleteDialog.loading}
                />
            </div>
        </AppLayout>
    );
}
