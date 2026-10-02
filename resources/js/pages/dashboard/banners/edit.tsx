import AppLayout from "@/layouts/app-layout";
import { Banner, BreadcrumbItem } from "@/types";
import { useSite } from "@/context/site-context";
import { Head } from "@inertiajs/react";
import BannerForm from "@/components/forms/banner-form";

interface Props {
    banner: Banner;
}

export default function EditBannerPage({ banner }: Props) {
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: "/dashboard" },
        { title: d.sidebar.items.banners, href: "/dashboard/banners/list" },
        { title: banner.title || d.entities.banner.singular, href: "#" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${d.actions.edit} ${d.entities.banner.singular}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <BannerForm banner={banner} />
            </div>
        </AppLayout>
    );
}
