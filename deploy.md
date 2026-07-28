# Deployment Guide — Libyan Spider Shared Hosting (cPanel)

This documents the exact deployment steps for this Laravel + Inertia + React app on Libyan
Spider's Cloud Shared Hosting. Follow this every time — do not deploy from memory.

---

## 0. Prerequisites (one-time setup)

- [ ] SSH/Terminal access enabled on the cPanel account (Security → SSH Access, or request via
      support ticket if not visible)
- [ ] PHP version set via cPanel's "Select PHP Version" (MultiPHP Manager) — match the version
      Laravel requires (check `composer.json` `"php"` constraint)
- [ ] Required PHP extensions enabled via PHP Selector: `mbstring`, `openssl`, `pdo_mysql`,
      `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`
- [ ] MySQL database + user created via cPanel's "MySQL Database Wizard," user granted all
      privileges on the database
- [ ] Domain/subdomain pointed to the account, SSL issued (AutoSSL/Let's Encrypt via cPanel)
- [ ] Cloudflare enabled on the domain (optional but recommended — Libyan Spider supports this)

---

## 1. Local build step (do this before every deploy)

Node is **not** used in production — it's only needed locally/in CI to compile assets.

```bash
composer install --optimize-autoloader --no-dev
npm install
npm run build
```

This produces the compiled assets in `public/build/`. Commit or package these — the server
never runs `npm run build` itself.

---

## 2. Folder layout on the server

Because shared hosting serves from `public_html` and Laravel expects its own `public/` folder
to be the web root, restructure like this:

```
/home/<cpanel-user>/
  app/
  bootstrap/
  config/
  database/
  resources/
  routes/
  storage/
  vendor/
  artisan
  composer.json
  .env
  public_html/          <- this IS Laravel's public/ folder contents, moved here
    index.php            (edited — see step 3)
    build/               (compiled Vite assets)
    .htaccess
```

Everything from Laravel's `public/` folder gets moved into `public_html/`. Everything else
(`app/`, `bootstrap/`, etc.) lives one level above `public_html`, **outside** the web root, so
it's not publicly accessible.

---

## 3. Edit `index.php` after moving it

Inside `public_html/index.php`, update the two path references since `public/` is no longer
one level below the app root:

```php
// Before:
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

// After (now that index.php sits directly in public_html, one level *inside* home dir):
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
```

(The paths often stay the same relative depth — verify by checking where `vendor/` and
`bootstrap/` actually sit relative to `public_html/` in your specific account structure, since
cPanel accounts vary slightly.)

Any asset helper usage in Blade/Inertia root view (`resources/views/app.blade.php`) that
assumed `/public/...` URL prefixes should instead resolve to the domain root directly, since
`public_html` now *is* the root.

---

## 4. Upload

Via SSH + git (preferred) or cPanel File Manager upload + extract:

```bash
cd ~
git clone <your-repo-url> app-src
# then move directories into place per the layout above
```

Or upload a zip of the whole project (excluding `node_modules`) via File Manager, extract, then
move folders into the layout shown in step 2.

---

## 5. Environment file

Create `.env` in the app root (not in `public_html`) with production values:

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.ly

DB_CONNECTION=mysql
DB_HOST=localhost
DB_DATABASE=<cpanel_db_name>
DB_USERNAME=<cpanel_db_user>
DB_PASSWORD=<cpanel_db_password>

QUEUE_CONNECTION=database
MAIL_MAILER=smtp
MAIL_HOST=<libyan spider or business email SMTP host>
MAIL_PORT=587
MAIL_USERNAME=<your business email>
MAIL_PASSWORD=<password>
MAIL_ENCRYPTION=tls
```

`APP_DEBUG=false` is mandatory in production — never expose stack traces publicly.

---

## 6. Install dependencies and prepare the app (via SSH)

```bash
cd ~
composer install --optimize-autoloader --no-dev
php artisan key:generate
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

`--force` is required for migrate in production since Laravel normally prompts for
confirmation. `storage:link` is required for any publicly-served uploaded files (course
images, certificates) to resolve correctly.

---

## 7. Cron job (drives scheduler + queue)

In cPanel → Cron Jobs, add one job running every minute:

```
* * * * * php /home/<cpanel-user>/artisan schedule:run >> /dev/null 2>&1
```

In `app/Console/Kernel.php`, register the queue worker to run via the scheduler (since a
persistent `queue:work` daemon isn't available on shared hosting):

```php
$schedule->command('queue:work --stop-when-empty --max-time=50')
         ->everyMinute()
         ->withoutOverlapping();
```

This processes queued notification emails (new registration, new contact message, etc.)
roughly every minute — acceptable latency for admin/instructor email alerts.

---

## 8. Post-deploy checklist

- [ ] Visit the site — confirm no 500 errors, `APP_DEBUG=false` confirmed (no stack traces)
- [ ] Submit a test contact-us message → confirm it lands in DB and triggers admin email
      within ~1 minute (cron cadence)
- [ ] Register a test student on a test course → confirm instructor + admin notification fires
- [ ] Confirm `storage:link` worked — an uploaded course image loads correctly
- [ ] Confirm SSL is active (padlock, no mixed-content warnings)
- [ ] Confirm `.env` and `vendor/` are NOT web-accessible (try hitting
      `https://yourdomain.ly/.env` — should 404/403)

---

## 9. Every future deploy (repeatable steps)

```bash
# locally
npm run build
git add . && git commit -m "..." && git push

# on server via SSH
cd ~
git pull
composer install --optimize-autoloader --no-dev
php artisan migrate --force
php artisan config:cache route:cache view:cache
php artisan queue:restart   # picks up any new queued job classes
```

Never skip `config:cache`/`route:cache` after a deploy — stale cached config/routes are a
common source of "it works locally but not on the server" bugs.
