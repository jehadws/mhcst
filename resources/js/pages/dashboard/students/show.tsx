import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Student } from "@/types";
import { useSite } from "@/context/site-context";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Edit, Mail, MapPin, Phone } from "lucide-react";

interface Props {
    student: Student;
}

export default function StudentDetailsPage({ student }: Props) {
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.students, href: '/dashboard/students/list' },
        { title: student.full_name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={student.full_name} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.students.list'))}>
                        <ArrowRight className="ms-2 h-4 w-4" /> {d.show.backToList}
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.students.edit', student.id))}>
                        <Edit className="ms-2 h-4 w-4" /> {d.show.edit} {d.entities.student.singular}
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
                                    <p className="text-xs text-muted-foreground">{d.show.emailLabel}</p>
                                    <p className="font-medium">{student.email || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border p-3">
                                <Phone className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">{d.show.phoneLabel}</p>
                                    <p className="font-medium">{student.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border p-3">
                                <MapPin className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">{d.form.labels.city}</p>
                                    <p className="font-medium">{student.city || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {student.enrollments && student.enrollments.length > 0 && (
                            <div className="rounded-lg border p-4">
                                <h4 className="mb-3 font-semibold">{d.show.enrolledCourses.replace('{count}', String(student.enrollments.length))}:</h4>
                                <div className="space-y-2">
                                    {student.enrollments.map((enrollment) => (
                                        <div key={enrollment.id} className="flex items-center justify-between border-b pb-2 text-sm">
                                            <span className="font-medium">{enrollment.course?.title_ar || d.show.courseLabel}</span>
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
