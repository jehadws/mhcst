<?php

namespace App\Support;

class SecurityHelper
{
    /**
     * Recursively strip any key whose name matches a sensitive pattern.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function stripSensitiveRecursive(array $data): array
    {
        $pattern = '/(password|token|secret|api_?key|authorization|remember_token|cookie)/i';

        foreach ($data as $key => $value) {
            if (is_string($key) && preg_match($pattern, $key)) {
                $data[$key] = '***REDACTED***';
            } elseif (is_array($value)) {
                $data[$key] = self::stripSensitiveRecursive($value);
            }
        }

        return $data;
    }
}
