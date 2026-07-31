import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, Category } from "@/types";
import { useSite } from "@/context/site-context";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Edit } from "lucide-react";

interface Props {
    category: Category & {
        children?: Category[];
        courses?: Array<{ id: number; title_ar: string }>;
    };
}

export default function CategoryDetailsPage({ category }: Props) {
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.categories, href: '/dashboard/categories/list' },
        { title: category.name_ar, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={category.name_ar} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.categories.list'))}>
                        <ArrowRight className="ms-2 h-4 w-4" /> {d.show.backToList}
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.categories.edit', category.id))}>
                        <Edit className="ms-2 h-4 w-4" /> {d.show.edit} {d.entities.category.singular}
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {category.icon && <span>{category.icon}</span>}
                                <span>{category.name_ar}</span>
                            </CardTitle>
                            {category.name_en && (
                                <p className="mt-1 text-sm text-muted-foreground" dir="ltr">
                                    {category.name_en}
                                </p>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">{d.show.slug}</p>
                                <p className="font-mono">{category.slug}</p>
                            </div>
                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground">{d.show.sortOrder}</p>
                                <p className="font-semibold">{category.sort_order}</p>
                            </div>
                        </div>

                        {category.children && category.children.length > 0 && (
                            <div className="rounded-lg border p-4">
                                <h4 className="mb-2 font-semibold">{d.show.subcategories}:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {category.children.map((c) => (
                                        <span key={c.id} className="rounded-md bg-secondary px-3 py-1 text-sm">
                                            {c.name_ar}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {category.courses && category.courses.length > 0 && (
                            <div className="rounded-lg border p-4">
                                <h4 className="mb-2 font-semibold">{d.show.coursesInCategory}:</h4>
                                <div className="space-y-1">
                                    {category.courses.map((course) => (
                                        <div key={course.id} className="text-sm py-1 border-b last:border-0">
                                            {course.title_ar}
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
