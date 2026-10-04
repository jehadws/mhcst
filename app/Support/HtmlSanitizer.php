<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * Allowlist HTML sanitizer for staff-authored rich text (blog posts,
 * campaigns, static pages) that is rendered as raw HTML on the site.
 *
 * A tag+attribute allowlist is enforced on the parsed DOM instead of
 * pattern-matching the raw string: regex filters are bypassed by attribute
 * separators ("src=x"onerror=...), entity-encoded schemes and parser
 * quirks, all of which browsers happily execute.
 */
class HtmlSanitizer
{
    /**
     * Tags kept in the output.
     *
     * @var list<string>
     */
    private const ALLOWED_TAGS = [
        'p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'h2', 'h3', 'h4',
        'a', 'blockquote', 'figure', 'figcaption', 'img',
    ];

    /**
     * Attributes kept per allowed tag; every other attribute is dropped.
     *
     * @var array<string, list<string>>
     */
    private const ALLOWED_ATTRIBUTES = [
        'a' => ['href', 'title', 'target', 'rel'],
        'img' => ['src', 'alt', 'title'],
    ];

    /**
     * URL schemes allowed in href/src after entity decoding and control
     * character stripping (browsers resolve the scheme that way).
     *
     * @var list<string>
     */
    private const SAFE_URL_SCHEMES = ['http', 'https', 'mailto', 'tel'];

    /**
     * Dangerous containers dropped together with their content. Every other
     * non-allowed tag is unwrapped like strip_tags: tag gone, text kept.
     *
     * @var list<string>
     */
    private const REMOVED_TAGS = [
        'script', 'style', 'iframe', 'object', 'embed', 'template', 'noscript',
        'noembed', 'noframes', 'svg', 'math', 'form', 'input', 'button',
        'select', 'textarea', 'option', 'link', 'meta', 'base', 'applet',
        'frame', 'frameset', 'head', 'title', 'audio', 'video', 'source',
        'track', 'canvas', 'dialog', 'slot', 'portal', 'xml', 'xmp',
    ];

    public static function clean(?string $html): ?string
    {
        if ($html === null || trim($html) === '') {
            return $html;
        }

        $document = new DOMDocument;

        libxml_use_internal_errors(true);

        try {
            // Numeric-entity encode non-ASCII so loadHTML treats the string
            // as ASCII regardless of its encoding declaration.
            $encoded = mb_encode_numericentity($html, [0x80, 0x10FFFF, 0, 0x1FFFFF], 'UTF-8');
            $document->loadHTML(
                '<!DOCTYPE html><html><body>'.$encoded.'</body></html>',
                LIBXML_NOERROR | LIBXML_NOWARNING,
            );
        } finally {
            libxml_clear_errors();
            libxml_use_internal_errors(false);
        }

        $body = $document->getElementsByTagName('body')->item(0);

        if ($body === null) {
            return '';
        }

        self::sanitizeChildren($body);

        $clean = '';

        foreach (iterator_to_array($body->childNodes) as $child) {
            $clean .= $document->saveHTML($child);
        }

        return $clean;
    }

    public static function plainText(?string $value): ?string
    {
        if ($value === null || $value === '') {
            return $value;
        }

        return strip_tags($value);
    }

    private static function sanitizeChildren(DOMNode $node): void
    {
        $child = $node->firstChild;

        while ($child !== null) {
            $next = $child->nextSibling;

            if ($child instanceof DOMElement) {
                self::sanitizeElement($child);
            }

            $child = $next;
        }
    }

    private static function sanitizeElement(DOMElement $element): void
    {
        $tag = strtolower($element->nodeName);

        if (in_array($tag, self::REMOVED_TAGS, true)) {
            $element->parentNode?->removeChild($element);

            return;
        }

        if (! in_array($tag, self::ALLOWED_TAGS, true)) {
            self::sanitizeChildren($element);
            self::unwrap($element);

            return;
        }

        self::sanitizeAttributes($element);
        self::sanitizeChildren($element);
    }

    private static function sanitizeAttributes(DOMElement $element): void
    {
        $allowed = self::ALLOWED_ATTRIBUTES[strtolower($element->nodeName)] ?? [];

        foreach (iterator_to_array($element->attributes) as $attribute) {
            $name = strtolower($attribute->nodeName);

            if (! in_array($name, $allowed, true)
                || ! self::isSafeUrlValue($name, $attribute->nodeValue ?? '')) {
                $element->removeAttributeNode($attribute);
            }
        }
    }

    private static function isSafeUrlValue(string $name, string $value): bool
    {
        if (! in_array($name, ['href', 'src'], true)) {
            return true;
        }

        $normalized = preg_replace('/[\x00-\x20\x7F]/', '', $value) ?? '';

        if (preg_match('#^([a-zA-Z][a-zA-Z0-9+.\-]*):#', $normalized, $scheme) !== 1) {
            return true;
        }

        return in_array(strtolower($scheme[1]), self::SAFE_URL_SCHEMES, true);
    }

    private static function unwrap(DOMElement $element): void
    {
        $parent = $element->parentNode;

        if ($parent === null) {
            return;
        }

        while ($element->firstChild !== null) {
            $parent->insertBefore($element->firstChild, $element);
        }

        $parent->removeChild($element);
    }
}
