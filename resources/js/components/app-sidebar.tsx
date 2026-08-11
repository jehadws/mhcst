import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Link } from '@inertiajs/react';
import { useSite } from '@/context/site-context';
import {
    Award,
    BookOpen,
    Briefcase,
    FileText,
    GraduationCap,
    HelpCircle,
    LayoutGrid,
    MailPlus,
    Presentation,
    Send,
    Settings,
    Star,
    Tag,
    UserCheck,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { isRTL, t } = useSite();
    const sidebar = t.dashboard.sidebar;

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

                <NavMain
                    label={isRTL ? 'النظام الأكاديمي (CMS)' : 'College Management (CMS)'}
                    items={[
                        { title: isRTL ? 'الأقسام الأكاديمية' : 'Departments', url: '/cms/departments', icon: Presentation },
                        { title: isRTL ? 'الصفوف والشهادات' : 'Levels & Sections', url: '/cms/levels', icon: Tag },
                        { title: isRTL ? 'أعضاء هيئة التدريس' : 'Teachers', url: '/cms/teachers', icon: UserCheck },
                        { title: isRTL ? 'المواد الدراسية' : 'Subjects', url: '/cms/subjects', icon: BookOpen },
                        { title: isRTL ? 'الطلاب الأكاديميون' : 'CMS Students', url: '/cms/students', icon: Users },
                        { title: isRTL ? 'التسجيلات الأكاديمية' : 'CMS Enrollments', url: '/cms/enrollments', icon: GraduationCap },
                        { title: isRTL ? 'رصد الدرجات' : 'Grades', url: '/cms/grades', icon: Award },
                        { title: isRTL ? 'سجل الحضور' : 'Attendance', url: '/cms/attendance', icon: UserCheck },
                        { title: isRTL ? 'الجدول الدراسي' : 'Schedules', url: '/cms/schedules', icon: Briefcase },
                        { title: isRTL ? 'التقارير الأكاديمية' : 'Reports', url: '/cms/reports', icon: FileText },
                    ]}
                />

                <NavMain
                    label={sidebar.crm}
                    items={[
                        { title: sidebar.items.newsletter, url: '/dashboard/newsletter/list', icon: MailPlus },
                        { title: sidebar.items.newsletterCampaigns, url: '/dashboard/newsletter/campaigns/list', icon: Send },
                    ]}
                />

                <NavMain
                    label={sidebar.content}
                    items={[
                        { title: isRTL ? 'الأخبار والإعلانات' : 'News & Posts', url: '/dashboard/blog-posts/list', icon: FileText },
                        { title: sidebar.items.testimonials, url: '/dashboard/testimonials/list', icon: Star },
                        { title: sidebar.items.faqs, url: '/dashboard/faqs/list', icon: HelpCircle },
                        { title: sidebar.items.certificates, url: '/dashboard/certificates/list', icon: Award },
                    ]}
                />


                <NavMain
                    label={sidebar.legal}
                    items={[
                        { title: sidebar.items.privacyPolicy, url: '/dashboard/pages/privacy-policy', icon: BookOpen },
                        { title: sidebar.items.termsOfUse, url: '/dashboard/pages/terms-of-use', icon: BookOpen },
                    ]}
                />

                <NavMain
                    label={sidebar.settings}
                    items={[
                        { title: sidebar.items.users, url: '/dashboard/users/list', icon: Users },
                        { title: sidebar.items.siteSettings, url: '/dashboard/site-settings', icon: Settings },
                    ]}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
