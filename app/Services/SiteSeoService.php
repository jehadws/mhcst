<?php

namespace App\Services;

use App\Models\BlogPost;
use App\Models\SiteSetting;
use App\Support\HtmlSanitizer;
use App\Support\SiteLogo;
use Illuminate\Support\Str;

class SiteSeoService
{
    public const THEME_COLOR = '#1B365D';

    public const BACKGROUND_COLOR = '#ffffff';

    /**
     * @return array<string, mixed>
     */
    public function manifest(): array
    {
        $name = (string) SiteSetting::get('site_name', config('app.name'));
        $description = (string) SiteSetting::get('meta_description', $name);

        return [
            'id' => '/',
            'name' => HtmlSanitizer::plainText($name),
            'short_name' => $this->shortName(HtmlSanitizer::plainText($name) ?? $name),
            'description' => HtmlSanitizer::plainText($description),
            'lang' => 'ar',
            'dir' => 'rtl',
            'start_url' => '/',
            'scope' => '/',
            'display' => 'standalone',
            'orientation' => 'portrait-primary',
            'theme_color' => self::THEME_COLOR,
            'background_color' => self::BACKGROUND_COLOR,
            'categories' => ['education'],
            'icons' => [
                [
                    'src' => '/android-chrome-192x192.png',
                    'sizes' => '192x192',
                    'type' => 'image/png',
                    'purpose' => 'any',
                ],
                [
                    'src' => '/android-chrome-512x512.png',
                    'sizes' => '512x512',
                    'type' => 'image/png',
                    'purpose' => 'any',
                ],
                [
                    'src' => '/android-chrome-512x512.png',
                    'sizes' => '512x512',
                    'type' => 'image/png',
                    'purpose' => 'maskable',
                ],
            ],
        ];
    }

    public function robots(): string
    {
        $lines = [
            'User-agent: *',
            'Disallow: /dashboard',
            'Disallow: /cms',
            'Disallow: /login',
            'Disallow: /register',
            'Disallow: /password',
            'Disallow: /settings',
            'Disallow: /student/portal',
            '',
            'Sitemap: '.route('seo.sitemap'),
        ];

        return implode("\n", $lines)."\n";
    }

    public function browserConfigXml(): string
    {
        return '<?xml version="1.0" encoding="utf-8"?>'
            .'<browserconfig>'
            .'<msapplication>'
            .'<tile>'
            .'<square150x150logo src="/android-chrome-192x192.png"/>'
            .'<square310x310logo src="/android-chrome-512x512.png"/>'
            .'<TileColor>'.e(self::THEME_COLOR).'</TileColor>'
            .'</tile>'
            .'</msapplication>'
            .'</browserconfig>';
    }

    public function sitemapXml(): string
    {
        $entries = $this->sitemapEntries();

        $urls = collect($entries)->map(function (array $entry): string {
            $lastmod = isset($entry['lastmod'])
                ? '<lastmod>'.e($entry['lastmod']).'</lastmod>'
                : '';
            $changefreq = isset($entry['changefreq'])
                ? '<changefreq>'.e($entry['changefreq']).'</changefreq>'
                : '';
            $priority = isset($entry['priority'])
                ? '<priority>'.e($entry['priority']).'</priority>'
                : '';

            return '<url>'
                .'<loc>'.e($entry['loc']).'</loc>'
                .$lastmod
                .$changefreq
                .$priority
                .'</url>';
        })->implode('');

        return '<?xml version="1.0" encoding="UTF-8"?>'
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
            .$urls
            .'</urlset>';
    }

    /**
     * @return array<string, mixed>
     */
    public function organizationSchema(): array
    {
        $name = (string) SiteSetting::get('site_name', config('app.name'));
        $logo = SiteLogo::url(SiteSetting::get('site_logo'), '/images/og-logo.png');
        $socialLinks = SiteSetting::get('social_links', []);
        $sameAs = is_array($socialLinks)
            ? array_values(array_filter($socialLinks, fn ($url) => is_string($url) && $url !== ''))
            : [];

        $schema = [
            '@context' => 'https://schema.org',
            '@type' => 'EducationalOrganization',
            'name' => HtmlSanitizer::plainText($name),
            'alternateName' => HtmlSanitizer::plainText(SiteSetting::get('site_name_ar')),
            'url' => config('app.url'),
            'logo' => $logo,
            'description' => HtmlSanitizer::plainText(SiteSetting::get('meta_description')),
            'email' => SiteSetting::get('contact_email'),
            'telephone' => SiteSetting::get('contact_phone'),
            'address' => [
                '@type' => 'PostalAddress',
                'addressLocality' => HtmlSanitizer::plainText(SiteSetting::get('address')),
                'addressCountry' => 'LY',
            ],
            'sameAs' => $sameAs,
        ];

        return array_filter(
            $schema,
            fn ($value) => $value !== null && $value !== '' && $value !== []
        );
    }

    /**
     * @return list<array{loc: string, lastmod?: string, changefreq?: string, priority?: string}>
     */
    private function sitemapEntries(): array
    {
        $entries = [
            $this->entry(route('home'), '1.0', 'weekly'),
            $this->entry(route('about'), '0.8', 'monthly'),
            $this->entry(route('departments'), '0.8', 'monthly'),
            $this->entry(route('faq'), '0.7', 'monthly'),
            $this->entry(route('contact'), '0.7', 'monthly'),
            $this->entry(route('blog'), '0.8', 'weekly'),
            $this->entry(route('verify-certificate'), '0.5', 'monthly'),
            $this->entry(route('terms-of-use'), '0.3', 'yearly'),
            $this->entry(route('privacy-policy'), '0.3', 'yearly'),
        ];

        BlogPost::query()
            ->where('status', 'published')
            ->orderByDesc('published_at')
            ->get(['slug', 'updated_at', 'published_at'])
            ->each(function (BlogPost $post) use (&$entries): void {
                $entries[] = [
                    'loc' => route('blog.show', $post->slug),
                    'lastmod' => ($post->updated_at ?? $post->published_at)?->toAtomString(),
                    'changefreq' => 'monthly',
                    'priority' => '0.6',
                ];
            });

        return $entries;
    }

    /**
     * @return array{loc: string, lastmod: string, changefreq: string, priority: string}
     */
    private function entry(string $loc, string $priority, string $changefreq): array
    {
        return [
            'loc' => $loc,
            'lastmod' => now()->toAtomString(),
            'changefreq' => $changefreq,
            'priority' => $priority,
        ];
    }

    private function shortName(string $name): string
    {
        $short = Str::before($name, ' College');

        if ($short === $name) {
            $short = Str::words($name, 2, '');
        }

        return Str::limit(trim($short), 20, '');
    }
}
