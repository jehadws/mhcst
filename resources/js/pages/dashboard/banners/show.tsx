import AppLayout from "@/layouts/app-layout";
import { Banner, BreadcrumbItem } from "@/types";
import { useSite } from "@/context/site-context";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Edit } from "lucide-react";

interface Props {
    banner: Banner;
}

export default function BannerDetailsPage({ banner }: Props) {
    const { t } = useSite();
    const d = t.dashboard;
    const c = d.banner;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: "/dashboard" },
        { title: d.sidebar.items.banners, href: "/dashboard/banners/list" },
        { title: banner.title || d.entities.banner.singular, href: "#" },
    ];

    const imageSrc = banner.image ? (banner.image.startsWith("http") ? banner.image : `/storage/${banner.image}`) : null;

    const fields = [
        { label: c.title, value: banner.title, rtl: false },
        { label: c.titleAr, value: banner.title_ar, rtl: true },
        { label: c.subtitle, value: banner.subtitle, rtl: false },
        { label: c.subtitleAr, value: banner.subtitle_ar, rtl: true },
        { label: c.ctaText, value: banner.cta_text, rtl: false },
        { label: c.ctaTextAr, value: banner.cta_text_ar, rtl: true },
        { label: c.ctaLink, value: banner.cta_link, rtl: false },
        { label: c.sortOrder, value: banner.sort_order !== null ? String(banner.sort_order) : "", rtl: true },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={banner.title || d.entities.banner.singular} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route("dashboard.banners.list"))}>
                        <ArrowRight className="ms-2 h-4 w-4" /> {d.show.backToList}
                    </Button>
                    <Button onClick={() => router.get(route("dashboard.banners.edit", banner.id))}>
                        <Edit className="ms-2 h-4 w-4" /> {d.show.edit} {d.entities.banner.singular}
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{banner.title || d.entities.banner.singular}</CardTitle>
                        <Badge variant={banner.is_active ? "default" : "secondary"}>
                            {banner.is_active ? d.status.active : d.status.inactive}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {imageSrc && (
                            <div className="overflow-hidden rounded-lg border">
                                <img src={imageSrc} alt={banner.title || d.entities.banner.singular} className="max-h-96 w-full object-cover" />
                            </div>
                        )}

                        <dl className="grid gap-4 sm:grid-cols-2">
                            {fields.map((field) => field.value ? (
                                <div key={field.label} className="rounded-lg border bg-muted/30 p-4">
                                    <dt className="mb-1 text-xs font-semibold text-muted-foreground">{field.label}:</dt>
                                    <dd className="text-sm font-medium" dir={field.rtl ? "rtl" : "ltr"}>{field.value}</dd>
                                </div>
                            ) : null)}
                        </dl>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
