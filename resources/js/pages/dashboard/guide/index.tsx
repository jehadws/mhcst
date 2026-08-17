import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardGuide, quickStartsForRoles, visibleGuideSections } from '@/data/dashboard-guide';
import { useSite } from '@/context/site-context';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookOpen, CircleHelp, KeyRound, Layers, ListOrdered } from 'lucide-react';

function StepList({ steps, numbered = true }: { steps: string[]; numbered?: boolean }) {
    return (
        <ol className={numbered ? 'list-decimal space-y-3 ps-5 text-sm leading-relaxed' : 'list-none space-y-3 ps-0 text-sm leading-relaxed'}>
            {steps.map((step, index) => (
                <li key={step} className="text-foreground/90">
                    {numbered ? step : (
                        <span className="flex gap-2">
                            <span className="text-primary mt-0.5 shrink-0 font-semibold">•</span>
                            <span>{step}</span>
                        </span>
                    )}
                </li>
            ))}
        </ol>
    );
}

function GuideLinks({ links }: { links: Array<{ label: string; href: string }> }) {
    if (!links?.length) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2 pt-1">
            {links.map((link) => (
                <Button key={link.href + link.label} variant="outline" size="sm" asChild>
                    <Link href={link.href}>
                        {link.label}
                        <ArrowRight className="ms-1.5 size-3.5 opacity-60" />
                    </Link>
                </Button>
            ))}
        </div>
    );
}

export default function DashboardGuidePage() {
    const { locale } = useSite();
    const { auth } = usePage<SharedData>().props;
    const roles = auth.roles ?? [];
    const guide = dashboardGuide[locale === 'ar' ? 'ar' : 'en'];
    const myQuickStarts = quickStartsForRoles(guide.quickStarts, roles);
    const sections = visibleGuideSections(guide.sections, roles);
    const showDemo = roles.includes('Admin') || roles.includes('Manager');
    const visibleRoleExplanations = guide.rolesExplained.roles.filter(
        (item) => roles.includes('Admin') || roles.includes('Manager') || roles.includes(item.role),
    );

    const breadcrumbs: BreadcrumbItem[] = [
        { title: guide.title, href: '/dashboard/guide' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={guide.title} />

            <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-2">
                    <div className="text-primary flex items-center gap-2">
                        <BookOpen className="size-6" aria-hidden="true" />
                        <h1 className="text-2xl font-bold tracking-tight">{guide.title}</h1>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{guide.subtitle}</p>
                    {roles.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="text-muted-foreground text-xs">{locale === 'ar' ? 'دورك:' : 'Your role:'}</span>
                            {roles.map((role) => (
                                <Badge key={role} variant="secondary">
                                    {role}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                <Card className="border-primary/30 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Layers className="size-5" aria-hidden="true" />
                            {guide.intro.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {guide.intro.paragraphs.map((paragraph) => (
                            <p key={paragraph} className="text-sm leading-relaxed">
                                {paragraph}
                            </p>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <KeyRound className="size-5" aria-hidden="true" />
                            {guide.loginSteps.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StepList steps={guide.loginSteps.steps} />
                        <p className="text-muted-foreground mt-4 text-xs leading-relaxed">{guide.sidebarNote}</p>
                    </CardContent>
                </Card>

                {myQuickStarts.map((quickStart) => (
                    <Card key={quickStart.title} className="border-primary/40 shadow-sm">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <ListOrdered className="size-5" aria-hidden="true" />
                                {quickStart.title}
                            </CardTitle>
                            <CardDescription>
                                {locale === 'ar' ? 'اتبع هذه الخطوات بالترتيب' : 'Follow these steps in order'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <StepList steps={quickStart.steps} />
                            {quickStart.tips && quickStart.tips.length > 0 && (
                                <div className="bg-muted/50 rounded-lg p-3">
                                    <p className="mb-2 text-xs font-medium">{locale === 'ar' ? 'ملاحظة' : 'Note'}</p>
                                    <ul className="text-muted-foreground space-y-1 text-xs leading-relaxed">
                                        {quickStart.tips.map((tip) => (
                                            <li key={tip}>{tip}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <GuideLinks links={quickStart.links ?? []} />
                        </CardContent>
                    </Card>
                ))}

                {visibleRoleExplanations.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{guide.rolesExplained.title}</CardTitle>
                            <CardDescription>{guide.rolesExplained.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <dl className="divide-y text-sm">
                                {visibleRoleExplanations.map((item) => (
                                    <div key={item.role} className="grid gap-1 py-3 first:pt-0 last:pb-0 sm:grid-cols-[9rem_1fr]">
                                        <dt className="font-medium">{item.label}</dt>
                                        <dd className="text-muted-foreground">{item.summary}</dd>
                                    </div>
                                ))}
                            </dl>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-4">
                    {sections.map((section) => (
                        <Card key={section.id}>
                            <CardHeader>
                                <CardTitle className="text-base">{section.title}</CardTitle>
                                <CardDescription>{section.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <StepList steps={section.steps} numbered={section.id === 'college-workflow'} />
                                {section.tips && section.tips.length > 0 && (
                                    <div className="bg-muted/50 rounded-lg p-3">
                                        <p className="text-muted-foreground space-y-1 text-xs leading-relaxed">
                                            {section.tips.map((tip) => (
                                                <span key={tip} className="block">
                                                    {tip}
                                                </span>
                                            ))}
                                        </p>
                                    </div>
                                )}
                                <GuideLinks links={section.links ?? []} />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {showDemo && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">{guide.demoTitle}</CardTitle>
                            <CardDescription>{guide.demoPassword}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-start">
                                            <th className="pb-2 pe-4 font-medium">Email</th>
                                            <th className="pb-2 font-medium">Role</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {guide.demoAccounts.map((account) => (
                                            <tr key={account.email} className="border-b last:border-0">
                                                <td className="py-2 pe-4 font-mono text-xs">{account.email}</td>
                                                <td className="py-2">{account.role}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <p className="text-muted-foreground flex items-start gap-2 text-xs">
                    <CircleHelp className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    {locale === 'ar'
                        ? 'ما زلت بحاجة لمساعدة؟ تواصل مع مدير النظام (Admin) في الكلية.'
                        : 'Still stuck? Contact your college Admin — they manage accounts and access.'}
                </p>
            </div>
        </AppLayout>
    );
}
