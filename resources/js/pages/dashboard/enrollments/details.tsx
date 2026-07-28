import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Enrollment } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Edit, Mail, Phone } from "lucide-react";

interface Props {
    enrollment: Enrollment;
}

const statusLabels: Record<string, string> = {
    pending: 'قيد الانتظار',
    confirmed: 'مؤكد',
    completed: 'مكتمل',
    cancelled: 'ملغى',
};

const paymentStatusLabels: Record<string, string> = {
    unpaid: 'غير مدفوع',
    partial: 'مدفوع جزئياً',
    paid: 'مدفوع بالكامل',
};

export default function EnrollmentDetailsPage({ enrollment }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'التسجيلات', href: '/dashboard/enrollments/list' },
        { title: enrollment.full_name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`تسجيل ${enrollment.full_name}`} />
            <div className="mx-auto flex h-full flex-1 max-w-4xl flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.enrollments.list'))}>
                        <ArrowRight className="ml-2 h-4 w-4" /> رجوع للقائمة
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.enrollments.edit', enrollment.id))}>
                        <Edit className="ml-2 h-4 w-4" /> تعديل التسجيل
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{enrollment.full_name}</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                                الدورة: {enrollment.course?.title_ar || '-'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Badge>{statusLabels[enrollment.status] || enrollment.status}</Badge>
                            <Badge variant="outline">{paymentStatusLabels[enrollment.payment_status] || enrollment.payment_status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                            <div className="flex items-center gap-2 rounded-lg border p-3">
                                <Mail className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                                    <p className="font-medium">{enrollment.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border p-3">
                                <Phone className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">الهاتف</p>
                                    <p className="font-medium">{enrollment.phone}</p>
                                </div>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">المبلغ المستحق</p>
                                <p className="font-medium">{enrollment.amount_due} د.ل</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">المبلغ المدفوع</p>
                                <p className="font-medium text-primary">{enrollment.amount_paid} د.ل</p>
                            </div>
                        </div>

                        {enrollment.status_history && enrollment.status_history.length > 0 && (
                            <div className="rounded-lg border p-4">
                                <h4 className="mb-3 font-semibold">سجل تغييرات الحالة:</h4>
                                <div className="space-y-2">
                                    {enrollment.status_history.map((history) => (
                                        <div key={history.id} className="flex items-center justify-between text-xs border-b pb-2">
                                            <span>
                                                من <span className="font-semibold">{statusLabels[history.old_status] || history.old_status}</span> إلى{' '}
                                                <span className="font-semibold text-primary">{statusLabels[history.new_status] || history.new_status}</span>
                                            </span>
                                            <span className="text-muted-foreground">
                                                {new Date(history.created_at).toLocaleString('ar-LY')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
