import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, SiteSetting } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Edit } from "lucide-react";

interface Props {
    siteSetting: SiteSetting;
}

export default function SiteSettingDetailsPage({ siteSetting }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'إعدادات الموقع', href: '/dashboard/site-settings/list' },
        { title: siteSetting.key, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={siteSetting.key} />
            <div className="mx-auto flex h-full flex-1 max-w-4xl flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.site-settings.list'))}>
                        <ArrowRight className="ml-2 h-4 w-4" /> رجوع للقائمة
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.site-settings.edit', siteSetting.id))}>
                        <Edit className="ml-2 h-4 w-4" /> تعديل الخاصية
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-mono text-base">{siteSetting.key}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg border p-4 bg-muted/20">
                            <p className="text-xs text-muted-foreground mb-1">النوع: {siteSetting.type}</p>
                            <pre className="text-sm font-mono whitespace-pre-wrap">{siteSetting.value}</pre>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
