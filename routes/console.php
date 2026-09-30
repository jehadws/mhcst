<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ===== Backup schedule (Chunk S7) =====
// Daily at 02:00 local (APP_TIMEZONE). 7-day retention handled by the
// cleanup strategy in config/backup.php. Run cleanup right after backup
// so old snapshots are pruned in the same run.
Schedule::command('backup:clean')->dailyAt('02:00');
Schedule::command('backup:run')
    ->dailyAt('02:05')
    ->onFailure(function () {
        // onFailure hook: mail notification via config handles alerting.
        // Leave this hook for future monitoring integrations.
    });

// Weekly health check every Sunday 03:00 — flags old/missing backups.
Schedule::command('backup:monitor')->weeklyOn(0, '03:00');
