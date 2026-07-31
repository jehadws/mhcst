import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Enrollment } from "@/types";
import { useSite } from "@/context/site-context";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Edit, Mail, Phone } from "lucide-react";

interface Props {
    enrollment: Enrollment;
}

export default function EnrollmentDetailsPage({ enrollment }: Props) {
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.enrollments, href: '/dashboard/enrollments/list' },
        { title: enrollment.full_name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${d.entities.enrollment.singular} ${enrollment.full_name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.enrollments.list'))}>
                        <ArrowRight className="ms-2 h-4 w-4" /> {d.show.backToList}
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.enrollments.edit', enrollment.id))}>
                        <Edit className="ms-2 h-4 w-4" /> {d.show.edit} {d.entities.enrollment.singular}
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{enrollment.full_name}</CardTitle>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {d.show.courseLabel}: {enrollment.course?.title_ar || '-'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Badge>{d.status[enrollment.status as keyof typeof d.status] || enrollment.status}</Badge>
                            <Badge variant="outline">{d.payment[enrollment.payment_status as keyof typeof d.payment] || enrollment.payment_status}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                            <div className="flex items-center gap-2 rounded-lg border p-3">
                                <Mail className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">{d.show.emailLabel}</p>
                                    <p className="font-medium">{enrollment.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border p-3">
                                <Phone className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">{d.show.phoneLabel}</p>
                                    <p className="font-medium">{enrollment.phone}</p>
                                </div>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">{d.show.amountDue}</p>
                                <p className="font-medium">{enrollment.amount_due} د.ل</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">{d.show.amountPaid}</p>
                                <p className="font-medium text-primary">{enrollment.amount_paid} د.ل</p>
                            </div>
                        </div>

                        {enrollment.status_history && enrollment.status_history.length > 0 && (
                            <div className="rounded-lg border p-4">
                                <h4 className="mb-3 font-semibold">{d.show.statusHistory}:</h4>
                                <div className="space-y-2">
                                    {enrollment.status_history.map((history) => (
                                        <div key={history.id} className="flex items-center justify-between text-xs border-b pb-2">
                                            <span>
                                                {d.show.details} <span className="font-semibold">{d.status[history.old_status as keyof typeof d.status] || history.old_status}</span> →{' '}
                                                <span className="font-semibold text-primary">{d.status[history.new_status as keyof typeof d.status] || history.new_status}</span>
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
