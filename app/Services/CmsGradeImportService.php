<?php

namespace App\Services;

use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use Illuminate\Http\UploadedFile;
use PhpOffice\PhpSpreadsheet\IOFactory;

class CmsGradeImportService
{
    public const HEADERS = [
        'student_no',
        'subject_code',
        'academic_year',
        'semester',
        'midterm',
        'final',
        'assignments',
        'projects',
        'participation',
    ];

    private const GRADE_FIELDS = ['midterm', 'final', 'assignments', 'projects', 'participation'];

    /**
     * Parse an uploaded grade sheet and upsert grade records on matching enrollments.
     *
     * @return array{updated: int, errors: array<int, string>}
     */
    public function import(UploadedFile $file, ?int $enteredBy = null): array
    {
        $rows = $this->readRows($file);

        if (empty($rows)) {
            return ['updated' => 0, 'errors' => ['لا توجد صفوف بيانات في الملف.']];
        }

        $updated = 0;
        $errors = [];

        foreach ($rows as $index => $row) {
            $line = $index + 2;

            $studentNo = trim((string) ($row['student_no'] ?? ''));
            $subjectCode = strtoupper(trim((string) ($row['subject_code'] ?? '')));

            if ($studentNo === '' || $subjectCode === '') {
                $errors[] = "الخانة {$line}: رقم القيد ورمز المادة حقلان إلزاميان.";

                continue;
            }

            if (! $this->hasAnyGrade($row)) {
                $errors[] = "الخانة {$line}: لم يتم إدخال أي درجات لهذا الصف.";

                continue;
            }

            $student = CmsStudent::where('student_no', $studentNo)->first();
            $subject = CmsSubject::where('code', $subjectCode)->first();

            if (! $student) {
                $errors[] = "الخانة {$line}: لا يوجد طالب برقم القيد {$studentNo}.";

                continue;
            }

            if (! $subject) {
                $errors[] = "الخانة {$line}: لا توجد مادة بالرمز {$subjectCode}.";

                continue;
            }

            $enrollment = CmsEnrollment::where('student_id', $student->id)
                ->where('subject_id', $subject->id)
                ->where('academic_year', $this->academicYear($row))
                ->where('semester', $this->semester($row))
                ->first();

            if (! $enrollment) {
                $errors[] = "الخانة {$line}: لا يوجد قيد للطالب {$studentNo} في مادة {$subjectCode} للعام {$this->academicYear($row)} ({$this->semester($row)}).";

                continue;
            }

            $grade = CmsGrade::firstOrNew(['enrollment_id' => $enrollment->id]);

            foreach (self::GRADE_FIELDS as $field) {
                $grade->{$field} = $this->normalizedScore($row[$field] ?? null);
            }

            $grade->entered_by = $enteredBy;
            $grade->entered_at = now();
            $grade->save();

            $updated++;
        }

        return ['updated' => $updated, 'errors' => $errors];
    }

    private function academicYear(array $row): string
    {
        $value = trim((string) ($row['academic_year'] ?? ''));

        return $value !== '' ? $value : $this->currentAcademicYear();
    }

    private function currentAcademicYear(): string
    {
        $year = (int) now()->format('Y');

        if ((int) now()->format('n') >= 9) {
            return $year.'-'.($year + 1);
        }

        return ($year - 1).'-'.$year;
    }

    private function semester(array $row): string
    {
        $semester = strtolower(trim((string) ($row['semester'] ?? 'first')));

        return in_array($semester, ['first', 'second', 'summer'], true) ? $semester : 'first';
    }

    private function hasAnyGrade(array $row): bool
    {
        foreach (self::GRADE_FIELDS as $field) {
            if ($this->normalizedScore($row[$field] ?? null) !== null) {
                return true;
            }
        }

        return false;
    }

    private function normalizedScore(mixed $value): ?float
    {
        if ($value === null || trim((string) $value) === '' || ! is_numeric($value)) {
            return null;
        }

        $score = (float) $value;

        return max(0, min(100, $score));
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
            $key = strtolower(preg_replace('/[^A-Za-z0-9]+/', '_', trim((string) $label)) ?? '');

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
}
