<?php

namespace App\Services;

use App\Models\CmsEnrollment;
use Illuminate\Support\Collection;

/**
 * Parses TSV data pasted from Excel / Google Sheets into grade rows matched
 * against the active enrollments of one subject. Tolerates Arabic/Excel
 * clipboard quirks: decimal commas, Arabic-Indic digits, Arabic decimal and
 * thousands separators, percent signs, optional header rows, and empty cells.
 */
class CmsGradePasteService
{
    private const GRADE_FIELDS = ['midterm', 'final', 'assignments', 'projects', 'participation'];

    private const FIELD_LABELS_AR = [
        'midterm' => 'النصفي',
        'final' => 'النهائي',
        'assignments' => 'الواجبات',
        'projects' => 'المشاريع',
        'participation' => 'المشاركة',
    ];

    private const MAX_ROWS = 500;

    /**
     * Header label candidates per column key, normalized the same way the
     * parser normalizes header cells (see normalizeHeader()).
     *
     * @var array<string, list<string>>
     */
    private const HEADER_ALIASES = [
        'student_no' => ['id', 'no', 'number', 'studentno', 'studentid', 'رقم', 'رقمالقيد', 'القيد', 'الرقمالجامعي'],
        'name' => ['name', 'student', 'studentname', 'الطالب', 'الاسم', 'اسمالطالب', 'اسم'],
        'midterm' => ['midterm', 'النصفي', 'نصفي'],
        'final' => ['final', 'النهائي', 'نهائي', 'النهائيه'],
        'assignments' => ['assignments', 'assignment', 'homework', 'الواجبات', 'واجبات', 'الواجب'],
        'projects' => ['projects', 'project', 'المشاريع', 'مشاريع', 'المشروع'],
        'participation' => ['participation', 'المشاركه', 'مشاركه', 'المشاركة', 'مشاركة'],
    ];

    /**
     * @param  Collection<int, CmsEnrollment>  $enrollments  Active enrollments (students loaded) of one subject
     * @return array{rows: list<array{enrollment_id: int, student_no: string, name: string, values: array<string, float>, warnings: list<string>}>, unmatched: list<array{line: int, identifier: string, reason: string}>}
     */
    public function parse(string $text, Collection $enrollments): array
    {
        $lines = [];
        foreach (preg_split('/\r\n|\r|\n/', $text) ?: [] as $index => $line) {
            if (trim($line) !== '') {
                $lines[] = ['line' => $index + 1, 'cells' => explode("\t", $line)];
            }
        }

        $rows = [];
        $unmatched = [];

        if ($lines === []) {
            return ['rows' => $rows, 'unmatched' => $unmatched];
        }

        $columnMap = $this->detectColumns($lines[0]['cells']);
        $hasHeader = $columnMap !== null;

        if ($hasHeader) {
            array_shift($lines);
        }

        $byStudentNo = [];
        $namesToEnrollments = [];
        foreach ($enrollments as $enrollment) {
            $studentNo = $this->normalizeKey((string) ($enrollment->student?->student_no ?? ''));
            if ($studentNo !== '') {
                $byStudentNo[$studentNo] = $enrollment;
            }

            $name = $this->normalizeName((string) ($enrollment->student?->name ?? ''));
            if ($name !== '') {
                $namesToEnrollments[$name][] = $enrollment;
            }
        }

        foreach ($lines as $data) {
            if (count($rows) + count($unmatched) >= self::MAX_ROWS) {
                $unmatched[] = [
                    'line' => $data['line'],
                    'identifier' => '…',
                    'reason' => 'تم تجاوز الحد الأقصى وهو '.self::MAX_ROWS.' صف — الصفوف الزائدة لم تُعالج.',
                ];

                break;
            }

            $cells = $data['cells'];

            $identifierIndex = 0;
            if ($hasHeader) {
                $identifierIndex = $columnMap['student_no']
                    ?? $columnMap['name']
                    ?? 0;
            }

            $identifier = trim((string) ($cells[$identifierIndex] ?? ''));

            if ($hasHeader && $identifier === '' && isset($columnMap['name']) && isset($columnMap['student_no'])) {
                $identifier = trim((string) ($cells[$columnMap['name']] ?? ''));
            }

            if ($identifier === '' && ! $this->hasValue($cells)) {
                continue;
            }

            $enrollment = $this->matchEnrollment($identifier, $byStudentNo, $namesToEnrollments, $unmatched, $data['line']);

            if (! $enrollment) {
                if ($identifier !== '') {
                    $unmatched[] = [
                        'line' => $data['line'],
                        'identifier' => $identifier,
                        'reason' => 'لا يوجد طالب مسجل في هذه المادة بهذا الرقم أو الاسم.',
                    ];
                }

                continue;
            }

            $values = [];
            $warnings = [];

            foreach ($this->gradeColumns($columnMap, $hasHeader) as $field => $index) {
                $raw = (string) ($cells[$index] ?? '');

                if (trim($raw) === '') {
                    continue;
                }

                $score = $this->parseNumber($raw);

                if ($score === null) {
                    $warnings[] = "القيمة «{$raw}» في خانة ".self::FIELD_LABELS_AR[$field].' غير مفهومة — لم تُحفظ.';
                } elseif ($score < 0 || $score > 100) {
                    $warnings[] = 'درجة '.self::FIELD_LABELS_AR[$field]." ({$score}) خارج النطاق 0-100 — لم تُحفظ.";
                } else {
                    $values[$field] = $score;
                }
            }

            if ($values === [] && $warnings === []) {
                $unmatched[] = [
                    'line' => $data['line'],
                    'identifier' => $identifier,
                    'reason' => 'لا توجد درجات في هذا الصف.',
                ];

                continue;
            }

            $rows[] = [
                'enrollment_id' => (int) $enrollment->id,
                'student_no' => (string) ($enrollment->student?->student_no ?? ''),
                'name' => (string) ($enrollment->student?->name ?? ''),
                'values' => $values,
                'warnings' => $warnings,
            ];
        }

        return ['rows' => $rows, 'unmatched' => $unmatched];
    }

    /**
     * Detects a header row by matching its cells against known aliases.
     * Returns a map of column key => cell index, or null when the first
     * row is data (fixed order is assumed: identifier, midterm, final,
     * assignments, projects, participation).
     *
     * @param  list<string>  $cells
     * @return array<string, int>|null
     */
    private function detectColumns(array $cells): ?array
    {
        $map = [];

        foreach ($cells as $index => $cell) {
            $normalized = $this->normalizeHeader((string) $cell);

            foreach (self::HEADER_ALIASES as $key => $aliases) {
                if ($normalized !== '' && in_array($normalized, $aliases, true) && ! isset($map[$key])) {
                    $map[$key] = $index;

                    break;
                }
            }
        }

        $hasIdentifier = isset($map['student_no']) || isset($map['name']);
        $hasGrade = count(array_intersect_key($map, array_flip(self::GRADE_FIELDS))) > 0;

        if ($hasIdentifier && $hasGrade) {
            return $map;
        }

        return null;
    }

    /**
     * Resolves grade column indexes: the header map when a header was
     * detected, otherwise the fixed pasted-from-Excel order.
     *
     * @param  array<string, int>|null  $columnMap
     * @return array<string, int>
     */
    private function gradeColumns(?array $columnMap, bool $hasHeader): array
    {
        if ($hasHeader && $columnMap !== null) {
            return array_intersect_key($columnMap, array_flip(self::GRADE_FIELDS));
        }

        return array_combine(
            self::GRADE_FIELDS,
            [1, 2, 3, 4, 5]
        );
    }

    /**
     * @param  array<string, CmsEnrollment>  $byStudentNo
     * @param  array<string, list<CmsEnrollment>>  $namesToEnrollments
     * @param  list<array{line: int, identifier: string, reason: string}>  $unmatched
     */
    private function matchEnrollment(string $identifier, array $byStudentNo, array $namesToEnrollments, array &$unmatched, int $line): ?CmsEnrollment
    {
        if ($identifier === '') {
            return null;
        }

        $matched = $byStudentNo[$this->normalizeKey($identifier)] ?? null;
        if ($matched) {
            return $matched;
        }

        $candidates = $namesToEnrollments[$this->normalizeName($identifier)] ?? [];

        if (count($candidates) === 1) {
            return $candidates[0];
        }

        if (count($candidates) > 1) {
            $unmatched[] = [
                'line' => $line,
                'identifier' => $identifier,
                'reason' => 'يوجد أكثر من طالب بهذا الاسم — استخدم رقم القيد للتمييز.',
            ];

            return null;
        }

        return null;
    }

    /**
     * Parses a pasted grade cell: strips spaces/percent signs, converts
     * Arabic-Indic digits and Arabic decimal separators, then decides
     * whether a comma is a decimal or thousands separator.
     */
    private function parseNumber(string $raw): ?float
    {
        $value = str_replace(["\u{00A0}", "\u{2007}", "\u{202F}", ' ', '%', '٪'], '', trim($raw));

        $value = strtr($value, [
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
            '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
            "\u{066B}" => '.',
            "\u{066C}" => '',
            '،' => '',
        ]);

        if ($value === '') {
            return null;
        }

        if (str_contains($value, '.')) {
            $value = str_replace(',', '', $value);
        } elseif (substr_count($value, ',') === 1 && preg_match('/,(\d{1,2})$/', $value) === 1) {
            $value = str_replace(',', '.', $value);
        } else {
            $value = str_replace(',', '', $value);
        }

        if ($value === '' || ! is_numeric($value)) {
            return null;
        }

        return (float) $value;
    }

    private function normalizeHeader(string $value): string
    {
        return $this->normalizeArabic(mb_strtolower(str_replace(["\u{00A0}", ' '], '', trim($value))));
    }

    private function normalizeKey(string $value): string
    {
        $value = strtr($value, [
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
            '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
        ]);

        return mb_strtoupper(preg_replace('/[^A-Za-z0-9\x{0600}-\x{06FF}]/u', '', $value) ?? '');
    }

    private function normalizeName(string $value): string
    {
        $value = preg_replace("/[\u{064B}-\u{0652}\u{0670}\u{0640}]/u", '', trim($value)) ?? '';
        $value = preg_replace('/\s+/u', ' ', $value) ?? '';

        return $this->normalizeArabic($value);
    }

    /**
     * Collapses alef/ya/ta-marbuta spelling variants so "مشاركة" and
     * "مشاركه" (and اسم variants) compare equal.
     */
    private function normalizeArabic(string $value): string
    {
        return strtr($value, [
            'أ' => 'ا', 'إ' => 'ا', 'آ' => 'ا', 'ٱ' => 'ا',
            'ة' => 'ه',
            'ى' => 'ي',
        ]);
    }

    /**
     * @param  list<string>  $cells
     */
    private function hasValue(array $cells): bool
    {
        foreach ($cells as $cell) {
            if (trim((string) $cell) !== '') {
                return true;
            }
        }

        return false;
    }
}
