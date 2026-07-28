import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Edit } from "lucide-react";

interface Props {
    page: { id: number; key: string; title: string; content: string; updated_at?: string };
}

export default function CmsPageDetailsPage({ page }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'الصفحات', href: '/dashboard/cms-pages/list' },
        { title: page.title, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={page.title} />
            <div className="mx-auto flex h-full flex-1 max-w-4xl flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.cms-pages.list'))}>
                        <ArrowRight className="ml-2 h-4 w-4" /> رجوع للقائمة
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.cms-pages.edit', page.id))}>
                        <Edit className="ml-2 h-4 w-4" /> تعديل الصفحة
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{page.title}</CardTitle>
                            <p className="mt-1 text-xs text-muted-foreground font-mono" dir="ltr">
                                Key: {page.key}
                            </p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg border p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap bg-muted/20" dir="ltr">
                            {page.content}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
