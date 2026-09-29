import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import AboutForm from '@/components/forms/about-form';
import type { AboutPageContent, BreadcrumbItem } from '@/types';
import { useSite } from '@/context/site-context';

interface Props {
    aboutContent: AboutPageContent;
}

export default function AboutPageEditor({ aboutContent }: Props) {
    const { t } = useSite();
    const d = t.dashboard;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: d.sidebar.items.dashboard, href: '/dashboard' },
        { title: d.sidebar.items.aboutPage, href: route('dashboard.pages.about.edit') },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={d.sidebar.items.aboutPage} />
            <AboutForm content={aboutContent} />
        </AppLayout>
    );
}
