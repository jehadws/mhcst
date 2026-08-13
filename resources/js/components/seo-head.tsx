import { Head, usePage } from '@inertiajs/react';
import { useSite } from '@/context/site-context';
import { useBrandText, useSiteSettings } from '@/hooks/use-site-settings';
import type { SharedData } from '@/types';

interface SeoProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    robots?: string;
    publishedTime?: string;
    modifiedTime?: string;
    jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

function absoluteUrl(path: string, baseUrl: string): string {
    if (!path) {
        return baseUrl;
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const normalizedBase = baseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${normalizedBase}${normalizedPath}`;
}

function safeJsonLd(data: unknown): string {
    return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function SeoHead({
    title,
    description,
    keywords,
    image,
    url,
    type = 'website',
    robots = 'index, follow',
    publishedTime,
    modifiedTime,
    jsonLd,
}: SeoProps) {
    const { t, locale } = useSite();
    const { brandName } = useBrandText();
    const settings = useSiteSettings();
    const page = usePage<SharedData>();
    const appUrl = (page.props.appUrl as string) || '';
    const organization = page.props.seo?.organization as Record<string, unknown> | undefined;
    const themeColor = (page.props.seo?.themeColor as string) || '#1B365D';

    const siteTitle = title ? `${title} | ${brandName}` : brandName;
    const defaultDesc =
        settings.meta_description ||
        (locale === 'ar'
            ? `${t.brandFull} - دورات تدريبية واحترافية وتدريب تقني وتطوير مهارات في ليبيا.`
            : `${t.brandFull} - Professional courses and technical training in Libya.`);
    const metaDescription = description || defaultDesc;
    const canonicalPath = url || page.url.split('?')[0] || '/';
    const canonicalUrl = absoluteUrl(canonicalPath, appUrl);
    const ogImage = absoluteUrl(image || '/images/og-logo.png', appUrl);

    const structuredData: Record<string, unknown>[] = [];

    if (organization) {
        structuredData.push(organization);
    }

    structuredData.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: brandName,
        url: appUrl || canonicalUrl,
        description: metaDescription,
    });

    if (type === 'article' && title) {
        structuredData.push({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: title,
            description: metaDescription,
            image: ogImage,
            datePublished: publishedTime,
            dateModified: modifiedTime || publishedTime,
            mainEntityOfPage: canonicalUrl,
            publisher: organization
                ? {
                      '@type': 'Organization',
                      name: organization.name,
                      logo: organization.logo,
                  }
                : undefined,
        });
    }

    if (jsonLd) {
        structuredData.push(...(Array.isArray(jsonLd) ? jsonLd : [jsonLd]));
    }

    const cleanedStructuredData = structuredData
        .map((entry) =>
            Object.fromEntries(
                Object.entries(entry).filter(
                    ([, value]) => value !== undefined && value !== null && value !== '',
                ),
            ),
        )
        .filter((entry) => Object.keys(entry).length > 0);

    return (
        <Head title={title ? siteTitle : undefined}>
            {!title && <title>{siteTitle}</title>}
            <meta head-key="description" name="description" content={metaDescription} />
            {keywords && <meta head-key="keywords" name="keywords" content={keywords} />}
            <meta head-key="robots" name="robots" content={robots} />
            <meta head-key="theme-color" name="theme-color" content={themeColor} />
            <link head-key="canonical" rel="canonical" href={canonicalUrl} />

            <meta head-key="og:type" property="og:type" content={type} />
            <meta head-key="og:title" property="og:title" content={siteTitle} />
            <meta head-key="og:description" property="og:description" content={metaDescription} />
            <meta head-key="og:image" property="og:image" content={ogImage} />
            <meta head-key="og:url" property="og:url" content={canonicalUrl} />
            <meta
                head-key="og:locale"
                property="og:locale"
                content={locale === 'ar' ? 'ar_LY' : 'en_US'}
            />
            <meta
                head-key="og:locale:alternate"
                property="og:locale:alternate"
                content={locale === 'ar' ? 'en_US' : 'ar_LY'}
            />
            <meta head-key="og:site_name" property="og:site_name" content={brandName} />
            {publishedTime && (
                <meta head-key="article:published_time" property="article:published_time" content={publishedTime} />
            )}
            {modifiedTime && (
                <meta head-key="article:modified_time" property="article:modified_time" content={modifiedTime} />
            )}

            <meta head-key="twitter:card" name="twitter:card" content="summary_large_image" />
            <meta head-key="twitter:title" name="twitter:title" content={siteTitle} />
            <meta head-key="twitter:description" name="twitter:description" content={metaDescription} />
            <meta head-key="twitter:image" name="twitter:image" content={ogImage} />

            {cleanedStructuredData.length > 0 && (
                <script
                    head-key="json-ld"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: safeJsonLd(
                            cleanedStructuredData.length === 1
                                ? cleanedStructuredData[0]
                                : cleanedStructuredData,
                        ),
                    }}
                />
            )}
        </Head>
    );
}
