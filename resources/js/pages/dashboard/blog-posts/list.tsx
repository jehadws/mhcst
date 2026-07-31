import AppLayout from "@/layouts/app-layout";
import { useSite } from "@/context/site-context";
import { BlogPost, BreadcrumbItem, PaginatedData } from "@/types";
import { Head, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { ColumnDef } from '@tanstack/react-table';
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmationDialog from "@/components/confirmation-dialog";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function BlogPostsListPage() {
    const { posts } = usePage<{ posts: PaginatedData<BlogPost> }>().props;
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.blogPosts, href: '/dashboard/blog-posts/list' },
    ];
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, loading: false, item: null as BlogPost | null });

    const handleDeleteConfirm = () => {
        if (!deleteDialog.item) return;
        router.delete(route('dashboard.blog-posts.destroy', deleteDialog.item.id), {
            onSuccess: () => { toast.success(d.toast.deletedSuccess); setDeleteDialog({ isOpen: false, loading: false, item: null }); },
            onError: () => toast.error(d.toast.deleteFailed),
        });
    };

    const columns: ColumnDef<BlogPost>[] = [
        {
            id: 'select',
            header: ({ table }) => (
                <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} className="ms-2" />
            ),
            cell: ({ row }) => (
                <Checkbox className="ms-2" checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: 'title',
            header: d.columns.title,
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    {row.original.cover_image && (
                        <img src={row.original.cover_image.startsWith('http') ? row.original.cover_image : `/storage/${row.original.cover_image}`} alt="" className="w-10 h-10 rounded object-cover" />
                    )}
                    <span className="line-clamp-1 max-w-xs">{row.getValue('title')}</span>
                </div>
            ),
        },
        {
            accessorKey: 'author.name',
            header: d.columns.author || d.columns.name,
            cell: ({ row }) => row.original.author?.name || '-',
        },
        {
            accessorKey: 'status',
            header: d.columns.status,
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return <Badge className={status === 'published' ? 'bg-green-500' : 'bg-gray-500'}>{d.status[status as keyof typeof d.status]}</Badge>;
            },
        },
        {
            accessorKey: 'published_at',
            header: d.columns.publishedAt || d.columns.date,
            cell: ({ row }) => row.getValue('published_at') ? new Date(row.getValue('published_at') as string).toLocaleDateString('ar-LY') : '-',
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.blog-posts.show', item.id))}><Eye className="w-4 h-4 ms-2" /> {d.actions.view}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.get(route('dashboard.blog-posts.edit', item.id))}><Edit className="w-4 h-4 ms-2" /> {d.actions.edit}</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteDialog({ isOpen: true, loading: false, item })} className="text-destructive"><Trash2 className="w-4 h-4 ms-2 text-destructive" /> {d.actions.delete}</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const bulkActions = [
        {
            label: `${d.actions.delete} ${d.entities.blogPost.plural}`,
            action: (selectedRows: BlogPost[]) => {
                router.post(route('dashboard.blog-posts.bulk-actions'), { action: 'delete_selected', entries: selectedRows.map(r => r.id) }, {
                    onSuccess: () => toast.success(d.toast.deletedSuccess), onError: () => toast.error(d.toast.operationFailed)
                });
            },
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={d.entities.blogPost.plural} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <DataTable
                    columns={columns}
                    data={posts.data}
                    title={d.entities.blogPost.plural}
                    description={d.entities.blogPost.description}
                    searchFields={['title']}
                    bulkActions={bulkActions}
                    onAddNew={() => router.get(route('dashboard.blog-posts.create'))}
                    onRefresh={() => router.reload()}
                />
                <ConfirmationDialog
                    isOpen={deleteDialog.isOpen}
                    onClose={() => setDeleteDialog({ isOpen: false, loading: false, item: null })}
                    onConfirm={handleDeleteConfirm}
                    title={`${d.confirm.deleteTitle} ${d.entities.blogPost.singular}`}
                    description={`${d.confirm.deleteDescription} "${deleteDialog.item?.title}"؟`}
                    confirmText={d.actions.delete}
                    cancelText={d.actions.cancel}
                    variant="destructive"
                    loading={deleteDialog.loading}
                />
            </div>
        </AppLayout>
    );
}
