import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
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
    quote: { message: string; author: string };
    auth: Auth;
    locale: string;
    direction: 'ltr' | 'rtl';
    siteSettings: SiteSettings;
    flash: { success?: string | null };
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

export interface Category {
    id: number;
    name_ar: string;
    name_en?: string;
    slug: string;
    parent_id?: number | null;
    icon?: string;
    sort_order: number;
}

export interface Instructor {
    id: number;
    name: string;
    bio_ar?: string;
    bio_en?: string;
    email?: string;
    phone?: string;
    specialization?: string;
    years_experience?: number;
    social_links?: string | Record<string, string>;
    photo?: string;
    is_active: boolean;
    courses_count?: number;
    pivot?: {
        is_lead?: boolean | number;
    };
}

export interface CourseCurriculum {
    id: number;
    course_id?: number;
    section_title_ar: string;
    section_title_en?: string;
    lessons: Array<{
        title_ar?: string;
        title_en?: string;
        duration_minutes?: number;
        is_free?: boolean;
    }>;
    sort_order?: number;
}

export interface CourseAttachment {
    id: number;
    course_id?: number;
    title_ar: string;
    title_en?: string;
    file_path: string;
    file_type?: string;
    file_size_bytes?: number;
    download_url?: string;
}

export interface Course {
    id: number;
    category_id?: number;
    title_ar: string;
    title_en?: string;
    slug: string;
    description_ar?: string;
    description_en?: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    duration_hours?: number;
    location_type?: 'onsite' | 'online' | 'hybrid';
    venue?: string;
    start_date?: string;
    end_date?: string;
    capacity?: number;
    price: number;
    status: 'draft' | 'published' | 'archived';
    category?: Category;
    instructors?: Instructor[];
    cover_image?: string;
    curriculums?: CourseCurriculum[];
    attachments?: CourseAttachment[];
    created_by?: number;
    created_at?: string;
    updated_at?: string;
    enrollments_count?: number;
}

export interface Student {
    id: number;
    full_name: string;
    email?: string;
    phone: string;
    city?: string;
    enrollments_count?: number;
    enrollments?: Enrollment[];
}

export interface Enrollment {
    id: number;
    course_id?: number;
    student_id?: number;
    course?: Course;
    student?: Student;
    full_name: string;
    email: string;
    phone: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    payment_status: 'unpaid' | 'partial' | 'paid';
    amount_due: number;
    amount_paid: number;
    source: string;
    notes?: string;
    created_at: string;
    status_history?: Array<{
        id: number;
        old_status: string;
        new_status: string;
        created_at: string;
        changed_by?: { name: string };
    }>;
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
    subtitle?: string;
    cta_text?: string;
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

export interface Certificate {
    id: number;
    certificate_number: string;
    file_path: string;
    issued_at: string;
    course?: Course;
    student?: Student;
}

export interface SiteSetting {
    id: number;
    key: string;
    value: string;
    type: 'text' | 'image' | 'json';
}

export interface SiteSettings {
    site_name?: string;
    site_name_ar?: string;
    site_tagline?: string;
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
    };
    footer_text?: string;
    meta_description?: string;
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

export interface DashboardStats {
    students_count: number;
    students_delta?: number | null;
    courses_count: number;
    total_courses: number;
    enrollments_this_month: number;
    enrollments_delta?: number | null;
    pending_enrollments: number;
    total_revenue: number;
    revenue_this_month: number;
    revenue_delta?: number | null;
    new_leads: number;
}

export interface ChartPoint {
    month: string;
    value: number;
}

export interface StatusCount {
    status: string;
    count: number;
}

export interface TopCourse {
    title: string;
    count: number;
}
