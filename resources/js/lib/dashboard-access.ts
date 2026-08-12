const CMS_ROLES = ['Admin', 'Manager', 'Teacher'];
const CMS_MANAGE_ROLES = ['Admin', 'Manager'];
const CMS_TEACHER_NAV = ['grades', 'attendance', 'schedules', 'students', 'enrollments'] as const;
const CONTENT_ROLES = ['Admin', 'Manager', 'Content Editor'];
const SETTINGS_ROLES = ['Admin'];
const CMS_ADMIN_ROLES = ['Admin'];
const CRM_ROLES = ['Admin', 'Manager', 'Support'];

export type CmsCapabilities = {
    canManage: boolean;
    isTeacher: boolean;
};

export function hasAnyRole(roles: string[], allowed: string[]): boolean {
    if (roles.length === 0) {
        return false;
    }

    return roles.some((role) => allowed.includes(role));
}

export function canAccessCms(roles: string[]): boolean {
    return hasAnyRole(roles, CMS_ROLES);
}

export function canManageCms(roles: string[]): boolean {
    return hasAnyRole(roles, CMS_MANAGE_ROLES);
}

export function canAccessContent(roles: string[]): boolean {
    return hasAnyRole(roles, CONTENT_ROLES);
}

export function canAccessSettings(roles: string[]): boolean {
    return hasAnyRole(roles, SETTINGS_ROLES);
}

export function canAccessCmsAdmin(roles: string[]): boolean {
    return hasAnyRole(roles, CMS_ADMIN_ROLES);
}

export function canAccessCrm(roles: string[]): boolean {
    return hasAnyRole(roles, CRM_ROLES);
}

export const USER_ROLES = ['Admin', 'Manager', 'Content Editor', 'Support', 'Teacher', 'Student'] as const;

export type UserRoleName = (typeof USER_ROLES)[number];

export function roleLabel(role: string, locale: 'en' | 'ar'): string {
    const labels: Record<string, { en: string; ar: string }> = {
        Admin: { en: 'Administrator', ar: 'مدير النظام' },
        Manager: { en: 'Manager', ar: 'مدير' },
        'Content Editor': { en: 'Content Editor', ar: 'محرر المحتوى' },
        Support: { en: 'Support', ar: 'الدعم' },
        Teacher: { en: 'Teacher', ar: 'أستاذ' },
        Student: { en: 'Student', ar: 'طالب' },
    };

    return labels[role]?.[locale] ?? role;
}

export { CMS_TEACHER_NAV };
