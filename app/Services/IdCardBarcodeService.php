<?php

namespace App\Services;

class IdCardBarcodeService
{
    private const CODE_39 = [
        '0' => 'nnnwwnwnn',
        '1' => 'wnnwnnnnw',
        '2' => 'nnwwnnnnw',
        '3' => 'wnwwnnnnn',
        '4' => 'nnnwwnnnw',
        '5' => 'wnnwwnnnn',
        '6' => 'nnwwwnnnn',
        '7' => 'nnnwnnwnw',
        '8' => 'wnnwnnwnn',
        '9' => 'nnwwnnwnn',
        'A' => 'wnnnnwnnw',
        'B' => 'nnwnnwnnw',
        'C' => 'wnwnnwnnn',
        'D' => 'nnnnwwnnw',
        'E' => 'wnnnwwnnn',
        'F' => 'nnwnwwnnn',
        'G' => 'nnnnnwwnw',
        'H' => 'wnnnnwwnn',
        'I' => 'nnwnnwwnn',
        'J' => 'nnnnwwwnn',
        'K' => 'wnnnnnnww',
        'L' => 'nnwnnnnww',
        'M' => 'wnwnnnnwn',
        'N' => 'nnnnwnnww',
        'O' => 'wnnnwnnwn',
        'P' => 'nnwnwnnwn',
        'Q' => 'nnnnnnwww',
        'R' => 'wnnnnnwwn',
        'S' => 'nnwnnnwwn',
        'T' => 'nnnnwnwwn',
        'U' => 'wwnnnnnnw',
        'V' => 'nwwnnnnnw',
        'W' => 'wwwnnnnnn',
        'X' => 'nwnnwnnnw',
        'Y' => 'wwnnwnnnn',
        'Z' => 'nwwnwnnnn',
        '-' => 'nwnnnnwnw',
        '.' => 'wwnnnnwnn',
        ' ' => 'nwwnnnwnn',
        '$' => 'nwnwnwnnn',
        '/' => 'nwnwnnnwn',
        '+' => 'nwnnnwnwn',
        '%' => 'nnnwnwnwn',
        '*' => 'nwnnwnwnn',
    ];

    private const FALLBACK_CHAR = '-';

    public static function code39Svg(string $value, int $unit = 2, int $height = 40, string $color = '#0f172a'): string
    {
        $value = strtoupper($value);
        $encoded = '*'.$value.'*';

        $x = 0;
        $bars = [];

        foreach (str_split($encoded) as $char) {
            $pattern = self::CODE_39[$char] ?? self::CODE_39[self::FALLBACK_CHAR];

            foreach (str_split($pattern) as $index => $element) {
                $width = $element === 'w' ? 3 * $unit : $unit;

                if ($index % 2 === 0) {
                    $bars[] = sprintf('<rect x="%d" width="%d" height="%d" fill="%s"/>', $x, $width, $height, $color);
                }

                $x += $width;
            }

            $x += $unit;
        }

        $totalWidth = max($x - $unit, 1);

        return sprintf(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" preserveAspectRatio="none" role="img" aria-label="%s">%s</svg>',
            $totalWidth,
            $height,
            $value,
            implode('', $bars)
        );
    }
}
