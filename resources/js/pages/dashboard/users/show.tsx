import AppLayout from "@/layouts/app-layout";
import { BreadcrumbItem, User } from "@/types";
import { useSite } from "@/context/site-context";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Edit, Mail } from "lucide-react";

interface Props {
    user: User;
}

export default function UserDetailsPage({ user }: Props) {
    const { t } = useSite();
    const d = t.dashboard;
    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.users, href: '/dashboard/users/list' },
        { title: user.name, href: '#' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={user.name} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Button variant="outline" onClick={() => router.get(route('dashboard.users.list'))}>
                        <ArrowRight className="ms-2 h-4 w-4" /> {d.show.backToList}
                    </Button>
                    <Button onClick={() => router.get(route('dashboard.users.edit', user.id))}>
                        <Edit className="ms-2 h-4 w-4" /> {d.show.edit} {d.entities.user.singular}
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
                                <p className="text-xs text-muted-foreground">{d.show.emailLabel}</p>
                                <p className="font-medium" dir="ltr">{user.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
