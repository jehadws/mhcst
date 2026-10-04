<?php

use App\Support\HtmlSanitizer;

test('allowlisted tags and attributes survive sanitizing', function () {
    expect(HtmlSanitizer::clean('<p><strong>Bold</strong> and <em>italic</em></p>'))
        ->toBe('<p><strong>Bold</strong> and <em>italic</em></p>');

    expect(HtmlSanitizer::clean('<a href="https://example.com" title="ok" target="_blank">link</a>'))
        ->toBe('<a href="https://example.com" title="ok" target="_blank">link</a>');

    expect(HtmlSanitizer::clean('<img src="/storage/uploads/a.png" alt="Logo">'))
        ->toBe('<img src="/storage/uploads/a.png" alt="Logo">');
});

test('non-ascii content round-trips intact', function () {
    expect(HtmlSanitizer::clean('<h2>مرحبا بالعالم</h2><p>نص عربي</p>'))
        ->toBe('<h2>مرحبا بالعالم</h2><p>نص عربي</p>');
});

test('event handler attributes are removed regardless of attribute separators', function () {
    expect(HtmlSanitizer::clean('<img src="x" onerror=alert(1)>'))->toBe('<img src="x">')
        ->and(HtmlSanitizer::clean('<img src="x"onerror=alert(1)>'))->toBe('<img src="x">')
        ->and(HtmlSanitizer::clean('<img/src="x"/onerror=alert(1)>'))->not->toContain('onerror')
        ->and(HtmlSanitizer::clean('<p onmouseover="alert(1)">x</p>'))->toBe('<p>x</p>');
});

test('entity encoded javascript schemes cannot survive in href', function () {
    expect(HtmlSanitizer::clean('<a href="jav&#x09;ascript:alert(1)">click</a>'))->toBe('<a>click</a>')
        ->and(HtmlSanitizer::clean('<a href="javascript:alert(1)">click</a>'))->toBe('<a>click</a>')
        ->and(HtmlSanitizer::clean('<a href="JaVaScRiPt&#58;alert(1)">click</a>'))->toBe('<a>click</a>')
        ->and(HtmlSanitizer::clean('<a href="vbscript:msgbox(1)">click</a>'))->toBe('<a>click</a>');
});

test('dangerous containers are dropped with their content', function () {
    expect(HtmlSanitizer::clean('<script>alert(1)</script><p>after</p>'))->toBe('<p>after</p>')
        ->and(HtmlSanitizer::clean('<style>p{color:red}</style><p>ok</p>'))->toBe('<p>ok</p>')
        ->and(HtmlSanitizer::clean('<iframe src="https://evil.example"></iframe>'))->toBe('')
        ->and(HtmlSanitizer::clean('<img src="x" srcdoc="<script>alert(1)</script>">'))->not->toContain('srcdoc');
});

test('disallowed tags are unwrapped keeping their text content', function () {
    expect(HtmlSanitizer::clean('<div onclick="x()"><p>hello</p></div>'))->toBe('<p>hello</p>')
        ->and(HtmlSanitizer::clean('<span style="color:red">text</span>'))->toBe('text');
});

test('url attributes outside the safe schemes are removed', function () {
    expect(HtmlSanitizer::clean('<img src="data:text/html;base64,PHNjcmlwdD4=">'))->toBe('<img>')
        ->and(HtmlSanitizer::clean('<p style="color:red">x</p>'))->toBe('<p>x</p>');
});

test('malformed html is still sanitized and closed', function () {
    expect(HtmlSanitizer::clean('<p>unclosed <b>bold'))->toBe('<p>unclosed <b>bold</b></p>');
});

test('null and empty input pass through unchanged', function () {
    expect(HtmlSanitizer::clean(null))->toBeNull()
        ->and(HtmlSanitizer::clean(''))->toBe('');
});
