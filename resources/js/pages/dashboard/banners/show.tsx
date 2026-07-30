import AppLayout from "@/layouts/app-layout";
import { Banner, BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Edit } from "lucide-react";

interface Props {
    banner: Banner;
}

export default function BannerDetailsPage({ banner }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'البنرات', href: '/dashboard/banners/list' },
        { title: banner.title || 'بنر', href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={banner.title || 'تفاصيل البنر'} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.banners.list'))}>
                        <ArrowRight className="ml-2 h-4 w-4" /> رجوع للقائمة
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.banners.edit', banner.id))}>
                        <Edit className="ml-2 h-4 w-4" /> تعديل البنر
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{banner.title || 'بنر إعلاني'}</CardTitle>
                        <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                            {banner.is_active ? 'نشط' : 'غير نشط'}
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
                        <p className="text-sm text-muted-foreground">الترتيب: {banner.sort_order}</p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
