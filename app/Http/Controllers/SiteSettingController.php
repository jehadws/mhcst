<?php

namespace App\Http\Controllers;

use App\Models\SiteSetting;
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
            } else {
                $setting->update(['value' => $value]);
            }
        }

        return back();
    }
}
