import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Student } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Edit, Mail, MapPin, Phone } from "lucide-react";

interface Props {
    student: Student;
}

export default function StudentDetailsPage({ student }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'المتدربين', href: '/dashboard/students/list' },
        { title: student.full_name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={student.full_name} />
            <div className="mx-auto flex h-full flex-1 max-w-4xl flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.students.list'))}>
                        <ArrowRight className="ml-2 h-4 w-4" /> رجوع للقائمة
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.students.edit', student.id))}>
                        <Edit className="ml-2 h-4 w-4" /> تعديل البيانات
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{student.full_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
                            <div className="flex items-center gap-2 rounded-lg border p-3">
                                <Mail className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                                    <p className="font-medium">{student.email || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border p-3">
                                <Phone className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">الهاتف</p>
                                    <p className="font-medium">{student.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border p-3">
                                <MapPin className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">المدينة</p>
                                    <p className="font-medium">{student.city || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {student.enrollments && student.enrollments.length > 0 && (
                            <div className="rounded-lg border p-4">
                                <h4 className="mb-3 font-semibold">الدورات المسجلة ({student.enrollments.length}):</h4>
                                <div className="space-y-2">
                                    {student.enrollments.map((enrollment) => (
                                        <div key={enrollment.id} className="flex items-center justify-between border-b pb-2 text-sm">
                                            <span className="font-medium">{enrollment.course?.title_ar || 'دورة'}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(enrollment.created_at).toLocaleDateString('ar-LY')}
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
