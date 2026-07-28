import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Faq } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Edit } from "lucide-react";

interface Props {
    faq: Faq;
}

export default function FaqDetailsPage({ faq }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'الأسئلة الشائعة', href: '/dashboard/faqs/list' },
        { title: faq.question, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={faq.question} />
            <div className="mx-auto flex h-full flex-1 max-w-4xl flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.faqs.list'))}>
                        <ArrowRight className="ml-2 h-4 w-4" /> رجوع للقائمة
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.faqs.edit', faq.id))}>
                        <Edit className="ml-2 h-4 w-4" /> تعديل السؤال
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">{faq.question}</CardTitle>
                        <Badge variant={faq.is_published ? 'default' : 'secondary'}>
                            {faq.is_published ? 'منشور' : 'مسودة'}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border p-4 bg-muted/20">
                            <p className="text-sm leading-relaxed whitespace-pre-line">{faq.answer}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
