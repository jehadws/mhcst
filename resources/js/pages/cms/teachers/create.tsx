import AppLayout from '@/layouts/app-layout';
import { useCms } from '@/hooks/use-cms';
import { cmsBreadcrumbs } from '@/lib/cms-helpers';
import { BreadcrumbItem } from '@/types';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function TeacherCreate() {
    const { c } = useCms();

    const breadcrumbs: BreadcrumbItem[] = cmsBreadcrumbs(c, [
        { label: c.nav.teachers, href: '/cms/teachers' },
        { label: c.teachers.addTitle, href: '/cms/teachers/create' },
    ]);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        qualification: '',
        join_date: '',
        status: 'active',
        create_user_account: false,
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/cms/teachers');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={c.teachers.addTitle} />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">{c.teachers.addHeading}</h1>
                <form onSubmit={submit} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border">
                    <div>
                        <Label htmlFor="name">{c.teachers.fullName}</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder={c.teachers.fullNamePlaceholder}
                        />
                        {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="email">{c.common.email}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <Label htmlFor="phone">{c.common.phone}</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="specialization">{c.teachers.specialization}</Label>
                            <Input
                                id="specialization"
                                value={data.specialization}
                                onChange={(e) => setData('specialization', e.target.value)}
                                placeholder={c.teachers.specializationPlaceholder}
                            />
                        </div>

                        <div>
                            <Label htmlFor="qualification">{c.teachers.qualification}</Label>
                            <Input
                                id="qualification"
                                value={data.qualification}
                                onChange={(e) => setData('qualification', e.target.value)}
                                placeholder={c.teachers.qualificationPlaceholder}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="join_date">{c.teachers.joinDate}</Label>
                            <Input
                                id="join_date"
                                type="date"
                                value={data.join_date}
                                onChange={(e) => setData('join_date', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">{c.teachers.employmentStatus}</Label>
                            <select
                                id="status"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as typeof data.status)}
                            >
                                <option value="active">{c.labels.teacherStatus.active}</option>
                                <option value="suspended">{c.labels.teacherStatus.suspended}</option>
                                <option value="resigned">{c.labels.teacherStatus.resigned}</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-3 border-t">
                        <div className="flex items-center gap-2 mb-3">
                            <Checkbox
                                id="create_user_account"
                                checked={data.create_user_account}
                                onCheckedChange={(checked) => setData('create_user_account', !!checked)}
                            />
                            <Label htmlFor="create_user_account" className="font-semibold cursor-pointer">
                                {c.teachers.createAccount}
                            </Label>
                        </div>

                        {data.create_user_account && (
                            <div>
                                <Label htmlFor="password">{c.teachers.accountPassword}</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                        <Button type="submit" disabled={processing}>{c.teachers.saveData}</Button>
                        <Button variant="outline" asChild><Link href="/cms/teachers">{c.common.cancel}</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
