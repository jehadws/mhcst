import AppLayout from "@/layouts/app-layout";
import { BlogPost, BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Edit } from "lucide-react";

interface Props {
    post: BlogPost;
}

export default function BlogPostDetailsPage({ post }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'المدونة', href: '/dashboard/blog-posts/list' },
        { title: post.title, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={post.title} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.blog-posts.list'))}>
                        <ArrowRight className="ml-2 h-4 w-4" /> رجوع للقائمة
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.blog-posts.edit', post.id))}>
                        <Edit className="ml-2 h-4 w-4" /> تعديل المقال
                    </Button>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>{post.title}</CardTitle>
                            <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                                /{post.slug}
                            </p>
                        </div>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                            {post.status === 'published' ? 'منشور' : 'مسودة'}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {post.cover_image && (
                            <div className="overflow-hidden rounded-lg border">
                                <img
                                    src={post.cover_image.startsWith('http') ? post.cover_image : `/storage/${post.cover_image}`}
                                    alt={post.title}
                                    className="max-h-80 w-full object-cover"
                                />
                            </div>
                        )}

                        {post.excerpt && (
                            <div className="rounded-lg border p-4 bg-muted/30">
                                <h4 className="mb-1 text-xs font-semibold text-muted-foreground">المقتطف:</h4>
                                <p className="text-sm font-medium">{post.excerpt}</p>
                            </div>
                        )}

                        {post.content && (
                            <div className="rounded-lg border p-4">
                                <h4 className="mb-2 font-semibold">المحتوى:</h4>
                                <div className="prose max-w-none text-sm leading-relaxed whitespace-pre-line">
                                    {post.content}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
