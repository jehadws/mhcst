import {
    Award,
    BookOpen,
    CheckCircle2,
    Compass,
    Eye,
    Flag,
    Globe,
    GraduationCap,
    Heart,
    Lightbulb,
    ShieldCheck,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Users,
    Zap,
    type LucideIcon,
} from 'lucide-react';

/** Icon keys accepted for About page pillars and values. */
export const ABOUT_ICONS: Record<string, LucideIcon> = {
    target: Target,
    eye: Eye,
    lightbulb: Lightbulb,
    'shield-check': ShieldCheck,
    users: Users,
    'graduation-cap': GraduationCap,
    award: Award,
    star: Star,
    'check-circle': CheckCircle2,
    globe: Globe,
    'book-open': BookOpen,
    flag: Flag,
    compass: Compass,
    'trending-up': TrendingUp,
    sparkles: Sparkles,
    zap: Zap,
    heart: Heart,
};

export const ABOUT_ICON_KEYS = Object.keys(ABOUT_ICONS);

/** Resolve an icon key to a Lucide component, falling back to the target icon. */
export function aboutIcon(name?: string | null): LucideIcon {
    if (name && ABOUT_ICONS[name]) {
        return ABOUT_ICONS[name];
    }

    return Target;
}
