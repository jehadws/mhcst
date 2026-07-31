import AppLayout from "@/layouts/app-layout";
import { Banner, BreadcrumbItem } from "@/types";
import { useSite } from "@/context/site-context";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Edit } from "lucide-react";

interface Props {
    banner: Banner;
}

export default function BannerDetailsPage({ banner }: Props) {
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.banners, href: '/dashboard/banners/list' },
        { title: d.entities.banner.singular, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={banner.title || d.entities.banner.singular} />

            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.banners.list'))}>
                        <ArrowRight className="ms-2 h-4 w-4" /> {d.show.backToList}
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.banners.edit', banner.id))}>
                        <Edit className="ms-2 h-4 w-4" /> {d.show.edit} {d.entities.banner.singular}
                    </Button>
                </div>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{banner.title || d.entities.banner.singular}</CardTitle>
                        <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                            {banner.is_active ? d.status.active : d.status.inactive}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {banner.image && (
                            <div className="overflow-hidden rounded-lg border">
                                <img
                                    src={banner.image.startsWith('http') ? banner.image : `/storage/${banner.image}`}
                                    alt={banner.title || ''}
                                    className="max-h-80 w-full object-cover"
                                />
                            </div>
                        )}
                        <p className="text-sm text-muted-foreground">{d.show.sortOrder}: {banner.sort_order}</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
