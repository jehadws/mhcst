import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, User } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Edit, Mail } from "lucide-react";

interface Props {
    user: User;
}

export default function UserDetailsPage({ user }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'لوحة التحكم', href: '/dashboard' },
        { title: 'المستخدمون', href: '/dashboard/users/list' },
        { title: user.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.users.list'))}>
                        <ArrowRight className="ml-2 h-4 w-4" /> رجوع للقائمة
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.users.edit', user.id))}>
                        <Edit className="ml-2 h-4 w-4" /> تعديل البيانات
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{user.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 rounded-lg border p-3">
                            <Mail className="size-4 text-muted-foreground" />
                            <div>
                                <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                                <p className="font-medium" dir="ltr">{user.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
