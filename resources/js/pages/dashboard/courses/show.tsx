import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Course } from "@/types";
import { useSite } from "@/context/site-context";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Edit } from "lucide-react";

interface Props {
    course: Course;
}

export default function CourseDetailsPage({ course }: Props) {
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.courses, href: '/dashboard/courses/list' },
        { title: course.title_ar, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={course.title_ar} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.courses.list'))}>
                        <ArrowRight className="ms-2 h-4 w-4" /> {d.show.backToList}
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.courses.edit', course.id))}>
                        <Edit className="ms-2 h-4 w-4" /> {d.show.edit} {d.entities.course.singular}
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl">{course.title_ar}</CardTitle>
                            {course.title_en && (
                                <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
                                    {course.title_en}
                                </p>
                            )}
                        </div>
                        <Badge>{d.status[course.status as keyof typeof d.status] || course.status}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {course.cover_image && (
                            <div className="overflow-hidden rounded-lg border">
                                <img
                                    src={
                                        course.cover_image.startsWith('http')
                                            ? course.cover_image
                                            : `/storage/${course.cover_image}`
                                    }
                                    alt={course.title_ar}
                                    className="max-h-80 w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                            <div className="rounded-lg border p-3 bg-muted/30">
                                <p className="text-xs text-muted-foreground">{d.form.labels.category}</p>
                                <p className="font-semibold">{course.category?.name_ar || '-'}</p>
                            </div>
                            <div className="rounded-lg border p-3 bg-muted/30">
                                <p className="text-xs text-muted-foreground">{d.form.labels.level}</p>
                                <p className="font-semibold">{d.level[course.level as keyof typeof d.level] || course.level}</p>
                            </div>
                            <div className="rounded-lg border p-3 bg-muted/30">
                                <p className="text-xs text-muted-foreground">{d.form.labels.price}</p>
                                <p className="font-semibold text-primary">{course.price} د.ل</p>
                            </div>
                            <div className="rounded-lg border p-3 bg-muted/30">
                                <p className="text-xs text-muted-foreground">{d.form.labels.capacity}</p>
                                <p className="font-semibold">{course.capacity || '-'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                            <div>
                                <span className="text-muted-foreground">{d.show.durationLabel}:</span>{' '}
                                <span className="font-medium">{course.duration_hours ? `${course.duration_hours} ${d.entities.course.description}` : '-'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{d.show.locationLabel}:</span>{' '}
                                <span className="font-medium">{course.venue || d.locationType[course.location_type as keyof typeof d.locationType] || '-'}</span>
                            </div>
                            <div>
                                <span className="text-muted-foreground">{d.show.dateLabel}:</span>{' '}
                                <span className="font-medium">
                                    {course.start_date ? new Date(course.start_date).toLocaleDateString('ar-LY') : '-'}
                                </span>
                            </div>
                        </div>

                        {course.description_ar && (
                            <div className="rounded-lg border p-4">
                                <h4 className="mb-2 font-semibold">{d.form.labels.descriptionAr}:</h4>
                                <p className="whitespace-pre-line text-sm text-muted-foreground">{course.description_ar}</p>
                            </div>
                        )}

                        <div>
                            <h4 className="mb-3 font-semibold">{d.form.labels.instructors}:</h4>
                            {course.instructors && course.instructors.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {course.instructors.map((inst) => (
                                        <div key={inst.id} className="flex items-center gap-3 rounded-lg border p-3">
                                            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                                {inst.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{inst.name}</p>
                                                <p className="text-xs text-muted-foreground">{inst.specialization || d.show.instructorDefault}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{d.show.notAssignedYet}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
