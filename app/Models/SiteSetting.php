<?php

namespace App\Models;

use Database\Factories\SiteSettingFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        $setting = static::where('key', $key)->first();
        if (! $setting) {
            return $default;
        }

        return match ($setting->type) {
            'json' => json_decode($setting->value, true),
            default => $setting->value,
        };
    }
}
