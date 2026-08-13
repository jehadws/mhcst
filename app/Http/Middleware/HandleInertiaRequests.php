<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use App\Services\CmsAuthorizationService;
use App\Services\SiteSeoService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /** @var list<string> */
    private const PUBLIC_SITE_SETTING_KEYS = [
        'site_name',
        'site_name_ar',
        'site_tagline',
        'site_tagline_ar',
        'site_logo',
        'contact_email',
        'contact_phone',
        'whatsapp_number',
        'address',
        'social_links',
        'footer_text',
        'meta_description',
    ];

    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $locale = app()->getLocale();
        $direction = in_array($locale, config('app.rtl_locales', [])) ? 'rtl' : 'ltr';

        return array_merge(parent::share($request), [
            'name' => config('app.name'),
            'appUrl' => rtrim(config('app.url'), '/'),
            'seo' => [
                'themeColor' => SiteSeoService::THEME_COLOR,
                'organization' => app(SiteSeoService::class)->organizationSchema(),
            ],
            'auth' => [
                'user' => $request->user(),
                'roles' => $request->user()?->getRoleNames()->values()->all() ?? [],
            ],
            'cmsCapabilities' => $request->user()
                ? app(CmsAuthorizationService::class)->capabilities($request->user())
                : ['canManage' => false, 'isTeacher' => false],
            'locale' => $locale,
            'direction' => $direction,
            'siteSettings' => SiteSetting::query()
                ->whereIn('key', self::PUBLIC_SITE_SETTING_KEYS)
                ->get()
                ->mapWithKeys(function (SiteSetting $setting) {
                    $value = $setting->type === 'json' ? json_decode($setting->value, true) : $setting->value;

                    return [$setting->key => $value];
                }),
            'flash' => [
                    'success' => $request->session()->get('success'),
                    'import_errors' => $request->session()->get('import_errors'),
                ],
        ]);
    }
}
