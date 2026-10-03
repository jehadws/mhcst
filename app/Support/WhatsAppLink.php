<?php

namespace App\Support;

/**
 * Build a wa.me deep link from a stored phone number and a pre-written
 * message. No gateway, no dependency — the admin taps the link and the
 * ready-made Arabic message is already in the composer.
 */
class WhatsAppLink
{
    /**
     * @return string|null null when the contact has no usable phone number.
     */
    public static function build(?string $phone, string $message): ?string
    {
        $digits = preg_replace('/\D+/', '', (string) $phone);

        if ($digits === null || $digits === '') {
            return null;
        }

        // Local Libyan numbers are stored with a leading 0; wa.me needs the
        // international form without a plus sign.
        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        } elseif (str_starts_with($digits, '0')) {
            $digits = '218'.substr($digits, 1);
        }

        return 'https://wa.me/'.$digits.'?text='.rawurlencode($message);
    }
}
