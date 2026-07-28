import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Testimonial } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Edit } from "lucide-react";

interface Props {
    testimonial: Testimonial;
}

export default function TestimonialDetailsPage({ testimonial }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'آراء العملاء', href: '/dashboard/testimonials/list' },
        { title: testimonial.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={testimonial.name} />
            <div className="mx-auto flex h-full flex-1 max-w-4xl flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.testimonials.list'))}>
                        <ArrowRight className="ml-2 h-4 w-4" /> رجوع للقائمة
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.testimonials.edit', testimonial.id))}>
                        <Edit className="ml-2 h-4 w-4" /> تعديل الرأي
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{testimonial.name}</CardTitle>
                            {(testimonial.role_title || testimonial.company) && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {[testimonial.role_title, testimonial.company].filter(Boolean).join(' - ')}
                                </p>
                            )}
                        </div>
                        <Badge variant={testimonial.is_published ? 'default' : 'secondary'}>
                            {testimonial.is_published ? 'منشور' : 'مسودة'}
                        </Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border p-4 bg-muted/20">
                            <p className="text-sm leading-relaxed whitespace-pre-line italic">"{testimonial.quote}"</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
