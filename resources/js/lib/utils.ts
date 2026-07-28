import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string | null) {
    if (!date) return '-';
    return new Date(date).toLocaleString('ar-LY', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export function formatCurrency(amount: number | string | null) {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('ar-LY', {
        style: 'currency',
        currency: 'LYD',
    }).format(Number(amount));
}

export function statusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    const map: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
        published: 'default',
        active: 'default',
        confirmed: 'default',
        paid: 'default',
        completed: 'default',
        draft: 'secondary',
        pending: 'secondary',
        partial: 'secondary',
        unpaid: 'destructive',
        cancelled: 'destructive',
        archived: 'outline',
        new: 'secondary',
        in_progress: 'default',
        closed: 'outline',
    };
    return map[status] || 'secondary';
}

export function translateStatus(status: string): string {
    const map: Record<string, string> = {
        published: 'منشور',
        draft: 'مسودة',
        archived: 'مؤرشف',
        active: 'نشط',
        pending: 'معلق',
        confirmed: 'مؤكد',
        completed: 'مكتمل',
        cancelled: 'ملغى',
        paid: 'مدفوع',
        unpaid: 'غير مدفوع',
        partial: 'جزئي',
        new: 'جديد',
        in_progress: 'قيد المعالجة',
        closed: 'مغلق',
        beginner: 'مبتدئ',
        intermediate: 'متوسط',
        advanced: 'متقدم',
        onsite: 'حضوري',
        hybrid: 'هجين',
    };
    return map[status] || status;
}
