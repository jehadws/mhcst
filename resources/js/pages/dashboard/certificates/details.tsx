import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Certificate } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Download } from "lucide-react";

interface Props {
    certificate: Certificate;
}

export default function CertificateDetailsPage({ certificate }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'الشهادات', href: '/dashboard/certificates/list' },
        { title: certificate.certificate_number, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`شهادة ${certificate.certificate_number}`} />
            <div className="mx-auto flex h-full flex-1 max-w-4xl flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.certificates.list'))}>
                        <ArrowRight className="ml-2 h-4 w-4" /> رجوع للقائمة
                    </Button>
                    {certificate.file_path && (
                        <a
                            href={certificate.file_path.startsWith('http') ? certificate.file_path : `/storage/${certificate.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Button>
                                <Download className="ml-2 h-4 w-4" /> تحميل الشهادة
                            </Button>
                        </a>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>شهادة رقم: {certificate.certificate_number}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">اسم المتدرب</p>
                                <p className="font-semibold">{certificate.student?.full_name || '-'}</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">الدورة التدريبية</p>
                                <p className="font-semibold">{certificate.course?.title_ar || '-'}</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">تاريخ الإصدار</p>
                                <p className="font-semibold">
                                    {certificate.issued_at ? new Date(certificate.issued_at).toLocaleDateString('ar-LY') : '-'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
