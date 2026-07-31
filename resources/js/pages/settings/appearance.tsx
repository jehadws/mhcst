import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useSite } from '@/context/site-context';

export default function Appearance() {
    const { t } = useSite();
    const s = t.dashboard.settings.appearance;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: s.title, href: '/settings/appearance' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={s.title} />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title={s.heading} description={s.description} />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
