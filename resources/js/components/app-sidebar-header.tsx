import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import AppearanceToggleDropdown from '@/components/appearance-dropdown';
import { GlobalStudentSearch } from '@/components/global-student-search';
import { useSite } from '@/context/site-context';
import { Globe } from 'lucide-react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { locale, t, toggleLocale } = useSite();
    const search = t.cms.search;

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 border-b px-3 transition-[width,height] ease-linear sm:px-4 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ms-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <div className="ms-auto flex items-center gap-1">
                <GlobalStudentSearch
                    placeholder={search.placeholder}
                    hint={search.hint}
                    emptyLabel={search.empty}
                />
                <Button
                    type="button"
                    variant="ghost"
                    onClick={toggleLocale}
                    aria-label="Toggle language"
                    className="h-9 gap-1.5 rounded-md px-2 text-xs font-semibold"
                >
                    <Globe className="size-4" />
                    {locale === 'en' ? 'AR' : 'EN'}
                </Button>
                <AppearanceToggleDropdown />
            </div>
        </header>
    );
}
