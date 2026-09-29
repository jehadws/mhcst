<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
use App\Support\AboutPageContent;
use App\Support\HtmlSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SiteSettingController extends Controller
{
    private const GROUPS = [
        'general' => [
            'label' => 'General',
            'fields' => ['site_name', 'site_name_ar', 'site_tagline', 'site_tagline_ar', 'site_logo', 'meta_description'],
        ],
        'contact' => [
            'label' => 'Contact',
            'fields' => ['contact_email', 'contact_phone', 'whatsapp_number', 'address'],
        ],
        'social' => [
            'label' => 'Social Media',
            'fields' => ['social_links'],
        ],
        'footer' => [
            'label' => 'Footer',
            'fields' => ['footer_text'],
        ],
        'visibility' => [
            'label' => 'Visibility',
            'fields' => ['hide_instructor_names'],
        ],
    ];

    public function edit()
    {
        $settings = SiteSetting::all()->keyBy('key');

        $groups = collect(self::GROUPS)->map(function ($group) use ($settings) {
            $group['fields'] = collect($group['fields'])->map(function ($key) use ($settings) {
                $setting = $settings->get($key);

                return $setting ? [
                    'key' => $setting->key,
                    'value' => $setting->value,
                    'type' => $setting->type,
                ] : null;
            })->filter()->values()->all();

            return $group;
        })->values()->all();

        return Inertia::render('dashboard/site-settings/edit', [
            'groups' => $groups,
        ]);
    }

    public function update(Request $request)
    {
        $settings = $request->validate([
            'settings' => ['required', 'array'],
        ])['settings'];

        $validKeys = SiteSetting::pluck('key')->all();

        foreach ($settings as $key => $value) {
            if (! in_array($key, $validKeys)) {
                continue;
            }

            $setting = SiteSetting::where('key', $key)->first();

            if ($setting->type === 'image') {
                $file = $request->file("settings.{$key}");

                if ($file) {
                    if ($setting->value) {
                        Storage::disk('public')->delete($setting->value);
                    }
                    $setting->update(['value' => $file->store('settings', 'public')]);
                } elseif (is_string($value) && $value !== $setting->value) {
                    if ($setting->value) {
                        Storage::disk('public')->delete($setting->value);
                    }
                    $setting->update(['value' => $value]);
                }
            } elseif ($setting->type === 'json') {
                $decoded = json_decode($value, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    return back()->withErrors([
                        "settings.{$key}" => "The {$key} field must be valid JSON.",
                    ]);
                }

                $setting->update(['value' => json_encode($decoded)]);
            } elseif ($setting->type === 'boolean') {
                $setting->update(['value' => filter_var($value, FILTER_VALIDATE_BOOLEAN) ? '1' : '0']);
            } else {
                $setting->update(['value' => $value]);
            }
        }

        return back();
    }

    public function editAbout()
    {
        $about = SiteSetting::get('about_page');

        return Inertia::render('dashboard/site-settings/about', [
            'aboutContent' => $about ?? AboutPageContent::default(),
        ]);
    }

    public function updateAbout(Request $request)
    {
        $data = $request->validate([
            'hero.title' => ['required', 'string', 'max:255'],
            'hero.title_ar' => ['required', 'string', 'max:255'],
            'hero.description' => ['nullable', 'string', 'max:1000'],
            'hero.description_ar' => ['nullable', 'string', 'max:1000'],
            'hero.image' => ['nullable', 'string', 'max:2048'],
            'pillars' => ['required', 'array', 'min:1'],
            'pillars.*.icon' => ['nullable', 'string', 'max:50'],
            'pillars.*.title' => ['required', 'string', 'max:255'],
            'pillars.*.title_ar' => ['required', 'string', 'max:255'],
            'pillars.*.body' => ['required', 'string', 'max:2000'],
            'pillars.*.body_ar' => ['required', 'string', 'max:2000'],
            'values' => ['required', 'array', 'min:1'],
            'values.*.icon' => ['nullable', 'string', 'max:50'],
            'values.*.title' => ['required', 'string', 'max:255'],
            'values.*.title_ar' => ['required', 'string', 'max:255'],
            'values.*.body' => ['required', 'string', 'max:500'],
            'values.*.body_ar' => ['required', 'string', 'max:500'],
            'milestones' => ['required', 'array', 'min:1'],
            'milestones.*.year' => ['required', 'string', 'max:10'],
            'milestones.*.label' => ['required', 'string', 'max:100'],
            'milestones.*.label_ar' => ['required', 'string', 'max:100'],
        ]);

        $content = [
            'hero' => [
                'title' => HtmlSanitizer::plainText($data['hero']['title']),
                'title_ar' => HtmlSanitizer::plainText($data['hero']['title_ar']),
                'description' => HtmlSanitizer::plainText($data['hero']['description'] ?? ''),
                'description_ar' => HtmlSanitizer::plainText($data['hero']['description_ar'] ?? ''),
                'image' => $data['hero']['image'] ?? '',
            ],
            'pillars' => collect($data['pillars'])->map(fn (array $pillar): array => [
                'icon' => HtmlSanitizer::plainText($pillar['icon'] ?? 'target'),
                'title' => HtmlSanitizer::plainText($pillar['title']),
                'title_ar' => HtmlSanitizer::plainText($pillar['title_ar']),
                'body' => HtmlSanitizer::plainText($pillar['body']),
                'body_ar' => HtmlSanitizer::plainText($pillar['body_ar']),
            ])->all(),
            'values' => collect($data['values'])->map(fn (array $value): array => [
                'icon' => HtmlSanitizer::plainText($value['icon'] ?? 'shield-check'),
                'title' => HtmlSanitizer::plainText($value['title']),
                'title_ar' => HtmlSanitizer::plainText($value['title_ar']),
                'body' => HtmlSanitizer::plainText($value['body']),
                'body_ar' => HtmlSanitizer::plainText($value['body_ar']),
            ])->all(),
            'milestones' => collect($data['milestones'])->map(fn (array $milestone): array => [
                'year' => HtmlSanitizer::plainText($milestone['year']),
                'label' => HtmlSanitizer::plainText($milestone['label']),
                'label_ar' => HtmlSanitizer::plainText($milestone['label_ar']),
            ])->all(),
        ];

        SiteSetting::updateOrCreate(
            ['key' => 'about_page'],
            ['value' => json_encode($content, JSON_UNESCAPED_UNICODE), 'type' => 'json']
        );

        return back();
    }
}
