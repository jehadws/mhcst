<?php

namespace App\Support;

class HtmlSanitizer
{
    private const ALLOWED_TAGS = '<p><br><strong><b><em><i><ul><ol><li><h2><h3><h4><a><blockquote><figure><figcaption><img>';

    public static function clean(?string $html): ?string
    {
        if ($html === null || $html === '') {
            return $html;
        }

        $clean = strip_tags($html, self::ALLOWED_TAGS);
        $clean = preg_replace('/\s(on\w+|style|formaction)\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+)/iu', '', $clean) ?? $clean;
        $clean = preg_replace('/javascript\s*:/iu', '', $clean) ?? $clean;

        return $clean;
    }

    public static function plainText(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        return strip_tags($value);
    }
}
