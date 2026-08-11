<?php

namespace App\Services;

use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date;

class CmsStudentImportService
{
    public const HEADERS = [
        'student_no',
        'name',
        'email',
        'phone',
        'gender',
        'department',
        'year',
        'section',
        'enrollment_date',
        'status',
        'birth_date',
        'address',
    ];

    /**
     * Parse an uploaded spreadsheet and create student records.
     *
     * @return array{created: int, errors: array<int, string>}
     */
    public function import(UploadedFile $file): array
    {
        $rows = $this->readRows($file);

        if (empty($rows)) {
            return ['created' => 0, 'errors' => ['لا توجد صفوف بيانات في الملف.']];
        }

        $created = 0;
        $errors = [];

        foreach ($rows as $index => $row) {
            $line = $index + 2;

            $studentNo = trim((string) ($row['student_no'] ?? ''));
            $name = trim((string) ($row['name'] ?? ''));

            if ($studentNo === '' || $name === '') {
                $errors[] = "الخانة {$line}: رقم القيد والاسم حقلان إلزاميان.";

                continue;
            }

            if (CmsStudent::where('student_no', $studentNo)->exists()) {
                $errors[] = "الخانة {$line}: رقم القيد {$studentNo} مسجل مسبقاً.";

                continue;
            }

            $level = $this->resolveLevel($row, $errors, $line);

            if (! $level) {
                continue;
            }

            CmsStudent::create([
                'student_no' => $studentNo,
                'name' => $name,
                'email' => $this->nullable($row['email'] ?? null),
                'phone' => $this->nullable($row['phone'] ?? null),
                'level_id' => $level->id,
                'enrollment_date' => $this->parseDate($row['enrollment_date'] ?? null, now()->format('Y-m-d')),
                'status' => $this->normalizeStatus($row['status'] ?? null),
                'gender' => $this->normalizeGender($row['gender'] ?? null),
                'birth_date' => $this->nullableDate($row['birth_date'] ?? null),
                'address' => $this->nullable($row['address'] ?? null),
            ]);

            $created++;
        }

        return ['created' => $created, 'errors' => $errors];
    }

    /**
     * @param  array<string, mixed>  $row
     * @param  array<int, string>  $errors
     */
    private function resolveLevel(array $row, array &$errors, int $line): ?CmsLevel
    {
        $departmentName = trim((string) ($row['department'] ?? ''));
        $year = (int) ($row['year'] ?? 1);
        $section = strtoupper(trim((string) ($row['section'] ?? 'A')));

        if ($departmentName === '') {
            $errors[] = "الخانة {$line}: اسم القسم إلزامي.";

            return null;
        }

        $department = CmsDepartment::where('name', $departmentName)->first();

        if (! $department) {
            $errors[] = "الخانة {$line}: القسم \"{$departmentName}\" غير موجود.";

            return null;
        }

        $level = CmsLevel::where('department_id', $department->id)
            ->where('year', max(1, $year))
            ->where('section', $section)
            ->first();

        if (! $level) {
            $level = CmsLevel::create([
                'department_id' => $department->id,
                'year' => max(1, $year),
                'section' => $section,
                'capacity' => 40,
            ]);
        }

        return $level;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function readRows(UploadedFile $file): array
    {
        $path = $file->getRealPath();

        if (! $path || ! is_file($path)) {
            return [];
        }

        $reader = IOFactory::createReaderForFile($path);
        $reader->setReadDataOnly(true);
        $spreadsheet = $reader->load($path);

        $allRows = $spreadsheet->getActiveSheet()->toArray(null, true, true, false);

        if (count($allRows) < 2) {
            return [];
        }

        $header = array_shift($allRows);
        $columnMap = [];

        foreach ($header as $index => $label) {
            $key = $this->normalizeKey($label);

            if (in_array($key, self::HEADERS, true) && ! isset($columnMap[$key])) {
                $columnMap[$key] = $index;
            }
        }

        if (empty($columnMap)) {
            return [];
        }

        $rows = [];

        foreach ($allRows as $row) {
            $data = [];

            foreach ($columnMap as $key => $index) {
                $data[$key] = $row[$index] ?? null;
            }

            if (count(array_filter($data, fn ($value) => $value !== null && trim((string) $value) !== '')) > 0) {
                $rows[] = $data;
            }
        }

        return $rows;
    }

    private function normalizeKey(mixed $label): string
    {
        return strtolower(preg_replace('/[^A-Za-z0-9]+/', '_', trim((string) $label)) ?? '');
    }

    private function normalizeStatus(mixed $value): string
    {
        $status = strtolower(trim((string) $value));

        return in_array($status, ['active', 'suspended', 'graduated', 'withdrawn'], true) ? $status : 'active';
    }

    private function normalizeGender(mixed $value): ?string
    {
        if ($value === null || trim((string) $value) === '') {
            return null;
        }

        $gender = strtolower(trim((string) $value));

        if (in_array($gender, ['male', 'm', 'ذكر'], true)) {
            return 'male';
        }

        if (in_array($gender, ['female', 'f', 'أنثى'], true)) {
            return 'female';
        }

        return null;
    }

    private function nullable(mixed $value): ?string
    {
        $value = trim((string) ($value ?? ''));

        return $value === '' ? null : $value;
    }

    private function nullableDate(mixed $value): ?string
    {
        $parsed = $this->parseDate($value, null);

        return $parsed;
    }

    private function parseDate(mixed $value, ?string $default): ?string
    {
        if ($value === null || trim((string) $value) === '') {
            return $default;
        }

        if (is_numeric($value)) {
            $value = Date::excelToDateTimeObject((float) $value)->format('Y-m-d');
        }

        $date = strtotime((string) $value);

        if ($date === false) {
            return $default;
        }

        return date('Y-m-d', $date);
    }
}
