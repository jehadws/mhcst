# Backup and Restore Procedure

- **Owner:** Ops / Application administrator
- **Schedule:** Daily at 02:05 (server time, `APP_TIMEZONE`)
- **Retention:** 7 daily backups; older backups are cleaned up on each run
- **Storage:** Local disk (`storage/app/[APP_NAME]/`) by default; production
  SHOULD add S3-compatible off-site storage via `AWS_*` env vars and
  enable the `'s3'` disk in `config/backup.php`

## Recovery Time Objective (RTO)

Target RTO: ≤ 60 minutes from incident declaration to restored +
smoke-tested application. The main time cost is restoring the largest
uploads directory; DB restore alone is ≤ 5 minutes for the expected
dataset size.

## Recovery Point Objective (RPO)

Target RPO: ≤ 26 hours (from yesterday's 02:05 backup until today at
04:05, when a fresh backup exists). Worst-case gap: 26 hours if an
incident happens immediately before a backup run.

## Backup contents

1. **Database dump** — MySQL/SQLite/PostgreSQL via spatie.
2. **User uploads** — `storage/app/public/` (banner images, blog covers,
   videos, course assets).

**NOT included** (by design):

- `.env` file (contains DB password, APP_KEY, mail credentials — restore
  from password manager / CI secrets vault)
- Vendor/Node directories (reinstall via composer/npm)
- Laravel cache/log/framework files (rebuilt on first request)

## Running a backup manually

```bash
# On the application server
php artisan backup:run --only-db          # just the DB (fast)
php artisan backup:run --only-files       # just uploads
php artisan backup:run                    # full backup (DB + files)

# List backups
php artisan backup:list

# Health check
php artisan backup:monitor -v
```

## Restore drill — step by step

> Perform quarterly in staging, or after any major schema/data change in production.

### Prerequisites

1. The `APP_KEY` in `.env` of the restore target matches the backed-up
   environment (decrypts session/signed data). If rotating `APP_KEY`,
   coordinate with ops before restore.
2. Same Laravel version + `composer install` + `npm run build` applied
   (backup stores data only, not code).
3. All required disks are writable (`storage/app/public` for uploads).

### A. Database restore (SQLite example, MySQL/PostgreSQL analogous)

```bash
# 1. Stop the scheduler + queue workers so nothing writes during restore
php artisan down
# (Also kill any cron:backup runners to avoid backup/restore interleaving.)

# 2. Pick a backup archive — find the name with backup:list
php artisan backup:list
# Example: mhcst/2026-09-28-020501.zip

# 3. Extract locally
cd /tmp
unzip /path/to/laravel/storage/app/mhcst/2026-09-28-020501.zip -d mhcst-restore/
ls mhcst-restore/
#   db-dumps/mhcst.sqlite
#   storage/app/public/... (uploads directory tree)

# 4. Restore DB
#    SQLite: copy the dump file over the current sqlite DB
cp mhcst-restore/db-dumps/mhcst.sqlite /path/to/laravel/database/database.sqlite
#
#    MySQL / MariaDB:
# gunzip -c mhcst-restore/db-dumps/mhcstedu_app.sql.gz \
#   | mysql -u mhcstedu_user -p mhcstedu_app

# 5. Restore uploads (destructive: mirrors the backed-up tree)
rsync -av --delete mhcst-restore/storage/app/public/ \
        /path/to/laravel/storage/app/public/

# 6. Rebuild caches + indexes
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

# 7. Smoke test
php artisan test --compact     # on staging only; prod: skip — use browser checks

# 8. Bring the app back up
php artisan up
```

### B. Verify the restore (post-restore checklist)

- [ ] `/login` page loads, seeded accounts can log in
- [ ] `cms/students` shows roughly the expected student count
- [ ] `cms/grades` — open a subject with known grades; values visible
- [ ] Banner image & blog post covers render on `/` homepage
- [ ] Download a PDF transcript for a known student — PDF renders
- [ ] `cms/audit-logs` shows the latest entries (restore captured audit trail)

### C. Document the drill result

Append to the bottom of this file using the template below.

## Scheduler enablement notes

### Linux cron

```cron
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

### Windows Task Scheduler

Run `php.exe /path/to/artisan schedule:run` every minute; see Laravel
docs for exact XML task template. Shared hosting without cron: use an
external health-check service that pings `/deploy/run?token=…` each
minute with a custom deploy-hook script that also runs `schedule:run`.

## Security notes on backup storage

1. Backups stored **locally only** protect against accidental deletion,
   not against full-server loss or ransomware. Production MUST enable
   the `s3` disk with a separate account + region.
2. Rotate the S3 access keys after any off-boarding of an admin who had
   access to backup buckets.
3. The backup archive itself is NOT encrypted at-rest by spatie. If
   storing on a third-party disk, enable server-side encryption via the
   S3 bucket policy (or equivalent).
4. NEVER commit a backup zip to git, and NEVER download a backup over
   HTTP without TLS (use the provider console or a signed S3 URL).

---

<!-- Restore drill results are appended below this line -->
