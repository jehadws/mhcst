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
    Image,
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
                    label={sidebar.training}
                    items={[
                        { title: sidebar.items.courses, url: '/dashboard/courses/list', icon: Presentation },
                        { title: sidebar.items.categories, url: '/dashboard/categories/list', icon: Tag },
                        { title: sidebar.items.instructors, url: '/dashboard/instructors/list', icon: UserCheck },
                        { title: sidebar.items.enrollments, url: '/dashboard/enrollments/list', icon: GraduationCap },
                        { title: sidebar.items.students, url: '/dashboard/students/list', icon: Users },
                        { title: sidebar.items.certificates, url: '/dashboard/certificates/list', icon: Award },
                    ]}
                />

                    <NavMain
                        label={sidebar.crm}
                        items={[
                            { title: sidebar.items.leads, url: '/dashboard/leads/list', icon: Briefcase },
                            { title: sidebar.items.newsletter, url: '/dashboard/newsletter/list', icon: MailPlus },
                            { title: sidebar.items.newsletterCampaigns, url: '/dashboard/newsletter/campaigns/list', icon: Send },
                        ]}
                    />

                <NavMain
                    label={sidebar.content}
                    items={[
                        { title: sidebar.items.blogPosts, url: '/dashboard/blog-posts/list', icon: FileText },
                        { title: sidebar.items.banners, url: '/dashboard/banners/list', icon: Image },
                        { title: sidebar.items.testimonials, url: '/dashboard/testimonials/list', icon: Star },
                        { title: sidebar.items.faqs, url: '/dashboard/faqs/list', icon: HelpCircle },
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
