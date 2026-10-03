import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { useSite } from '@/context/site-context';
import { canAccessCms, canAccessCmsAdmin, canAccessContent, canAccessCrm, canAccessSettings, canAccessStudent } from '@/lib/dashboard-access';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
  Award,
  Bell,
  BookOpen,
  Briefcase,
  CalendarDays,
  CalendarRange,
  ClipboardList,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HelpCircle,
  Image,
  Inbox,
  LayoutGrid,
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
  const { t, isRTL, locale } = useSite();
  const c = t.cms;
  const sidebar = t.dashboard.sidebar;
  const roles = usePage<SharedData>().props.auth.roles ?? [];
  const cmsCapabilities = usePage<SharedData>().props.cmsCapabilities ?? { canManage: false, isTeacher: false };
  const studentState = usePage<SharedData>().props.auth.student ?? null;
  const ar = locale === 'ar';

  const teacherNavItems = [
    { title: c.nav.grades, url: '/cms/grades', icon: Award },
    { title: c.nav.attendance, url: '/cms/attendance', icon: UserCheck },
    { title: c.nav.schedules, url: '/cms/schedules', icon: Briefcase },
    { title: c.nav.students, url: '/cms/students', icon: Users },
    { title: c.nav.enrollments, url: '/cms/enrollments', icon: GraduationCap },
  ];

  const adminNavItems = [
    { title: c.nav.applications, url: '/cms/applications', icon: FileText },
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
            ...(canAccessCmsAdmin(roles) ? [{ title: sidebar.items.systemGuide, url: '/dashboard/guide', icon: BookOpen }] : []),
          ]}
        />

        {canAccessCms(roles) && <NavMain label={c.title} items={cmsCapabilities.isTeacher ? teacherNavItems : adminNavItems} />}

        {/* Pending applicants: only the "طلبي" status page is theirs. */}
        {canAccessStudent(roles) && studentState?.application_status && studentState.application_status !== 'accepted' && (
          <NavMain
            label={ar ? 'القبول' : 'Admission'}
            items={[{ title: ar ? 'طلبي' : 'My application', url: '/student/application', icon: FileText }]}
          />
        )}

        {canAccessStudent(roles) && (studentState?.admitted || !studentState?.application_status) && (
          <NavMain
            label={c.myStudies.title}
            items={[
              { title: c.myTerm.title, url: '/dashboard/my-term', icon: CalendarRange },
              { title: c.myStudies.courses, url: '/dashboard/my-courses', icon: BookOpen },
              { title: c.myStudies.schedule, url: '/dashboard/my-schedule', icon: CalendarDays },
              { title: c.myStudies.grades, url: '/dashboard/my-grades', icon: Award },
              { title: c.nav.subjectRegistration, url: '/dashboard/subject-registration', icon: ClipboardList },
              { title: c.myStudies.transcript, url: '/dashboard/my-transcript', icon: FileSpreadsheet },
            ]}
          />
        )}

        {canAccessCrm(roles) && (
          <NavMain
            label={sidebar.crm}
            items={[
              { title: sidebar.items.leads, url: '/dashboard/leads/list', icon: Inbox },
              { title: sidebar.items.newsletter, url: '/dashboard/newsletter/list', icon: Send },
              { title: sidebar.items.newsletterCampaigns, url: '/dashboard/newsletter/campaigns/list', icon: Send },
              { title: c.nav.notificationTemplates, url: '/dashboard/notification-templates/list', icon: Bell },
              { title: sidebar.items.notificationLogs, url: '/dashboard/notification-logs/list', icon: ScrollText },
            ]}
          />
        )}

        {canAccessContent(roles) && (
          <NavMain
            label={sidebar.content}
            items={[
              { title: sidebar.items.blogPosts, url: '/dashboard/blog-posts/list', icon: FileText },
              { title: sidebar.items.banners, url: '/dashboard/banners/list', icon: Image },
              { title: sidebar.items.testimonials, url: '/dashboard/testimonials/list', icon: Star },
              { title: sidebar.items.faqs, url: '/dashboard/faqs/list', icon: HelpCircle },
            ]}
          />
        )}

        {canAccessContent(roles) && (
          <NavMain
            label={sidebar.legal}
            items={[
              { title: sidebar.items.privacyPolicy, url: '/dashboard/pages/privacy-policy', icon: BookOpen },
              { title: sidebar.items.termsOfUse, url: '/dashboard/pages/terms-of-use', icon: BookOpen },
              { title: sidebar.items.aboutPage, url: '/dashboard/pages/about', icon: FileText },
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
