# Application Documentation

Bilingual reference guides for **Almaayir Alhaditha College for Science and Technology** (كلية المعايير الحديثة للعلوم والتقنية).

| Document | Language | Description |
|----------|----------|-------------|
| [app-guide.en.md](./app-guide.en.md) | English | Full application guide — modules, roles, routes, features |
| [app-guide.ar.md](./app-guide.ar.md) | العربية | دليل التطبيق الكامل — الوحدات، الأدوار، المسارات، الميزات |
| [roadmap.md](./roadmap.md) | EN | Phased implementation status and architecture notes |
| [../amc-portal/README.md](../amc-portal/README.md) | EN | Archived Next.js prototype (not production) |

## Quick links

- **Roles & permissions** — Section 4 in either app guide
- **Demo accounts** — Section 6
- **CMS (College Management)** — Section 3.3
- **SEO & search engines** — Section 9
- **Security** — Section 10
- **Technical spec (CMS schema)** — [../CMS_Technical_Specification.md](../CMS_Technical_Specification.md)

## Demo accounts (after `php artisan migrate:fresh --seed`)

See [roadmap.md](./roadmap.md) or app guides §6.

## Branding assets

Official logo files live in `public/images/branding/`:

| File | Size (px) | Use on the site |
|------|-----------|-----------------|
| `logo-main.png` | 2048×2048 | Master file — keep for print, PDFs, future edits |
| `logo-header-128.png` | 128×128 | Public header & footer (displayed ~44px) |
| `logo-icon-64.png` | 64×64 | Dashboard sidebar / compact UI |
| `logo-rounded.png` | 2048×2048 | Reference only (black canvas); prefer `logo-main` on the live site |

Generated from the master logo in `public/`:

| File | Size | Use |
|------|------|-----|
| `favicon-16x16.png` | 16×16 | Browser tab (small) |
| `favicon-32x32.png` | 32×32 | Browser tab (standard) |
| `apple-touch-icon.png` | 180×180 | iOS home screen |
| `android-chrome-192x192.png` | 192×192 | Android / PWA |
| `android-chrome-512x512.png` | 512×512 | Android splash / PWA |
| `logo.png` | 256×256 | Generic fallback (ID cards, legacy code) |
| `images/og-logo.png` | 512×512 | Social preview default |

**Which of your two originals?**

- **White background (`logo-main`)** → use everywhere on the website (header, footer, admin, favicons).
- **Black background (`logo-rounded`)** → keep as archive; the black square does not blend on dark or light layouts unless cropped.

**Format rules:** PNG for the current detailed seal; SVG later if you get a vector export (best for infinite scaling). Replace via **Dashboard → Site Settings → Site Logo** (uploads to `storage/`) or swap files in `public/images/branding/`.

**Optional later:** a 1200×630 banner (`og-banner.png`) for richer Facebook/WhatsApp link previews.

## Production checklist

Before going live, set in `.env`:

| Variable | Recommended value |
|----------|-------------------|
| `APP_URL` | Your public domain (e.g. `https://mhcst.ly`) — required for canonical URLs, sitemap, and Open Graph |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `AUTH_REGISTRATION_ENABLED` | `false` — accounts are created by admins only |
