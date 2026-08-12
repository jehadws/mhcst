import { Head } from '@inertiajs/react';
import { useSite } from '@/context/site-context';

interface SeoProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

export function SeoHead({ title, description, keywords, image, url, type = 'website' }: SeoProps) {
    const { t, locale } = useSite();

    const siteTitle = title ? `${title} | ${t.brandShort}` : `${t.brandFull}`;
    const defaultDesc = locale === 'ar'
        ? `${t.brandFull} - دورات تدريبية واحترافية وتدريب تقني وتطوير مهارات في ليبيا.`
        : `${t.brandFull} - Professional courses and technical training in Libya.`;
    const metaDescription = description || defaultDesc;
    const siteUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    const ogImage = image || '/images/og-logo.png';

    return (
        <Head title={title ? siteTitle : undefined}>
            {!title && <title>{siteTitle}</title>}
            <meta name="description" content={metaDescription} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={siteTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={ogImage} />
            {siteUrl && <meta property="og:url" content={siteUrl} />}
            <meta property="og:locale" content={locale === 'ar' ? 'ar_LY' : 'en_US'} />
            <meta property="og:site_name" content={t.brandShort} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={siteTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={ogImage} />
        </Head>
    );
}
