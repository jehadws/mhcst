<?php

namespace App\Http\Middleware;

use App\Models\SiteSetting;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
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
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            'locale' => $locale,
            'direction' => $direction,
            'siteSettings' => SiteSetting::all()->mapWithKeys(function (SiteSetting $setting) {
                $value = $setting->type === 'json' ? json_decode($setting->value, true) : $setting->value;

                return [$setting->key => $value];
            }),
            'flash' => [
                'success' => $request->session()->get('success'),
            ],
        ]);
    }
}
