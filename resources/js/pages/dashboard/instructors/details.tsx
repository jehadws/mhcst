import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Instructor } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Edit, Mail, Phone } from "lucide-react";

interface Props {
    instructor: Instructor;
}

export default function InstructorDetailsPage({ instructor }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'المدربون', href: '/dashboard/instructors/list' },
        { title: instructor.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={instructor.name} />
            <div className="mx-auto flex h-full flex-1 max-w-4xl flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.instructors.list'))}>
                        <ArrowRight className="ml-2 h-4 w-4" /> رجوع للقائمة
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.instructors.edit', instructor.id))}>
                        <Edit className="ml-2 h-4 w-4" /> تعديل المدرب
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            {instructor.photo ? (
                                <img
                                    src={instructor.photo.startsWith('http') ? instructor.photo : `/storage/${instructor.photo}`}
                                    alt={instructor.name}
                                    className="size-16 rounded-full object-cover border"
                                />
                            ) : (
                                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                                    {instructor.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <CardTitle>{instructor.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{instructor.specialization || 'مدرب'}</p>
                            </div>
                        </div>
                        <Badge variant={instructor.is_active ? 'default' : 'secondary'}>
                            {instructor.is_active ? 'نشط' : 'غير نشط'}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                            <div className="flex items-center gap-2 rounded-lg border p-3">
                                <Mail className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                                    <p className="font-medium">{instructor.email || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border p-3">
                                <Phone className="size-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">رقم الهاتف</p>
                                    <p className="font-medium">{instructor.phone || '-'}</p>
                                </div>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">سنوات الخبرة</p>
                                <p className="font-medium">{instructor.years_experience ?? 0} سنوات</p>
                            </div>
                        </div>

                        {instructor.bio_ar && (
                            <div className="rounded-lg border p-4">
                                <h4 className="mb-2 font-semibold">النبذة (عربي):</h4>
                                <p className="whitespace-pre-line text-sm text-muted-foreground">{instructor.bio_ar}</p>
                            </div>
                        )}

                        {instructor.bio_en && (
                            <div className="rounded-lg border p-4" dir="ltr">
                                <h4 className="mb-2 font-semibold">Bio (English):</h4>
                                <p className="whitespace-pre-line text-sm text-muted-foreground">{instructor.bio_en}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
