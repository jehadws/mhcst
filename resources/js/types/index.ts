import { LucideIcon } from 'lucide-react';
import type { WaFollowup } from './cms';

export interface Auth {
    user: User | null;
    roles: string[];
    /** Admission state for Student-role users; null for everyone else. */
    student?: { admitted: boolean; application_status: string | null } | null;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    appUrl: string;
    seo?: {
        themeColor: string;
        organization: Record<string, unknown>;
    };
    quote: { message: string; author: string };
    auth: Auth;
    cmsCapabilities?: { canManage: boolean; isTeacher: boolean };
    locale: string;
    direction: 'ltr' | 'rtl';
    siteSettings: SiteSettings;
    flash: {
        success?: string | null;
        import_errors?: string[] | null;
        wa_followups?: WaFollowup[] | null;
    };
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Lead {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    subject?: string;
    message: string;
    type: 'contact' | 'quote_request';
    status: 'new' | 'in_progress' | 'closed';
    created_at: string;
}

export interface Testimonial {
    id: number;
    name: string;
    full_name?: string;
    job_title?: string;
    organization?: string;
    role_title?: string;
    company?: string;
    rating?: number;
    quote: string;
    testimonial_ar?: string;
    testimonial_en?: string;
    is_published: boolean;
    is_active?: boolean;
    photo?: string;
    sort_order?: number;
}

export interface Banner {
    id: number;
    image: string;
    title?: string;
    title_ar?: string;
    subtitle?: string;
    subtitle_ar?: string;
    cta_text?: string;
    cta_text_ar?: string;
    cta_link?: string;
    is_active: boolean;
    sort_order: number;
}

export interface Faq {
    id: number;
    question: string;
    question_ar?: string;
    question_en?: string;
    answer: string;
    answer_ar?: string;
    answer_en?: string;
    sort_order: number;
    is_published: boolean;
    is_active?: boolean;
}

export interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    cover_image?: string;
    cover_video?: string;
    status: 'draft' | 'published';
    published_at?: string;
    seo_title?: string;
    seo_description?: string;
    author?: User;
}

export interface CorporateClient {
    id: number;
    company_name: string;
    contact_person: string;
    email?: string;
    phone?: string;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export interface SiteSetting {
    id: number;
    key: string;
    value: string;
    type: 'text' | 'image' | 'json' | 'boolean';
}

export interface SiteSettings {
    site_name?: string;
    site_name_ar?: string;
    site_tagline?: string;
    site_tagline_ar?: string;
    site_logo?: string;
    contact_email?: string;
    contact_phone?: string;
    whatsapp_number?: string;
    address?: string;
    social_links?: {
        facebook?: string;
        instagram?: string;
        linkedin?: string;
        twitter?: string;
        youtube?: string;
    };
    footer_text?: string;
    meta_description?: string;
    hide_instructor_names?: boolean;
    show_teachers_page?: boolean;
}

export interface AboutHeroContent {
    title: string;
    title_ar: string;
    description?: string;
    description_ar?: string;
    image?: string;
}

export interface AboutItemContent {
    icon?: string;
    title: string;
    title_ar: string;
    body: string;
    body_ar: string;
}

export interface AboutMilestoneContent {
    year: string;
    label: string;
    label_ar: string;
}

export interface AboutPageContent {
    hero: AboutHeroContent;
    pillars: AboutItemContent[];
    values: AboutItemContent[];
    milestones: AboutMilestoneContent[];
}

export interface NewsletterSubscriber {
    id: number;
    name?: string;
    email: string;
    is_active: boolean;
    subscribed_at: string;
    unsubscribed_at?: string;
    created_at: string;
}

export interface NewsletterCampaign {
    id: number;
    subject: string;
    content: string;
    status: 'draft' | 'sending' | 'sent' | 'cancelled';
    sent_by?: number;
    sent_at?: string;
    recipient_count: number;
    sent_count: number;
    failed_count: number;
    created_at: string;
    sender?: { id: number; name: string };
}

export interface StatusCount {
    status: string;
    count: number;
}

export interface NotificationTemplate {
    id: number;
    name: string;
    channel: 'email' | 'whatsapp';
    trigger_event: string;
    subject: string | null;
    body: string;
    created_at: string;
    updated_at: string;
}
