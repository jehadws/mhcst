<?php

namespace App\Models;

use Database\Factories\SiteSettingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class SiteSetting extends Model
{
    /** @use HasFactory<SiteSettingFactory> */
    use HasFactory;

    protected $fillable = ['key', 'value', 'type'];

    protected $casts = [
        'value' => 'string',
    ];

    public static function get($key, $default = null)
    {
        // Settings are read many times per request (head meta, SEO payloads,
        // page content). Cache each key indefinitely and flush on write so
        // pages avoid repeated DB round-trips.
        $setting = Cache::rememberForever(
            static::cacheKey($key),
            fn () => static::query()->where('key', $key)->first()
        );

        if (! $setting) {
            return $default;
        }

        return match ($setting->type) {
            'json' => json_decode($setting->value, true),
            default => $setting->value,
        };
    }

    protected static function booted(): void
    {
        static::saved(fn (self $setting) => Cache::forget(static::cacheKey($setting->key)));
        static::deleted(fn (self $setting) => Cache::forget(static::cacheKey($setting->key)));
    }

    private static function cacheKey(string|int $key): string
    {
        return "site_settings.{$key}";
    }
}
