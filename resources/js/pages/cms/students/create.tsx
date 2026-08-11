import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { CmsLevel } from '@/types/cms';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export default function StudentCreate({ levels }: { levels: CmsLevel[] }) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'الطلاب الأكاديميون', href: '/cms/students' },
        { title: 'تسجيل طالب جديد', href: '/cms/students/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        student_no: 'STU-' + Math.floor(100000 + Math.random() * 900000),
        name: '',
        email: '',
        phone: '',
        level_id: levels[0]?.id ? String(levels[0].id) : '',
        enrollment_date: new Date().toISOString().substring(0, 10),
        status: 'active',
        gender: 'male',
        birth_date: '',
        address: '',
        create_user_account: false,
        password: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/cms/students');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="تسجيل طالب جديد" />
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-6">تسجيل طالب أكاديمي جديد</h1>
                <form onSubmit={submit} className="space-y-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="student_no">رقم القيد الجامعي *</Label>
                            <Input
                                id="student_no"
                                value={data.student_no}
                                onChange={(e) => setData('student_no', e.target.value)}
                            />
                            {errors.student_no && <p className="text-xs text-rose-500 mt-1">{errors.student_no}</p>}
                        </div>

                        <div>
                            <Label htmlFor="name">الاسم الكامل للطالب *</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="علي أحمد سالم"
                            />
                            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <Label htmlFor="phone">رقم الهاتف</Label>
                            <Input
                                id="phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="level_id">القسم والشعبة الأكاديمية</Label>
                            <select
                                id="level_id"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.level_id}
                                onChange={(e) => setData('level_id', e.target.value)}
                            >
                                {levels.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.department?.name} (سنة {l.year} - شعبة {l.section})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="enrollment_date">تاريخ التسجيل</Label>
                            <Input
                                id="enrollment_date"
                                type="date"
                                value={data.enrollment_date}
                                onChange={(e) => setData('enrollment_date', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="gender">الجنس</Label>
                            <select
                                id="gender"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.gender}
                                onChange={(e) => setData('gender', e.target.value as any)}
                            >
                                <option value="male">ذكر</option>
                                <option value="female">أنثى</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="birth_date">تاريخ الميلاد</Label>
                            <Input
                                id="birth_date"
                                type="date"
                                value={data.birth_date}
                                onChange={(e) => setData('birth_date', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="status">الحالة الأكاديمية</Label>
                            <select
                                id="status"
                                className="w-full p-2.5 rounded-lg border bg-background text-sm mt-1"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as any)}
                            >
                                <option value="active">مستمر</option>
                                <option value="suspended">موقف</option>
                                <option value="graduated">خريج</option>
                                <option value="withdrawn">منسحب</option>
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
                                إنشاء حساب دخول للنظام للطالب
                            </Label>
                        </div>

                        {data.create_user_account && (
                            <div>
                                <Label htmlFor="password">كلمة مرور الحساب</Label>
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
                        <Button type="submit" disabled={processing}>حفظ الطالب</Button>
                        <Button variant="outline" asChild><Link href="/cms/students">إلغاء</Link></Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
