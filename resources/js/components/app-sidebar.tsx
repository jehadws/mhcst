import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { useSite } from '@/context/site-context';
import { canAccessCms, canAccessCmsAdmin, canAccessContent, canAccessCrm, canAccessSettings, canManageCms } from '@/lib/dashboard-access';
import { SharedData } from '@/types';
import {
    Award,
    Bell,
    BookOpen,
    Briefcase,
    FileText,
    GraduationCap,
    HelpCircle,
    LayoutGrid,
    MailPlus,
    Presentation,
    ScrollText,
    Send,
    Settings,
    Settings2,
    Star,
    Tag,
    UserCheck,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { t, isRTL } = useSite();
    const c = t.cms;
    const sidebar = t.dashboard.sidebar;
    const roles = usePage<SharedData>().props.auth.roles ?? [];
    const isTeacherOnly = canAccessCms(roles) && !canManageCms(roles);

    const teacherNavItems = [
        { title: c.nav.grades, url: '/cms/grades', icon: Award },
        { title: c.nav.attendance, url: '/cms/attendance', icon: UserCheck },
        { title: c.nav.schedules, url: '/cms/schedules', icon: Briefcase },
        { title: c.nav.students, url: '/cms/students', icon: Users },
        { title: c.nav.enrollments, url: '/cms/enrollments', icon: GraduationCap },
    ];

    const adminNavItems = [
        { title: c.nav.departments, url: '/cms/departments', icon: Presentation },
        { title: c.nav.levels, url: '/cms/levels', icon: Tag },
        { title: c.nav.teachers, url: '/cms/teachers', icon: UserCheck },
        { title: c.nav.subjects, url: '/cms/subjects', icon: BookOpen },
        { title: c.nav.students, url: '/cms/students', icon: Users },
        { title: c.nav.enrollments, url: '/cms/enrollments', icon: GraduationCap },
        { title: c.nav.grades, url: '/cms/grades', icon: Award },
        { title: c.nav.attendance, url: '/cms/attendance', icon: UserCheck },
        { title: c.nav.schedules, url: '/cms/schedules', icon: Briefcase },
        { title: c.nav.reports, url: '/cms/reports', icon: FileText },
        ...(canAccessCmsAdmin(roles)
            ? [
                  { title: c.nav.auditLog, url: '/cms/audit-logs', icon: ScrollText },
                  { title: c.nav.academicSettings, url: '/cms/settings', icon: Settings2 },
              ]
            : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset" side={isRTL ? 'right' : 'left'}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    label={sidebar.overview}
                    items={[
                        { title: sidebar.items.dashboard, url: '/dashboard', icon: LayoutGrid },
                    ]}
                />

                {canAccessCms(roles) && (
                    <NavMain
                        label={c.title}
                        items={isTeacherOnly ? teacherNavItems : adminNavItems}
                    />
                )}

                {canAccessCrm(roles) && (
                    <NavMain
                        label={sidebar.crm}
                        items={[
                            { title: sidebar.items.newsletter, url: '/dashboard/newsletter/list', icon: MailPlus },
                            { title: sidebar.items.newsletterCampaigns, url: '/dashboard/newsletter/campaigns/list', icon: Send },
                            { title: c.nav.notificationTemplates, url: '/dashboard/notification-templates/list', icon: Bell },
                        ]}
                    />
                )}

                {canAccessContent(roles) && (
                    <NavMain
                        label={sidebar.content}
                        items={[
                            { title: sidebar.items.blogPosts, url: '/dashboard/blog-posts/list', icon: FileText },
                            { title: sidebar.items.testimonials, url: '/dashboard/testimonials/list', icon: Star },
                            { title: sidebar.items.faqs, url: '/dashboard/faqs/list', icon: HelpCircle },
                            { title: sidebar.items.certificates, url: '/dashboard/certificates/list', icon: Award },
                        ]}
                    />
                )}

                {canAccessContent(roles) && (
                    <NavMain
                        label={sidebar.legal}
                        items={[
                            { title: sidebar.items.privacyPolicy, url: '/dashboard/pages/privacy-policy', icon: BookOpen },
                            { title: sidebar.items.termsOfUse, url: '/dashboard/pages/terms-of-use', icon: BookOpen },
                        ]}
                    />
                )}

                {canAccessSettings(roles) && (
                    <NavMain
                        label={sidebar.settings}
                        items={[
                            { title: sidebar.items.users, url: '/dashboard/users/list', icon: Users },
                            { title: sidebar.items.siteSettings, url: '/dashboard/site-settings', icon: Settings },
                        ]}
                    />
                )}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
