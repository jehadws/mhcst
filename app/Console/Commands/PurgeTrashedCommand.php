<?php

namespace App\Console\Commands;

use App\Models\Banner;
use App\Models\BlogPost;
use App\Models\CmsAttendance;
use App\Models\CmsDepartment;
use App\Models\CmsEnrollment;
use App\Models\CmsGrade;
use App\Models\CmsGradeRevision;
use App\Models\CmsLevel;
use App\Models\CmsSchedule;
use App\Models\CmsStudent;
use App\Models\CmsSubject;
use App\Models\CmsTeacher;
use Illuminate\Console\Command;

class PurgeTrashedCommand extends Command
{
    protected $signature = 'app:purge-trashed {--days=90} {--dry-run}';

    protected $description = 'Permanently remove soft-deleted rows older than N days across all CMS models.';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $dryRun = (bool) $this->option('dry-run');
        $cutoff = now()->subDays($days);

        if ($days < 1) {
            $this->error('--days must be a positive integer.');

            return self::FAILURE;
        }

        $this->info("Purging soft-deleted rows older than {$days} days (cutoff: {$cutoff->toIso8601String()}).");
        if ($dryRun) {
            $this->warn('--dry-run enabled: no rows will be actually deleted.');
        }

        $models = [
            CmsSchedule::class,
            CmsGradeRevision::class,
            CmsGrade::class,
            CmsAttendance::class,
            CmsEnrollment::class,
            CmsStudent::class,
            CmsTeacher::class,
            CmsLevel::class,
            CmsSubject::class,
            CmsDepartment::class,
            Banner::class,
            BlogPost::class,
        ];

        $totalPurged = 0;

        foreach ($models as $modelClass) {
            $shortName = class_basename($modelClass);

            if (! method_exists($modelClass, 'onlyTrashed')) {
                $this->line("[{$shortName}] Skipping (no SoftDeletes trait).");

                continue;
            }

            $query = $modelClass::onlyTrashed()->where('deleted_at', '<=', $cutoff);

            $count = $query->count();
            if ($count === 0) {
                $this->line("[{$shortName}] 0 rows eligible.");

                continue;
            }

            if ($dryRun) {
                $this->line("[{$shortName}] Would purge {$count} rows.");
                $totalPurged += $count;

                continue;
            }

            $purged = 0;
            $query->chunkById(100, function ($rows) use (&$purged) {
                $rows->each(function ($row) use (&$purged) {
                    $row->forceDelete();
                    $purged++;
                });
            });

            $totalPurged += $purged;
            $this->line("[{$shortName}] Purged {$purged} row(s).");
        }

        if ($dryRun) {
            $this->info("Dry run complete. {$totalPurged} row(s) would be purged.");
        } else {
            $this->info("Purge complete. {$totalPurged} row(s) permanently removed.");
        }

        return self::SUCCESS;
    }
}
