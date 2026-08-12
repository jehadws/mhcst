<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

class SiteLogo
{
    /**
     * Resolve the public URL for the college logo.
     */
    public static function url(?string $storedPath = null, string $fallback = '/images/branding/logo-header-128.png'): ?string
    {
        if ($storedPath) {
            if (str_starts_with($storedPath, 'http') || str_starts_with($storedPath, '/')) {
                return $storedPath;
            }

            if (str_starts_with($storedPath, 'images/') && file_exists(public_path($storedPath))) {
                return asset($storedPath);
            }

            if (Storage::disk('public')->exists($storedPath)) {
                return asset('storage/'.$storedPath);
            }
        }

        foreach ([$fallback, '/logo.png', '/images/branding/logo-main.png'] as $candidate) {
            $path = public_path(ltrim($candidate, '/'));

            if (file_exists($path)) {
                return asset(ltrim($candidate, '/'));
            }
        }

        return null;
    }
}
