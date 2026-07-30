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
    Presentation,
    Settings,
    Star,
    Tag,
    UserCheck,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { isRTL } = useSite();

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
                    label="Overview"
                    items={[
                        { title: 'Dashboard', url: '/dashboard', icon: LayoutGrid },
                    ]}
                />

                <NavMain
                    label="Training"
                    items={[
                        { title: 'Courses', url: '/dashboard/courses/list', icon: Presentation },
                        { title: 'Categories', url: '/dashboard/categories/list', icon: Tag },
                        { title: 'Instructors', url: '/dashboard/instructors/list', icon: UserCheck },
                        { title: 'Enrollments', url: '/dashboard/enrollments/list', icon: GraduationCap },
                        { title: 'Students', url: '/dashboard/students/list', icon: Users },
                        { title: 'Certificates', url: '/dashboard/certificates/list', icon: Award },
                    ]}
                />

                <NavMain
                    label="CRM"
                    items={[
                        { title: 'Leads', url: '/dashboard/leads/list', icon: Briefcase },
                    ]}
                />

                <NavMain
                    label="Content"
                    items={[
                        { title: 'Blog Posts', url: '/dashboard/blog-posts/list', icon: FileText },
                        { title: 'Banners', url: '/dashboard/banners/list', icon: Image },
                        { title: 'Testimonials', url: '/dashboard/testimonials/list', icon: Star },
                        { title: 'FAQs', url: '/dashboard/faqs/list', icon: HelpCircle },
                    ]}
                />


                <NavMain
                    label="Legal"
                    items={[
                        { title: 'Privacy Policy', url: '/dashboard/pages/privacy-policy', icon: BookOpen },
                        { title: 'Terms of Use', url: '/dashboard/pages/terms-of-use', icon: BookOpen },
                    ]}
                />

                <NavMain
                    label="Settings"
                    items={[
                        { title: 'Users', url: '/dashboard/users/list', icon: Users },
                        { title: 'Site Settings', url: '/dashboard/site-settings', icon: Settings },
                    ]}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
