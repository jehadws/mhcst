import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { useSite } from "@/context/site-context";
import { Head } from "@inertiajs/react";
import BannerForm from "@/components/forms/banner-form";

export default function CreateBannerPage() {
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: "/dashboard" },
        { title: d.sidebar.items.banners, href: "/dashboard/banners/list" },
        { title: d.actions.create, href: "#" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${d.actions.create} ${d.entities.banner.singular}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 sm:p-6">
                <BannerForm />
            </div>
        </AppLayout>
    );
}
