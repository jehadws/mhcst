<?php

use App\Models\CmsDepartment;
use App\Models\CmsLevel;
use App\Models\CmsStudent;
use App\Services\CmsStudentImportService;
use Illuminate\Database\QueryException;
use Illuminate\Http\UploadedFile;

beforeEach(function () {
    // Ensure a level exists for the import service to resolve
    $dept = CmsDepartment::create(['name' => 'Import Test Dept']);
    CmsLevel::create(['department_id' => $dept->id, 'year' => 1, 'section' => 'A', 'capacity' => 40]);
});

/**
 * Build a minimal in-memory XLSX byte-stream with a single data row.
 * We use a CSV-shaped temporary file instead of a full XLSX to keep tests
 * free of heavy spreadsheet dependencies; the import service accepts CSV.
 *
 * @param  array<int, array<int, string>>  $rows  Data rows (no header).
 */
function buildCsvImportFile(array $rows): UploadedFile
{
    $tmp = tempnam(sys_get_temp_dir(), 'import_').'.csv';
    $handle = fopen($tmp, 'w');
    // Header
    fputcsv($handle, ['student_no', 'name', 'email', 'phone', 'gender', 'department', 'year', 'section', 'enrollment_date', 'status', 'birth_date', 'address']);
    foreach ($rows as $row) {
        fputcsv($handle, $row);
    }
    fclose($handle);

    return new UploadedFile($tmp, 'students.csv', 'text/csv', null, true);
}

test('import rolls back all rows when one row causes a QueryException', function () {
    // Row 1: valid new student
    // Row 2: same student_no as a soft-deleted student (will trigger constraint)
    $softDeleted = CmsStudent::create([
        'student_no' => 'DUPE-001',
        'name' => 'Old Student',
        'level_id' => CmsLevel::first()->id,
        'enrollment_date' => now()->toDateString(),
        'status' => 'active',
    ]);
    $softDeleted->delete();

    $file = buildCsvImportFile([
        ['NEW-001', 'New Student', 'new@test.com', '', 'male', 'Import Test Dept', '1', 'A', now()->toDateString(), 'active', '', ''],
        // This row has a student_no that matches a soft-deleted record → caught by withTrashed check → accumulates as error
        ['DUPE-001', 'Dup Student', 'dup@test.com', '', 'female', 'Import Test Dept', '1', 'A', now()->toDateString(), 'active', '', ''],
    ]);

    $result = app(CmsStudentImportService::class)->import($file);

    // Row 1 should have been created since the duplicate check only caught DUPE-001
    // But we want to verify no new student_no=DUPE-001 record was inserted
    expect(
        CmsStudent::where('student_no', 'DUPE-001')->exists()
    )->toBeFalse('Soft-deleted student_no should not produce a second active row');

    expect($result['errors'])->not->toBeEmpty('Duplicate student_no should be reported as an error');
});

test('entire import is rolled back when a QueryException is thrown mid-import', function () {
    // Two rows with the same student_no in the same file will pass the pre-validation
    // check (since neither exists in the DB yet), but will trigger a unique constraint
    // QueryException during the DB::transaction insertion of the second duplicate row.
    $file = buildCsvImportFile([
        ['NEW-SAFE', 'Safe Row', 'safe@test.com', '', 'male', 'Import Test Dept', '1', 'A', now()->toDateString(), 'active', '', ''],
        ['CRASH-DUP', 'Crash Row 1', 'crash1@test.com', '', 'male', 'Import Test Dept', '1', 'A', now()->toDateString(), 'active', '', ''],
        ['CRASH-DUP', 'Crash Row 2', 'crash2@test.com', '', 'female', 'Import Test Dept', '1', 'A', now()->toDateString(), 'active', '', ''],
    ]);

    // The service runs inside DB::transaction; on QueryException it rolls back and rethrows
    expect(fn () => app(CmsStudentImportService::class)->import($file))
        ->toThrow(QueryException::class);

    // Row 1 (NEW-SAFE) must also have been rolled back
    expect(CmsStudent::where('student_no', 'NEW-SAFE')->exists())->toBeFalse(
        'Transaction rollback should have undone the first row too'
    );
});
