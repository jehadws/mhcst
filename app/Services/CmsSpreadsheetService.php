<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Csv;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CmsSpreadsheetService
{
    /**
     * First characters a spreadsheet app may interpret as a formula when the
     * value is stored as a formula cell.
     *
     * @var list<string>
     */
    private const FORMULA_PREFIXES = ['=', '+', '-', '@', "\t"];

    /**
     * Build an Excel (xlsx) download response from a header row and data rows.
     *
     * @param  array<int, string>  $headers
     * @param  array<int, array<int, mixed>>  $rows
     */
    public static function downloadXlsx(string $filename, string $title, array $headers, array $rows): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle(mb_substr($title, 0, 31));

        $sheet->fromArray($headers, null, 'A1');

        $rowNumber = 2;

        foreach ($rows as $row) {
            self::writeDataRow($sheet, $row, $rowNumber++);
        }

        $lastColumn = $sheet->getHighestColumn();
        $sheet->getStyle('A1:'.$lastColumn.'1')->getFont()->setBold(true);
        $sheet->getStyle('A1:'.$lastColumn.'1')->getFill()
            ->setFillType(Fill::FILL_SOLID)
            ->getStartColor()->setARGB('E8EAF6');

        foreach (range('A', $lastColumn) as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    /**
     * @param  array<int, string>  $headers
     * @param  array<int, array<int, mixed>>  $rows
     */
    public static function downloadCsv(string $filename, array $headers, array $rows): StreamedResponse
    {
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray($headers, null, 'A1');

        $rowNumber = 2;

        foreach ($rows as $row) {
            self::writeDataRow($sheet, $row, $rowNumber++);
        }

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Csv($spreadsheet);
            $writer->setUseBOM(true);
            $writer->setDelimiter(',');
            $writer->setEnclosure('"');
            $writer->setLineEnding("\r\n");
            $writer->setSheetIndex(0);
            $writer->save('php://output');
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    /**
     * Write one data row cell by cell. Strings whose first character could
     * make a spreadsheet app evaluate the cell as a formula (=, +, -, @, TAB)
     * are forced to TYPE_STRING, so a name like "=HYPERLINK(...)" entered by
     * an applicant can never execute when a manager opens the export.
     *
     * @param  array<int|string, mixed>  $row
     */
    private static function writeDataRow(Worksheet $sheet, array $row, int $rowNumber): void
    {
        $columnIndex = 1;

        foreach (array_values($row) as $value) {
            $cell = $sheet->getCell(Coordinate::stringFromColumnIndex($columnIndex).$rowNumber);

            if (is_string($value) && $value !== '' && in_array($value[0], self::FORMULA_PREFIXES, true)) {
                $cell->setValueExplicit($value, DataType::TYPE_STRING);
            } else {
                $cell->setValue($value);
            }

            $columnIndex++;
        }
    }
}
