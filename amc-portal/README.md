# amc-portal (archived prototype)

> **Status:** Reference only — not part of the production MHCST app.

This folder is a standalone **Next.js** marketing site prototype (Al Rayan / college-style pages). It is **not connected** to the Laravel application at the repo root.

## Production app

Use the main Laravel + Inertia app:

```bash
cd ..
composer install
npm install
php artisan migrate --seed
composer run dev
```

Public site: Laravel routes in `routes/web.php`  
Admin & CMS: `/dashboard`, `/cms`

## This prototype

```bash
pnpm install
pnpm dev
```

Do not deploy this folder alongside Laravel unless you explicitly integrate or replace the public site.

## Decision log

| Option | When |
|--------|------|
| Keep as design reference | Current — UI ideas for future public pages |
| Merge pages into Laravel | When public site needs AMC-style layouts |
| Delete folder | When Laravel public site fully replaces it |

See [../docs/roadmap.md](../docs/roadmap.md).
