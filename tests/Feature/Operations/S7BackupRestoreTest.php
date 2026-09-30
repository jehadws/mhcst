<?php

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Spatie\Backup\Notifications\Notifications\BackupHasFailedNotification;
use Spatie\Backup\Notifications\Notifications\BackupWasSuccessfulNotification;
use Spatie\Backup\Notifications\Notifications\CleanupWasSuccessfulNotification;
use Spatie\Backup\Notifications\Notifications\HealthyBackupWasFoundNotification;
use Spatie\Backup\Notifications\Notifications\UnhealthyBackupWasFoundNotification;

test('backup artisan commands are registered', function () {
    $commands = array_keys(Artisan::all());

    expect($commands)->toContain('backup:run')
        ->toContain('backup:clean')
        ->toContain('backup:monitor')
        ->toContain('backup:list');
});

test('backup config resolves correctly', function () {
    $disks = config('backup.backup.destination.disks');
    $databases = config('backup.backup.source.databases');

    expect($disks)
        ->toBeArray()
        ->toContain('local');

    expect($databases)
        ->toBeArray()
        ->not->toBeEmpty()
        ->toContain(env('DB_CONNECTION'));
});

test('backup destination disk is writable', function () {
    $disk = config('backup.backup.destination.disks')[0];

    $result = Storage::disk($disk)->put('s7-write-test.txt', 'ok');
    expect($result)->toBeTrue();

    Storage::disk($disk)->delete('s7-write-test.txt');
});

test('.env.example documents BACKUP_FAILURE_EMAIL', function () {
    $envExample = file_get_contents(base_path('.env.example'));

    expect($envExample)->toContain('BACKUP_FAILURE_EMAIL');
});

test('docs/backup-restore.md exists and contains required sections', function () {
    $path = base_path('docs/backup-restore.md');

    expect(file_exists($path))->toBeTrue();

    $contents = file_get_contents($path);

    expect($contents)
        ->toContain('Recovery Time')
        ->toContain('Restore drill');
});

test('config/backup.php does not include .env in backup sources', function () {
    $include = config('backup.backup.source.files.include');

    // .env must never appear in the backup include list
    foreach ($include as $path) {
        expect($path)->not->toContain('.env');
    }
});

test('backup notifications only alert on failure or unhealthy', function () {
    $notifications = config('backup.notifications.notifications');
    $notifiedClasses = array_keys($notifications);

    // These success classes must NOT be configured with any channel
    $successClasses = [
        BackupWasSuccessfulNotification::class,
        HealthyBackupWasFoundNotification::class,
        CleanupWasSuccessfulNotification::class,
    ];

    foreach ($successClasses as $class) {
        if (in_array($class, $notifiedClasses)) {
            expect($notifications[$class])->toBeEmpty();
        }
    }

    // These failure classes must be configured with at least one channel
    $failureClasses = [
        BackupHasFailedNotification::class,
        UnhealthyBackupWasFoundNotification::class,
    ];

    foreach ($failureClasses as $class) {
        expect($notifiedClasses)->toContain($class);
        expect($notifications[$class])->not->toBeEmpty();
    }
});
