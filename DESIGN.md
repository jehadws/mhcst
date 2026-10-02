# MHCST Design System

Source of truth for all visual tokens. Tokens in this file are the single
reference — `resources/css/app.css` implements them as CSS variables via
Tailwind v4's `@theme` block. Never override tokens in components.

---

## 1. Typography

### Font Stacks

Self-hosted in `public/fonts/` with unicode-range Arabic/Latin splitting.
Versioned filenames (`-v1`) for immutable 1-year cache headers.

| Role       | Font      | Weights available | Fallback | Usage |
|------------|-----------|-------------------|----------|-------|
| `--font-sans`    | Tajawal   | 400, 500, 700, 800 | Cairo, system-ui, sans-serif | Body copy, UI labels, navigation, CMS tables |
| `--font-display` | Tajawal   | 700, 800          | Cairo, Georgia, serif        | Headings (h1–h4), hero titles, section titles, stat numbers |
| `--font-serif`   | Tajawal   | 700               | Cairo, Georgia, serif        | **Backward-compat alias** — maps to Tajawal so existing `font-serif` usage stays visually identical. Prefer `font-display` going forward. |

### Weight Tokens

Tajawal ships 4 weights. No other weights are authorized.

| Name            | CSS value | Use |
|-----------------|-----------|-----|
| `--font-weight-regular`  | 400 | Body copy, helper text, muted labels |
| `--font-weight-medium`   | 500 | Emphasized body, form labels, badge text, table headers |
| `--font-weight-bold`     | 700 | h3–h6, card titles, CTAs, brand name |
| `--font-weight-extrabold`| 800 | h1, h2, hero, stat numbers |

### Type Scale (Modular — ratio 1.25, base 16px)

Never use an ad-hoc `text-<size>` that is not in this scale. If a size
between steps is needed, pick the next smaller step.

| Token         | `text-*` class | Size (px) | Rem    | Default line-height | Use |
|---------------|----------------|-----------|--------|---------------------|-----|
| `--font-size-xs`   | `text-xs`     | 12        | 0.75rem | `--leading-tight`   | Captions, badge content, fine print, pagination meta |
| `--font-size-sm`   | `text-sm`     | 14        | 0.875rem | `--leading-normal`  | Helper text, form labels, CMS table cells, muted copy |
| `--font-size-base` | `text-base`   | 16        | 1rem    | `--leading-normal`  | Body copy (canonical size) |
| `--font-size-lg`   | `text-lg`     | 18        | 1.125rem | `--leading-normal` | Lead paragraphs, hero subtitle, feature descriptions |
| `--font-size-xl`   | `text-xl`     | 20        | 1.25rem | `--leading-snug`   | Card subtitles, KPI labels, meta info |
| `--font-size-2xl`  | `text-2xl`    | 24        | 1.5rem  | `--leading-snug`   | Card titles, dialog titles |
| `--font-size-3xl`  | `text-3xl`    | 30        | 1.875rem | `--leading-snug`  | Page subsection titles (h3) |
| `--font-size-4xl`  | `text-4xl`    | 36        | 2.25rem | `--leading-snug`   | Section titles (h2) — Features, Testimonials, Why Us |
| `--font-size-5xl`  | `text-5xl`    | 48        | 3rem    | `--leading-tight`  | Marketing page titles (h1) on mobile, page titles |
| `--font-size-6xl`  | `text-6xl`    | 60        | 3.75rem | `--leading-tight`  | Hero headline (h1) on `sm+` only — never on CMS/dashboard |

### Line Heights

| Name              | Value  | Use |
|-------------------|--------|-----|
| `--leading-tight`  | 1.15   | Hero, h1, h2, display numbers — avoid descender overlap |
| `--leading-snug`   | 1.25   | h3, h4, card titles, stat numbers |
| `--leading-normal` | 1.5    | All body copy (16–18px) — minimum 4.5:1 contrast target |
| `--leading-relaxed`| 1.7    | Long-form: blog posts, about page, legal text, FAQ answers |

**DO NOT (default drift observed in homescreen restyle, 2026-09-30):**
- ❌ Never set an inline arbitrary `leading-[1.15]` or `leading-[1.xx]`. Use the token classes `leading-tight` / `leading-snug` / `leading-normal` / `leading-relaxed` exclusively.
- ❌ Never use `leading-relaxed` on short component body copy (card descriptions, bullets, feature lines, steps descriptions, stats, hero subtitles). `leading-relaxed` is reserved for long-form prose only (≥3 sentences). Short component copy defaults to `leading-normal` for body and `leading-snug`/`leading-tight` for headings.
- ❌ Never use `leading-7` or any raw `leading-<num>` class.

### When to apply `font-display` (Deliberate rule, 2026-09-30)

`font-display` MUST be added to — and only to — the following semantic roles. It is
NOT a synonym for "bold Tajawal"; it pairs `font-weight-extrabold` with display
optical sizing for consistent Arabic/Latin display glyphs.

| Role | Must have `font-display`? | Required line-height |
|------|---------------------------|----------------------|
| `<h1>` hero / marketing page title | ✅ YES | `leading-tight` |
| `<h2>` section titles (Features, Why-Us, Testimonials, etc.) | ✅ YES | `leading-snug` |
| `<h3>` card titles, dept names, step titles, scholarship titles, accreditation body labels, blog/news card titles, testimonial author names | ✅ YES | `leading-snug` |
| Stat numbers (KPI values, counts, years, founded-year, +N instructor badges) | ✅ YES | `leading-tight` + `tabular-nums` |
| Badge chip text, eyebrow labels, body copy paragraphs, helper text, links | ❌ NO (keep `font-sans` default) | `leading-normal` |
| Brand name in header/footer logo block | ✅ OPTIONAL → YES (reinforces brand display) | `leading-snug` |
| Bullet text, form labels, table cells, menu items | ❌ NO | `leading-normal` |

**Deliberate mapping of drift-observed heading classes:**
- Replaced default `font-serif text-3xl font-bold` → deliberate `font-display text-3xl font-extrabold leading-snug`. Rationale: `font-serif` was a backward-compat alias to Tajawal, not a true serif, so keeping it on headings was semantically misleading and optically underweighted.

### When to apply `tabular-nums` (Deliberate rule, 2026-09-30)

Default drift observed: numbers on the homescreen were using proportional numerals,
causing visual misalignment between stat cards and jumping digit widths.

| Role | Must have `tabular-nums`? |
|------|---------------------------|
| KPI / dashboard stat values (counts, percentages, currency) | ✅ YES |
| Section index badges (1. / 2. / 3. step numbers shown as big display glyphs in the corner) | ✅ YES |
| Year / founded display glyph, `+N` instructor count badges | ✅ YES |
| Stats-bar numbers (students count, teachers count, departments count) | ✅ YES |
| Date-only numerals (blog/news `formatNewsDate` output, form labels) | ❌ NO |

### Tracking / letter-spacing

| Token | Class | Use |
|-------|-------|-----|
| `--tracking-widest` | `tracking-widest` | Eyebrow / section-label uppercase microcopy (only 4dp-scale values are allowed) |

**DO NOT:**
- ❌ Never use an inline arbitrary `tracking-[0.2em]`. Use `tracking-widest` instead. Eyebrow tracking was drifting to 0.2em in the default SectionHeader; `tracking-widest` is the 0.2em token in Tailwind v4 and matches the intended design.

### Reading measure

Long-form paragraphs are capped at `--measure-prose = 65ch` max-width.
CMS tables and dashboard data use the container width but should
never be edge-to-edge on ≥1024px without horizontal padding.

---

## 2. Color

All tokens are OKLCH. Hex values are only a reference.

### 2.1 Brand

| Role | Light (OKLCH) | Dark (OKLCH) | Hex (approx light) | Use |
|------|---------------|--------------|--------------------|-----|
| `--primary`               | `oklch(0.30 0.10 262)` | `oklch(0.78 0.07 262)` | `#4F46E5` | Buttons, links, active states, brand surfaces |
| `--primary-foreground`    | `oklch(0.985 0.005 240)` | `oklch(0.18 0.04 262)` | `#FAFBFC` | Text and icons on `--primary` fills |
| `--accent`                | `oklch(0.72 0.10 78)`  | `oklch(0.76 0.11 78)` | `#F59E0B` | CTAs, hero highlights, stat accent, ring/focus in dark mode, KPI icon tints |
| `--accent-foreground`     | `oklch(0.22 0.05 260)` | `oklch(0.18 0.04 262)` | `#1E1B4B` | Text and icons on `--accent` fills |

### 2.2 Surfaces

Three tiers. Background → Card is the minimum visual jump; Popover sits above Card for overlays.

| Role | Light | Dark | Use |
|------|-------|------|-----|
| `--background`      | `oklch(0.985 0.005 240)` | `oklch(0.17 0.035 262)` | Page body |
| `--foreground`      | `oklch(0.20 0.055 260)` | `oklch(0.94 0.008 240)` | Default body text |
| `--card`            | `oklch(1.0 0 0)`        | `oklch(0.21 0.040 262)` | Containers for grouped content |
| `--card-foreground` | same as `--foreground`  | same as `--foreground`  | Text inside cards |
| `--popover`         | same as `--card`        | same as `--card`        | Dropdowns, menu panels, command palette, tooltips |
| `--popover-foreground` | same as `--foreground` | same as `--foreground` | Text inside popovers |

### 2.3 Supporting Surfaces

| Role | Light | Dark | Use |
|------|-------|------|-----|
| `--secondary`            | `oklch(0.95 0.010 250)` | `oklch(0.22 0.038 262)` | Soft section bands, feature grid backgrounds |
| `--secondary-foreground` | `--primary`             | same as `--foreground`  | Text on `--secondary` |
| `--muted`                | same as `--secondary`   | `oklch(0.25 0.035 262)` | Disabled fills, table stripes, skeleton |
| `--muted-foreground`     | `oklch(0.50 0.040 260)` | `oklch(0.65 0.030 260)` | Helper text, timestamps, secondary labels, disabled text |

### 2.4 Borders & Interactions

Three border tiers — never use a border that is not one of these three.

| Role | Light | Dark | Use |
|------|-------|------|-----|
| `--border`         | `oklch(0.90 0.012 255)` | `oklch(0.30 0.040 262)` | Default: card outlines, table dividers, input borders |
| `--input`          | same as `--border`      | same as `--border`      | Input and form control edges only |
| `--ring`           | `--primary`             | `--accent`              | Focus ring (keyboard-nav), selected outline, drag highlights |

### 2.5 Brand Bands (hero, footer, full-width navy stripes)

Dedicated hero-surface tokens because the marketing site uses a
deep-navy band system that differs from both light and dark card surfaces.

| Role | Light | Dark | Use |
|------|-------|------|-----|
| `--hero`               | `oklch(0.30 0.10 262)` | `oklch(0.24 0.085 262)` | Site header, hero, footer, stats bar, CTA banner |
| `--hero-foreground`    | `oklch(0.985 0.005 240)` | `oklch(0.95 0.010 240)` | Copy inside hero band |
| `--hero-muted`         | `oklch(0.75 0.030 260)` | `oklch(0.65 0.030 260)` | Secondary labels, stat subtitles inside hero |
| `--hero-accent`        | `--accent`             | `--accent`              | Accent chips, CTAs on hero |
| `--hero-accent-foreground` | `--accent-foreground` | `--accent-foreground` | Text on hero accents |

### 2.6 Sidebar (app layout)

| Role | Light | Dark |
|------|-------|------|
| `--sidebar-background` | same as `--background` | `oklch(0.15 0.035 262)` |
| `--sidebar-foreground` | same as `--foreground` | `oklch(0.88 0.010 240)` |
| `--sidebar-primary`    | `--primary`            | `--accent` |
| `--sidebar-primary-foreground` | `--primary-foreground` | `--accent-foreground` |
| `--sidebar-accent`     | `--secondary`          | `oklch(0.24 0.040 262)` |
| `--sidebar-accent-foreground` | `--primary`      | same as `--foreground` |
| `--sidebar-border`     | `--border`             | `--border` |
| `--sidebar-ring`       | `--ring`               | `--ring` |

### 2.7 Status / Semantic (charts, badges, alerts)

Always paired with their matching `on-*` foreground.

| Role | Light | Dark | Use |
|------|-------|------|-----|
| `--success`        | `oklch(0.62 0.19 145)` | `oklch(0.68 0.16 145)` | Attendance, active enrollments, "success" alert, grade-green data series |
| `--success-foreground` | `oklch(0.98 0.005 240)` | `oklch(0.10 0.030 260)` | Text/icon on `--success` |
| `--warning`        | `oklch(0.72 0.15 85)` | `oklch(0.75 0.14 82)` | Suspended status, pending items, warning alert, grade-amber series |
| `--warning-foreground` | `oklch(0.15 0.040 60)` | `oklch(0.15 0.040 60)` | Text/icon on `--warning` |
| `--info`           | `oklch(0.68 0.15 235)` | `oklch(0.72 0.13 235)` | Info alert, "info" badges, sky data series |
| `--info-foreground`| `oklch(0.98 0.005 240)` | `oklch(0.18 0.040 262)` | Text/icon on `--info` |
| `--destructive`          | `oklch(0.577 0.245 27.3)` | `oklch(0.62 0.22 25)` | Delete actions, failed grades, danger alerts, error text |
| `--destructive-foreground` | `oklch(0.985 0.005 240)` | `oklch(0.98 0.010 240)` | Text/icon on `--destructive` |

### 2.8 Chart Palette (Recharts / data-viz)

All values computed from semantic status tokens + brand colors.
Use this 5-color cycle. No ad-hoc hexes in components.

```
1. var(--color-primary)   — students / primary metric
2. var(--color-success)   — attendance / green series
3. var(--color-warning)   — pending / amber series
4. var(--color-info)      — secondary / sky series
5. var(--color-accent)    — highlight / teacher-led series
```

### 2.9 Status Token Mapping Table (Deliberate, 2026-09-30)

Default drift observed: homescreen KPI deltas, about bullets, partnership tiles,
news-card titles, steps cards, and dashboard charts were using raw Tailwind
`text-emerald-600 dark:text-emerald-400` / `text-red-*` / `text-primary` for
foreground labels when a semantic token existed.

| Default (anti-pattern, DO NOT) | Deliberate replacement | Use |
|--------------------------------|------------------------|-----|
| `text-emerald-600 dark:text-emerald-400` | `text-success` | KPI up-delta, active green badges, attendance-ok pills |
| `text-red-600 dark:text-red-400` | `text-destructive` | KPI down-delta, failed-grade, danger alerts |
| `bg-emerald-500 shadow-emerald-500/30` (WhatsApp green) | `bg-[oklch(0.68_0.20_145)]` only when brand-preserving inline OKLCH | **Only for WhatsApp brand-colored FABs — WhatsApp green is a *brand identity color*, not our product success green, so `--success` (greener, lighter) must NOT be reused for WhatsApp to avoid brand collision. Keep the brand identity inline only when you explicitly needed |
| `text-primary` on body-copy bullet text (partnership/about tiles, accreditation labels) OR on body text labels | `text-foreground` | Body-text foreground text for partnership/accreditation/body tiles; `text-primary` only for links + headings where primary emphasis is intended |
| `text-secondary` used for a "washed-out large display numeral" (ApplicationSteps step number 1./2./3.) | `text-primary/20` | Large decorative display numerals; `--secondary` is a surface, not a text color, and was being abused as a faint-gray text class |

### 2.10 Contrast Targets

- Normal body text (14–16px): **≥ 4.5:1** against its surface.
- Large text (≥ 18px bold / ≥ 24px regular): **≥ 3:1** against its surface.
- Non-text UI (borders, icons that carry meaning): **≥ 3:1** against their background.
- Decorative only (dividers, decorative icons): no minimum, but must be visible in both themes.

### 2.11 Forbidden raw Tailwind color-name classes (Deliberate rule, 2026-09-30)

Every class below was found on the homescreen before restyle. The rule is blanket:
**No component may reference a Tailwind color-name** unless the only place it appears is
inside `@theme` primitive-then-semantic registration.

Forbidden (never use inside components):
- ❌ `slate-*`, `zinc-*`, `stone-*`, `neutral-*`, `gray-*`
- ❌ `indigo-*`, `violet-*`, `purple-*`
- ❌ `emerald-*`, `green-*`, `teal-*`, `cyan-*`
- ❌ `rose-*`, `red-*`, `pink-*`
- ❌ `amber-*`, `yellow-*`, `orange-*`
- ❌ `sky-*`, `blue-*`

Permitted ONLY via semantic aliases (from §2.1–§2.7):
- ✅ `primary`, `primary-foreground`
- ✅ `accent`, `accent-foreground`
- ✅ `background`, `foreground`
- ✅ `card`, `card-foreground`, `popover`, `popover-foreground`
- ✅ `secondary`, `secondary-foreground`, `muted`, `muted-foreground`
- ✅ `border`, `input`, `ring`
- ✅ `success`, `success-foreground`, `warning`, `warning-foreground`, `info`, `info-foreground`, `destructive`, `destructive-foreground`
- ✅ `hero`, `hero-foreground`, `hero-muted`, `hero-accent`, `hero-accent-foreground`
- ✅ `sidebar-*` tokens from §2.6

Exception for brand-preservation (use sparingly, and document why):
- A third-party brand color (WhatsApp green, Facebook blue, X/Twitter black) may be written as an inline `bg-[oklch(...)]` ONLY when you must match the brand's canonical hue and using a semantic token would mislead (e.g. our `--success` is a slightly-different green than WhatsApp brand green; if we used `--success` on the WhatsApp button it would visually "read as MHCST success" not "read as WhatsApp chat"). Write a code comment beside every such inline OKLCH explaining the brand-preservation reason.

### 2.12 Photo overlay opacity (Deliberate rule, 2026-09-30)

One knob governs **every** alpha painted over photography on the marketing
site. Defined in `resources/css/app.css` `:root`:

```css
--photo-overlay: 0.25; /* range 0–1, design cap 0.30 */
```

| Utility class | What it does | Used by |
|---------------|--------------|---------|
| `.photo-scrim` | Flat `--hero`-colored scrim over a photo | available for full-bleed photo washes (none on the site today) |
| `.photo-gradient` | Bottom-weighted `--hero` gradient (100% / 80% / 55% of the knob) | Hero slides, DepartmentsShowcase cards |
| `.photo-veil` | Element `opacity` for a photo used as a faint texture | About panel, CtaBanner, PageHero |

Rules:
- ❌ Never hardcode an overlay alpha over a photo (`bg-hero/70`, `opacity-15`,
  `bg-black/40` scrims). Components reference one of the three classes only.
- ✅ Tune globally by editing `--photo-overlay`; keep it ≤ `0.30`.
- Not covered by the knob (UI chrome, not photo washes): badge chips such as
  the news-card play button, glass nav surfaces, and dialog backdrops.

---

## 3. Spacing (8dp Base Rhythm)

Base unit: 4px (0.25rem). Every padding, gap, and margin is a multiple
of the base unit.

**Deliberate rule change 2026-09-30:** `py-28` is NOT arbitrary — it is the
explicit `section-lg` tier (see §3.2) and was deliberately chosen during the
homescreen restyle. `gap-1.5` is also NOT arbitrary (6px = 1.5 × 4dp) — it is
the explicit icon-button-CTA gap (see §3.4 Micro spacing scale).

Default drift that was corrected:
- ❌ `py-24` on a section was the number-one drift pattern on 11 of 14 home
  sections before restyle. `py-24` = 96px is a "tweener" value that sits
  exactly between `section-md = py-20 = 80px` and `section-lg = py-28 = 112px`.
  It has no semantic tier and is forbidden. Pick one of the five tiers.
- ❌ Dashboard admin home was `p-4` (too small for a page shell on `lg+`).
  Deliberate: page shell outer padding for the admin dashboard home view is
  `p-6` matching the section-md horizontal-gutter lower bound, which also
  aligns the dashboard page padding with the marketing content pages' `sm:px-6`.

### 3.1 Component Scale

Map 1→4px, 2→8px, ..., 12→48px. Standard Tailwind naming is kept.

| Step | Class | px  | rem    | Use |
|------|-------|-----|--------|-----|
| 0  | `p-0` / `gap-0`   | 0   | 0       | Collapsed, flush |
| 1  | `p-1` / `gap-1`   | 4   | 0.25rem | Icon internal padding, tight inline elements |
| 2  | `p-2` / `gap-2`   | 8   | 0.5rem  | Minimum gap between *adjacent touch targets* (ui-ux-pro-max rule) |
| 3  | `p-3` / `gap-3`   | 12  | 0.75rem | Button-group spacing, small card gaps |
| 4  | `p-4` / `gap-4`   | 16  | 1rem    | Standard content padding, form label→field |
| 5  | `p-5` / `gap-5`   | 20  | 1.25rem | KPI-card inner padding |
| 6  | `p-6` / `gap-6`   | 24  | 1.5rem  | Card body padding, page section inner padding |
| 8  | `p-8` / `gap-8`   | 32  | 2rem    | Large cards, CMS page outer padding |
| 10 | `p-10` / `gap-10` | 40  | 2.5rem  | Stats bar inner padding |
| 12 | `p-12` / `gap-12` | 48  | 3rem    | Between related section groups inside a single page section |
| 16 | `p-16` / `gap-16` | 64  | 4rem    | Footer inner vertical padding |
| 20 | `p-20` / `gap-20` | 80  | 5rem    | Standard marketing section (vertical) |
| 28 | `p-28` / `gap-28` | 112 | 7rem    | Primary marketing features/testimonials section (vertical) |

### 3.2 Section Vertical Padding Tiers (marketing pages)

Use semantic tier names in components — never hardcode a random `py-*`.
Deliberately chosen during homescreen restyle 2026-09-30 based on visual
density: section sections with heavy imagery + text get the larger tiers;
compact utility sections get the smaller tiers.

| Tier    | Class alias | Value | Use (Deliberate mappings from homescreen restyle) |
|---------|-------------|-------|--------------------------------------------------|
| `section-xs` | `py-10` | 40px  | Stats bar, compact meta strips, divider sections |
| `section-sm` | `py-16` → **UPDATED 2026-09-30 → `py-20`** | 64 → 80px  | Footer, secondary CTA strips, FAQ — footer was cramped at 64px, bumped to 80px section-md-lower. |
| `section-md` | `py-20` | 80px  | Standard feature sections, contact, departments showcase, footer, blog/news section |
| `section-lg` | `py-28` | 112px | Primary sections: Departments Showcase, Application Steps, Scholarships, About, Accreditation, Partnerships, Features Grid, Testimonials, Why Us, Blog Posts section, Hero bands — all major content sections |
| `section-xl` | `py-32` | 128px | Hero page-bottom spacing, premium showcase only — *not* default for marketing sections |
| `section-content` | `py-10 sm:py-14 lg:py-[70px]` | 40→56→70px | **Added 2026-10-02.** Content sections that carry tall interactive media panels (accordion grids, carousels, ledgers) on the post-reduction home page: About, Departments Showcase, Application Steps, Accreditation. The three-step ramp keeps mobile compact while landing at 70px on desktop — deliberately between `section-sm` (80) minus footer breathing and `section-lg` (112) which the slimmer post-2026-10 home no longer needs everywhere. Sections using this tier MUST alternate their band (see §11.1) since 70px is tighter than the old 112px rhythm. |

**Default drift corrected (2026-09-30):**

| Component (before) | Default drift | Deliberate tier |
|--------------------|---------------|-----------------|
| Hero (section below) | various `py-24` | `section-lg py-28` (if it's a major section) or `py-20` if it's a stats strip |
| Departments Showcase, Application Steps, Scholarships, About, Accreditation, Partnerships, BlogPostsSection, WhyUs, Testimonials | ALL were `py-24` | `section-lg py-28` (they all carry imagery + headline + copy) |
| Footer | `py-16` | bumped to `section-md py-20` (64→80px) because with 3–4 columns the bottom column-1 content was visually cramped against the hero-brand band background |
| CtaBanner (bottom section) | `pb-24` | bumped to `pb-28` to match the lower bound of section-lg for the closing CTA visual breather |

### 3.3 Container Horizontal Gutters

Single consistent triple. No deviations.

| Breakpoint | Padding | Use |
|------------|---------|-----|
| `xs–base` | `px-4`  (16px) | Mobile |
| `sm–md`   | `sm:px-6` (24px) | Tablets / small laptops |
| `lg+`     | `lg:px-8` (32px) | Desktop, ≥1024px |

All content containers share `max-w-7xl`.

### 3.4 Micro spacing scale (Deliberate, 2026-09-30)

Default drift: homescreen CTAs with inline icons used `gap-1` (4px) — too tight
for the 20×20px icons beside 14px text when font-display Arabic glyphs render
wider. Icon-with-label micro-gaps use the rules below:

| Token | Class | Value (px / rem) | Use |
|-------|-------|------------------|-----|
| micro-icon-text | `gap-1.5` | 6px / 0.375rem | **Default for any `<Link>/<button>` that has an inline icon + text label.** Read-more links, CTAs, view-all, CTA banner link |
| micro-tight | `gap-1` | 4px / 0.25rem | Icon-only adjacent buttons (carousel prev/next), chip-with-close only |
| micro-loose | `gap-2` | 8px / 0.5rem | Primary large hero CTA, admin dashboard primary CTA |

**DO NOT (default drift corrected):**
- ❌ Never use `gap-1` for label+icon inline CTAs. The Arabic display descenders
  and 20px icon need at least 6px visual separation for Arabic to look uncrowded.

---

## 4. Radius Scale (4 tiers + full)

Every rounding is one of five values. No ad-hoc `rounded-*` classes.

| Tier     | Token / class | Value (px / rem) | Use |
|----------|---------------|------------------|-----|
| `radius-sm` | `rounded-sm`  | 6 / 0.375rem | Checkboxes, toggles, small badges, tag chips, table cell corners |
| `radius-md` | `rounded-md`  | 10 / 0.625rem | **Shadcn default Card**, inputs, selects, dialog footers, standard tooltips — this is `--radius` |
| `radius-lg` | `rounded-lg`  | 16 / 1rem      | Buttons, CMS wrappers, import-export panels, **large cards**, dialog panels, popovers, data-table wrappers, sidebar inner cards, stats-bar wrapper, scholarship card wrapper |
| `radius-xl` | `rounded-xl`  | 24 / 1.5rem    | Marketing cards: Department showcase image cards, **Testimonials**, Application Steps cards, Accreditation tiles, About image-hero, Why-Us image, Partnerships tiles, **News/Featured news cards**, feature tiles rounded corners, full-screen modals, hero CTA banner container, floating-buttons |
| `radius-full`| `rounded-full`| 9999 / n/a    | Pills, avatars, chip-style badges, icon buttons, scroll indicator dots, carousel nav buttons, badge chips |

Shadcn derivation rule:
- `--radius` = `radius-md` (10px)
- `--radius-sm` = `--radius` − 4px
- `--radius-lg` = `--radius` + 6px
- `--radius-xl` = `--radius` + 14px (marketing card tier)

### Deliberate button rounding (2026-09-30)

Default drift on the homescreen: primary/marketing CTAs and scholarships view-all
CTA were using `rounded-md` (10px). Buttons are the single-most-clicked affordance;
at 14/16px button body text with icon, 10px rounding optically reads as "tight form
control" not "inviting CTA button" on a marketing page. Deliberate mapping:

| Button role | Default (before) | Deliberate (after, required) | Rationale |
|-------------|------------------|------------------------------|-----------|
| Primary marketing CTA (hero, CTA banner, app-steps cta) | `rounded-md` | `rounded-lg` | 16px rounding pairs with rounded-xl card corners; maintains the shadcn input-vs-button visual distinction |
| Scholarships view-all / secondary marketing CTA | `rounded-md` | `rounded-lg` | Same as above |
| Form submit buttons / CMS primary actions | `rounded-md` | keep `rounded-md` | Inside data-dense views we keep the tighter 10px to match input field rounding of `--radius` |

### Forbidden rounding classes (default drift corrected)

- ❌ **`rounded-3xl`** (36px): found on CtaBanner, About hero-image, FeaturedNewsCard. Rationale: `rounded-2xl` (24px) is our XL tier and `rounded-3xl` creates a "pill-on-steroids" corner radius that visually conflicts with the 24px rounded-xl hero/nav/brand band corners. After restyle: all three surfaces use `rounded-2xl` instead.
- ❌ Any ad-hoc `rounded-[Npx]` or a tier not listed in the 4+1 table above.

### Deliberate card rounding mappings from homescreen restyle

| Component (before) | Default drift | Deliberate radius |
|--------------------|---------------|-------------------|
| CtaBanner wrapper | `rounded-3xl` | `rounded-2xl` |
| About image-hero container | `rounded-3xl` | `rounded-2xl` |
| FeaturedNewsCard grid article wrapper | `rounded-3xl` | `rounded-2xl` |
| Scholarship scroll-card | `rounded-2xl` | *kept but aligned to XL tier* |
| StatsBar wrapper | `rounded-2xl` | `rounded-xl` (tier-shifted down) | Stats bar is a thin 40px tall compact meta strip; 24px XL corners were too pill-like; 16px LG tier reads cleaner |
| Department showcase image cards | `rounded-2xl` | *kept* (24px, correct tier for image cards) |
| Application steps cards, Accreditation tiles, Testimonial cards, News cards, Features grid tiles, Partnership tiles | varying `rounded-2xl` / `rounded-xl` | `rounded-2xl` for imagery-carrying cards; `rounded-xl` for small compact partnership/accred tiles |

---

## 5. Elevation / Shadows

Six tiers. Every shadow is one of these. In dark mode, all shadows use
a navy-tinted black (`oklch(0.10 0.04 262)`) to match the dark navy surface
instead of pure black.

| Tier  | Token / class    | Light composition | Use |
|-------|------------------|-------------------|-----|
| 0     | `shadow-none`    | none              | Inline icons, text links, border-only cards (features-grid gap-px trick) |
| `sm`  | `shadow-sm`      | 0 1px 2px rgba(15,23,42,0.05) | Table row hover badges, inline chips, collapsed card headers, skeleton wrappers |
| `md`  | `shadow-md`      | 0 4px 6px −1px rgba(15,23,42,0.08), 0 2px 4px −2px rgba(15,23,42,0.05) | **Default card elevation**: KPI cards, CMS wrappers, import/export panels, input focus halo soft fallback, form sections |
| `lg`  | `shadow-lg`      | 0 10px 15px −3px rgba(15,23,42,0.10), 0 4px 6px −4px rgba(15,23,42,0.05) | Hover state elevation (cards that lift on hover), **Testimonial cards**, dropdown panels, select open state, Why-Us image wrapper |
| `xl`  | `shadow-xl`      | 0 20px 25px −5px rgba(15,23,42,0.12), 0 8px 10px −6px rgba(15,23,42,0.08) | Modals, sheet sidebars, `site-header` when scrolled, sticky CTA bars, command palette |
| `2xl` | `shadow-2xl`     | 0 25px 50px −12px rgba(15,23,42,0.20) | Marketing hero image containers only, certificate previews, premium showcases |

Dark-mode shadow tinting rule: in `.dark` every shadow replaces the rgb
black `rgba(15,23,42,…)` with the navy-tinted `rgba(20,16,48,…)`. This is
applied globally in CSS via shadow-color custom properties so no component
needs to double-declare.

Card-to-card separation rule: when cards are already separated by a `gap`
from the grid, the shadow tier must be at least `sm` apart visually from
its neighbor. Border-only cards are only allowed inside a single parent
that already provides the outer shadow (like the gap-px grid used in
Features Grid — that grid parent itself has no shadow, it lives on a
`--secondary` background).

### 5.1 Forbidden shadow patterns (Default drift corrected, 2026-09-30)

Default homescreen code was tinting shadows on a per-component basis using
raw Tailwind `shadow-<color>/<alpha>`. This is forbidden because: (a) dark
mode navy-tinting is centralized in CSS via `--tw-shadow-*` custom
properties so per-component tints get overridden in `.dark` anyway; (b)
color-tinted shadows fail the "what tier is this" audit because you can't
tell at a glance if a shadow is sm/md/lg if the color diverges.

Forbidden (observed defaults, DO NOT):
- ❌ `shadow-black/20` (found on CTABanner + SiteHeader when scrolled)
- ❌ `shadow-black/15` (found on About hero-image)
- ❌ `shadow-primary/5` (found on dept-showcase, steps, news-card, featured-news-card, testimonial-list etc.)
- ❌ `shadow-emerald-500/30` (found on floating WhatsApp FAB)
- ❌ Any other `shadow-<color>/<alpha>` ad-hoc tint

Deliberate replacement: use the tier class alone (`shadow-sm` / `shadow-md` / `shadow-lg` / `shadow-xl` / `shadow-2xl`). If you need more elevation, bump the tier. Dark-mode tinting is global.

### 5.2 Deliberate shadow-tier mapping from homescreen restyle

| Component / role | Default (before restyle) | Deliberate (after, required) | Why |
|------------------|--------------------------|------------------------------|-----|
| Default card elevation (dept cards, steps, accreditation, testimonials, news) | `shadow-sm` + `shadow-primary/5` tint | `shadow-sm` → hover `shadow-lg` | Removed the tint; bumping the hover two tiers (sm → lg) creates a deliberate, measurable lift on interaction |
| Testimonial cards | `shadow-sm` | `shadow-md` (static) | Testimonials are "pull quotes" with reader weight; md elevation reads as "raised, trust signal" |
| Why-Us image wrapper | `shadow-xl shadow-primary/10` | `shadow-lg shadow-primary/10` → wait, tint OK *only* on the decorative hero image wrapper | §5.1 tint ban applies to text cards; a **single decorative image wrapper** may have one small primary tint *added on top of* the tier shadow to reinforce the brand-color vignette behind the image. So the wrapper uses `shadow-lg shadow-primary/10`. **No other card may use a tint.** |
| Floating scroll-top button | `shadow-md` | kept `shadow-lg` | Fixed elements must read as "lifted off the page"; lg tier matches XL above |
| Floating WhatsApp FAB | `shadow-lg shadow-emerald-500/30` tint | `shadow-xl` OKLCH brand-preserving inline | Removed emerald tint; since the WhatsApp FAB is fixed z-50 it needs XL tier for strong separation |
| SiteHeader when scrolled | `shadow-lg shadow-black/20` | `shadow-xl` (no tint) | Sticky headers need the highest static tier |
| CtaBanner wrapper | `shadow-lg shadow-black/20` | `shadow-xl` | Full-width page-CTAs use the premium tier |
| About hero-image card | `shadow-lg shadow-black/15` | `shadow-xl` | Decorative hero panels use the xl tier; no tint |
| Primary/marketing CTA buttons | none / defaults by shadcn | `shadow-md` on marketing CTA links outside Card components; CMS/dashboard actions keep `shadow-sm` shadcn default | Buttons that are "call to actions on a page" get the md lift; buttons that are "actions inside a data panel" stay at the shadcn default shadow-sm |
| Partnership/accreditation/feature tiles (small, border-only) | `shadow-sm` | kept `shadow-sm` | Border-only lightweight tiles stay at sm to avoid competing with imagery cards' lg/xl |
| Badge chips inside cards | no shadow | `shadow-sm` on hero-accent badges (scholarship badge, department eyebrow) | Inline chips inside hero/on-image cards get a tiny sm shadow for legibility |

### 5.3 Summary — how to pick a shadow tier

Pick a tier by asking "how high off the page does this element read?"

| Pick this tier | When this element is… | Example on homescreen |
|----------------|-----------------------|-----------------------|
| `shadow-none`  | inline, decorative, or already inside another card | decorative icon inside a KPI card (no outer shadow), chip inside dense CMS row |
| `shadow-sm`   | default content card, lightweight tile, chip/badge shadow for legibility | partnership tiles, accreditation tiles, badge chips |
| `shadow-md`   | reader-weighted cards, marketing CTA buttons that aren't inside another card | testimonial cards static, marketing buttons standalone |
| `shadow-lg`   | static decorative image wrapper, card-on-hover state, dialog/select dropdown open | Why-Us image, testimonial on-hover, any default card→hover |
| `shadow-xl`   | fixed/sticky chrome, floating buttons, page-CTA banner, modal, full about hero card | site-header when scrolled, floating buttons, CTABanner, About-hero image |
| `shadow-2xl`  | reserved only for premium decorative hero image containers (certificate previews etc.) | (not used on standard homescreen) |

---

## 6. Motion

- Base duration: 150ms for micro-interactions (hover, press, toggle).
- Standard duration: 250ms for in/out transitions (dialogs, sheet open).
- Long duration: 500ms maximum — used only for page hero content fade-in.
- Easing default: `cubic-bezier(0.22, 1, 0.36, 1)` (out-expo-ish).
- **Always** honor `prefers-reduced-motion: reduce`; autoplaying content
  (hero carousel) pauses for reduced-motion users.
- Entry animations never exceed 600ms; exit is always 20% faster than
  entry (ui-ux-pro-max "exit-faster-than-enter" rule).

---

## 7. Anti-patterns (Do Not)

### 7.1 Canonical anti-pattern list (v2, updated 2026-09-30)

1. **Do not** use raw Tailwind color names (`bg-indigo-600`, `text-slate-500`,
   `bg-emerald-100`, `dark:bg-slate-900`, `bg-emerald-500`, `text-emerald-600 dark:text-emerald-400`,
   `text-red-600 dark:text-red-400`, `shadow-emerald-500/30`) in components.
   Use semantic token classes. Full forbidden list + mappings in §2.11.
2. **Do not** add an arbitrary `rounded-*` outside the 5-tier scale. Explicitly
   forbidden: `rounded-3xl` (use `rounded-2xl` — see §4).
3. **Do not** add arbitrary `py-*` on section elements. Explicitly forbidden:
   `py-24` = 96px tweener; use the 5 section-padding tiers in §3.2.
4. **Do not** set Tajawal weights that were not loaded (300, 600, 900).
5. **Do not** use `font-serif` on headings or display text; use the semantic
   `font-display` class. `font-serif` is kept only for backward compat of old
   components that still reference it — any *new* heading MUST use `font-display`.
6. **Do not** bypass the shadow scale with ad-hoc `shadow-<color>/<alpha>`.
   Explicitly forbidden patterns listed in §5.1.
7. **Do not** set inline arbitrary `leading-[N]` or use `leading-7` / `leading-[1.15]`.
   Use `leading-tight / leading-snug / leading-normal / leading-relaxed` (§1).
8. **Do not** use `tracking-[0.2em]` inline; use `tracking-widest` (§1).
9. **Do not** set `text-primary` on body-copy labels, bullets, or partnership /
   accreditation tile labels. Body text default is `text-foreground`. Reserve
   `text-primary` for links + emphasized headings only (§2.9).
10. **Do not** set `text-secondary` as a "washed-out display numeral" — `--secondary`
    is a surface token. Use `text-primary/20` for large decorative display numerals (§2.9).
11. **Do not** use `leading-relaxed` on short component body copy (card descriptions,
    bullets, features, steps, subtitles). `leading-relaxed` is reserved for long-form
    prose only (≥3 sentences); short component copy uses `leading-normal` (§1).
12. **Do not** use `size-13` (52px arbitrary) or any non-standard `size-<odd>` above size-12
    for fixed buttons / FABs. Floating action buttons are uniformly `size-12` = 48px (§9.2).
13. **Do not** use `gap-1` for inline label+icon CTAs; use `gap-1.5` for icon+text links.
    See §3.4 micro spacing scale.

---

## 8. Before / After — Default vs Deliberate (Homescreen Restyle Audit, 2026-09-30)

This section is the explicit record of *what was default drift* vs *what we deliberately chose*
during the 5-axis homescreen visual restyle. Future work must copy the "Deliberate" column,
**not** the "Default (Before)" column.

### 8.1 Scope of this audit

Audit surfaces:
- Admin dashboard home view: `resources/js/pages/dashboard/index.tsx`
- Public marketing home: `resources/js/pages/welcome.tsx` plus **all 17 components in `resources/js/components/site/`**
  that welcome.tsx imports: hero, stats-bar, section-header, why-us, testimonials, features-grid,
  site-header, site-footer, departments-showcase, application-steps, scholarships, about,
  accreditation, partnerships, blog-posts-section, cta-banner, floating-buttons, news-card,
  featured-news-card.

Total files audited and restyled: 19.

### 8.2 Axis 1 — Spacing

| Concern | Default (Before) = drift | Deliberate (After) = required | Files this touched |
|---------|--------------------------|--------------------------------|--------------------|
| Section vertical padding for 11 marketing sections | ❌ `py-24` (96px = tweener, no semantic meaning) | ✅ `py-28` (112px = **section-lg** tier) for major content sections that carry imagery + headline + copy | DepartmentsShowcase, ApplicationSteps, Scholarships, About, Accreditation, Partnerships, BlogPostsSection, WhyUs, Testimonials |
| Footer vertical padding | ❌ `py-16` (64px = cramped against hero navy band) | ✅ `py-20` (80px = **section-md**) | SiteFooter |
| Closing CTA bottom padding | ❌ `pb-24` | ✅ `pb-28` (matches section-lg lower visual breather) | CtaBanner |
| Admin dashboard page shell | ❌ `gap-4 p-4` (too tight on ≥1024px) | ✅ `gap-6 p-6` (page horizontal/vertical padding matches marketing `sm:px-6`) | dashboard/index.tsx |
| Dashboard KPI card inner padding | ❌ `p-4` / `gap-4` ad-hoc | ✅ `p-5 gap-5` (KPI inner padding 20px, per §3.1 step-5) | dashboard/index.tsx |
| Dashboard card grid gaps | ❌ `gap-4` (KPIs + charts + tables all used 16px) | ✅ `gap-5` (KPIs 20px) / `gap-6` (charts & tables 24px) — hierarchy between dense KPI row vs airy chart/table rows | dashboard/index.tsx |
| Dashboard card content `space-y` | ❌ `space-y-1.5` (6px — label-to-value looked cramped in Arabic font-display) | ✅ `space-y-2` (8px) | dashboard/index.tsx |
| Card body paragraph `mt` after title | ❌ `mt-2` or `mt-3` randomly | ✅ `mt-3` short lines; `mt-4` section intro text (§1 line-height `leading-normal` baseline needs 16px breather below heading) | All 17 marketing components |
| Read-more / CTA link `mt` | ❌ `mt-4` (cards) or `mt-8` (page sections) randomly | ✅ `mt-5` card links; `mt-8` page CTAs | Scholarship cards, about bullets, featured-news, news-card |
| Icon+label list bullets inner gap | ❌ `size-7` icon (28px) with small 4px pad on 16px icon frame | ✅ `size-8` icon wrapper (32px, uniform, matches 4dp step-8) with consistent padding | About bullets |

### 8.3 Axis 2 — Radius

| Concern | Default (Before) | Deliberate (After) | Files |
|---------|------------------|--------------------|-------|
| Oversized 36px pill corners on hero wrappers | ❌ `rounded-3xl` on CtaBanner, About hero, FeaturedNewsCard | ✅ `rounded-2xl` (24px = `radius-xl` tier) | CtaBanner, About, FeaturedNewsCard |
| Stats bar (thin strip) used 24px corners | ❌ `rounded-2xl` on StatsBar (40px-tall strip with 24px corners = pill look) | ✅ `rounded-xl` (16px = `radius-lg`) | StatsBar |
| Scholarship scroll cards | ❌ `rounded-2xl` (large rounding for 300px-wide scroll tiles) | ✅ `rounded-xl` (16px, more card-like less pill) | Scholarships |
| Primary/marketing CTA buttons | ❌ `rounded-md` (10px = form-control tight) | ✅ `rounded-lg` (16px = inviting CTA) on marketing pages; CMS buttons stay `rounded-md` | ApplicationSteps CTA, Scholarships view-all, CtaBanner button, About discover CTA |

### 8.4 Axis 3 — Elevation / Shadows

| Concern | Default (Before) | Deliberate (After) | Files |
|---------|------------------|--------------------|-------|
| Per-component color-tinted shadow overrides | ❌ `shadow-black/20`, `shadow-black/15`, `shadow-primary/5`, `shadow-emerald-500/30` across 9 files | ✅ Tint ban; pick a shadow tier only. All dark tint is centralized in CSS via `--tw-shadow-*` navy tinting. | CtaBanner, SiteHeader, About, DeptShowcase, AppSteps, Scholarships, Testimonials, NewsCard, FeaturedNewsCard, FloatingButtons |
| Testimonials card (reader-weighted) | ❌ `shadow-sm` flat tile level | ✅ `shadow-md` elevation — trust signal reads as "lifted quote card" | Testimonials |
| SiteHeader when scrolled | ❌ `shadow-lg shadow-black/20` (tinted lg = not enough lift for sticky nav that has z-50) | ✅ `shadow-xl` clean tier, no tint | SiteHeader |
| CtaBanner wrapper | ❌ `shadow-lg shadow-black/20` | ✅ `shadow-xl` (closing page CTA needs premium tier) | CtaBanner |
| About hero-image wrapper | ❌ `shadow-lg shadow-black/15` | ✅ `shadow-xl` (decorative hero panels use xl tier; no tint) | About |
| Floating WhatsApp + scroll-top | ❌ `shadow-lg` + emerald tint (WhatsApp) / `shadow-md` (scroll-top) | ✅ Both uniformly `shadow-xl` (fixed z-50 elements need max non-premium tier) | FloatingButtons |
| Marketing CTA buttons (standalone, outside shadcn Cards) | ❌ No shadow class (defaults by shadcn) | ✅ `shadow-md` for marketing buttons; CMS/shadcn-inside-card buttons keep `shadow-sm` default | All CTAs on ApplicationSteps, Scholarships, About, CtaBanner |
| WhyUs image wrapper is the ONE allowed tint | ✖ `shadow-xl shadow-primary/10` default | ✅ keep `shadow-lg shadow-primary/10` — **the single decorative image wrapper exception** to the tint ban; tint allowed here because the image vignette reinforces brand-color behind hero imagery (§5.2) | WhyUs |

### 8.5 Axis 4 — Color Tokens

| Concern | Default (Before) | Deliberate (After) | Files |
|---------|------------------|--------------------|-------|
| KPI delta up (enrollment/attendance up arrows) | ❌ `text-emerald-600 dark:text-emerald-400` | ✅ `text-success` | dashboard/index.tsx |
| KPI delta down (absent arrows) | ❌ `text-red-600 dark:text-red-400` | ✅ `text-destructive` | dashboard/index.tsx |
| Recharts dashboard stopColors | ❌ `COLORS.emerald` hardcoded hexes in JS | ✅ `var(--color-success)` via CSS vars in JS COLORS object | dashboard/index.tsx |
| Floating WhatsApp green | ❌ `bg-emerald-500 shadow-emerald-500/30` = product emerald class reused for brand identity | ✅ **Updated (2026-09-30, after restyle, per product direction): brand navy + gold** — `bg-hero text-accent` + `shadow-xl`. The interim brand-preserving WhatsApp-green inline OKLCH (`bg-[oklch(0.68_0.20_145)]`) is retired; the FAB now reads as MHCST chrome (navy in both themes, gold MessageCircle icon), not as WhatsApp brand green. §2.11's third-party-brand-exception rule still stands for future cases. | FloatingButtons |
| Partnership tiles / About bullets / Accreditation labels using `text-primary` for body label text | ❌ `text-primary` on bullets, partnership tile names, accreditation body labels → too much brand color on neutral copy, body text visually read as links instead of labels | ✅ `text-foreground` for body labels; keep `text-primary` for actual links + emphasized headings only | About, Partnerships, Accreditation |
| ApplicationSteps big decorative 1./2./3. display numerals | ❌ `text-secondary` (surface token abused as "faint gray text") | ✅ `text-primary/20` (20% transparent brand color = decorative wash that keeps hue coherence, and `--secondary` stays for its intended use: soft section bands) | ApplicationSteps |

### 8.6 Axis 5 — Typography

| Concern | Default (Before) | Deliberate (After) | Files |
|---------|------------------|--------------------|-------|
| Headings / section titles used `font-serif` backward-compat alias | ❌ `font-serif text-3xl font-bold` — semantic misleading, visually underweight, no descender-aware leading tokens | ✅ `font-display text-3xl font-extrabold leading-snug` | SectionHeader, FeaturesGrid h3, all section h2 in 14 marketing files, dashboard page h1, news card h3, testimonials author |
| Dashboard admin home page h1 | ❌ `text-2xl font-bold` (no font-display, tight size for page title) | ✅ `font-display text-3xl font-extrabold leading-snug` | dashboard/index.tsx |
| Dashboard KPI values | ❌ `text-2xl font-bold` | ✅ `font-display text-3xl font-extrabold leading-snug tabular-nums` | dashboard/index.tsx |
| Hero h1 had inline arbitrary `leading-[1.15]` | ❌ `leading-[1.15]` inline arbitrary string | ✅ `leading-tight` class (1.15, matches the original numeric intent but tokenized) | Hero |
| Hero subtitle, section descriptions, card descriptions, step descriptions all defaulted to `leading-relaxed` on short copy | ❌ `leading-relaxed` everywhere on 1–2 sentence component paragraphs | ✅ `leading-normal` (1.5) for short body; `leading-relaxed` only if ≥3 sentences long-form; headings `leading-snug` / `leading-tight` | All 17 marketing components, dashboard |
| About founded-year display `text-accent` numeric glyphs | ❌ Proportional Tajawal numerals | ✅ `tabular-nums` (uniform digit widths for number-heavy layout alignment) | About, dashboard KPIs, stats-bar, step numerals |
| SectionHeader eyebrow label `tracking-[0.2em]` | ❌ arbitrary inline string | ✅ `tracking-widest` (Tailwind token, 0.2em exactly) | SectionHeader |
| Stats-bar stat numbers | ❌ no font-display, no tabular-nums, line-height inherited from body | ✅ `font-display leading-tight tabular-nums` with `text-primary` color | StatsBar |
| Scholarship badge chip text (accent on badge) | ❌ arbitrary weight variants | ✅ `font-extrabold` + `shadow-sm` for legibility | Scholarships |
| Accreditation body name labels | ❌ `text-sm font-medium leading-relaxed` | ✅ `font-display text-base font-semibold leading-normal` (elevated visual, more semantic for labeled list of institutional names) | Accreditation |
| Icon size inside FABs | ❌ WhatsApp icon `size-6` on `size-13` button (mismatch; size-13 is 52px arbitrary) | ✅ Icons uniformly `size-5` (20px) inside `size-12` (48px) FAB buttons — matches §9.2 | FloatingButtons |

---

## 9. Component-level Micro Rules (Defaults Corrected, 2026-09-30)

Micro rules from the homescreen restyle that are too granular for §1–§5 token scales but must be followed exactly for future component code.

### 9.1 Floating Action Button sizing

- ❌ **Default drift observed:** `size-13` (52px, odd, not in spacing scale) with `size-6` 24px icon.
- ✅ **Deliberate spec:** All FABs (WhatsApp, scroll-top, custom fixed CTAs) = `size-12` (48px) with `size-5` (20px) icon.
  - 48px hit area = Android/iOS Material/HIG 48dp minimum.
  - 20px icon inside = 14px visual pad on each side (visually centered for Tajawal Arabic which has wider optical centers for round glyphs).

### 9.2 `<Link>` icon + text micro-gap (§3.4 corollary)

For every `<Link>` or `<button>` that carries BOTH an inline icon AND a text label:
- Default gap = `gap-1.5` (6px).
- Exception for icon-only sibling buttons = `gap-1`.
- Exception for primary/marketing hero/large CTAs = `gap-2`.

Default drift corrected: 12 of 14 read-more links + CTA links in homescreen were using `gap-1` (too tight for Arabic).

### 9.3 Section intro paragraph sizing after heading

All sections have the pattern `h2 (section title)` → `p (description)`.
- Default drift: `text-sm mt-3 leading-relaxed` randomly mixed.
- Deliberate: `mt-4 text-base leading-normal sm:text-lg` — section descriptions are **not** small helper text; they're `text-lg` on ≥640px for scanability (mobile keeps `text-base` for measure).

### 9.4 Card-content `gap-*` pattern vs. `space-y-*`

- Default drift on dashboard and cards: `space-y-1.5` then `mt-2` after a line breaks, mixing space-y and mt into un-auditable hierarchies.
- Deliberate: use `flex flex-col gap-2` on static card-content columns for 1:1 8dp predictability. Keep `space-y-*` only for variable-length lists where not every sibling is a flex child.

### 9.5 Dashboard empty-state padding

- Default drift: `py-8`.
- Deliberate: `py-10` (section-xs tier, 40px) — empty states need more air to not look collapsed next to populated `shadow-md` card rows.

### 9.6 Dashboard table row padding

- Default drift: `py-2` / `py-2.5` mixed.
- Deliberate: header `py-2.5`, body rows `py-3` (extra 2px vertical per row keeps Arabic dot-below glyphs from colliding with row dividers in dense tables).

### 9.7 CardHeader gap in shadcn Card subcomponents

- Default drift: `space-y-1` between title + description.
- Deliberate: `gap-2` (8dp) for CardHeader; matches the 8dp rule.

### 9.8 Department-card eyebrow + card-content link paddings

- Eyebrow ("Department / قسم"): `text-xs font-bold tracking-wider text-accent` — add `tracking-wider` so uppercase/caps-ish labels read as labels vs. accidental body words.
- Card-content `mt` progression: eyebrow → `mt-2` h3 → `mt-3` p → `mt-5` links block.

---

## 10. Audit Checklist (Copy-paste into future PRs)

Before you mark any page/component visual work as "done", copy this checklist into the PR description and tick every item. This was the exact checklist applied to all 19 homescreen files in the 2026-09-30 restyle.

### 10.1 Per-file 5-axis audit checklist

For every file you edit, tick each row only after you visually verified the output:

| Axis | Pass? | Questions you must answer Yes to |
|------|-------|-----------------------------------|
| 📐 Spacing | ☐ | All `py-*` on sections use one of the 5 tiers from §3.2. No `py-24`. All gaps/padding are 4dp multiples. Section descriptions use `mt-4`, not `mt-2`/`mt-3` random. Dashboard page shell = `p-6 gap-6`. |
| 🟠 Radius | ☐ | All rounding in the 5-tier scale from §4. NO `rounded-3xl`. Marketing CTA buttons = `rounded-lg`, CMS/dashboard = `rounded-md`. FAB = `rounded-full size-12`. |
| 🌘 Elevation | ☐ | Every shadow is `shadow-sm/md/lg/xl/2xl` class only. NO `shadow-black/N`, `shadow-primary/N`, `shadow-emerald/N`. (Single exception: WhyUs image wrapper may add `shadow-primary/10` on top of tier class.) Fixed elements (nav-when-scrolled, floating buttons, page closing CTA) ≥ `shadow-xl`. Reader-weighted cards ≥ `shadow-md` static. |
| 🎨 Color | ☐ | No raw Tailwind color-name classes anywhere. Delta-up = `text-success`, delta-down = `text-destructive`. Body labels / bullets / partnership / accreditation names = `text-foreground` NOT `text-primary`. Large decorative display numerals = `text-primary/20` NOT `text-secondary`. Third-party brand colors MUST use inline OKLCH + comment, not `--success`/product colors. |
| 🔤 Type | ☐ | All h1/h2/h3/stat numbers have `font-display` and a proper leading token (not arbitrary `leading-[]`). All stat/KPI/year numeric glyphs have `tabular-nums`. Section eyebrow labels use `tracking-widest`, not `tracking-[0.2em]`. Short body copy ≤2 sentences uses `leading-normal` NOT `leading-relaxed`. Icon+label CTAs use `gap-1.5` NOT `gap-1`. |

### 10.2 Final verification steps

- [ ] `npm run build` exits 0 and all Tailwind v4 tokens are found (no unknown class warnings).
- [ ] `vendor/bin/pint --dirty --format agent` run if PHP files were touched.
- [ ] Every `<h1>` and `<h2>` page/section title visually compared to §8.6 deliberate pattern for the 17 marketing homescreen files.
- [ ] RTL Arabic pass: switch locale to `ar`, confirm `tabular-nums` still aligns, confirm `gap-1.5` still looks uncrowded for Arabic descenders.
- [ ] Light + dark theme pass: switch theme to `.dark`, confirm shadows tinted navy correctly (centralized, no per-component overrides needed), confirm delta `text-success` / `text-destructive` still have ≥4.5:1 contrast.

---

## 11. Home Page Anatomy — Anti-Slop Redesign Wave (2026-10-02)

Context: the home page was slimmed down (legacy blog-posts-section, stats bar, page-hero,
features grid, testimonials, scholarships, partnerships removed from the home route) and
Hero, Departments Showcase, Why Us, About, News and CTA Banner were rebuilt in an
editorial/panel design language. Two sections still carried the templated
"centered header + 3-card grid" AI fingerprint — **ApplicationSteps** and **Accreditation** —
and were redesigned this wave. This section records the resulting page anatomy and the
deliberate patterns future home-page work must follow.

### 11.1 Current section inventory (DOM order, `welcome.tsx`)

| # | Section (component) | Band | Section padding | Structural pattern |
|---|---------------------|------|-----------------|--------------------|
| 1 | Hero | `bg-hero` full-bleed | `min-h-[max(420px,60svh)] sm:min-h-screen` | Slide carousel; bottom-anchored title; tab-strip nav on `md+`, dots + hazard stripe on mobile |
| 2 | DepartmentsShowcase | `bg-muted` | `section-content` | Split header (title start / accent CTA end) + edge-bleed carousel of DepartmentCards + prev/next icon buttons |
| 3 | WhyUs | `bg-background` wrapping a `bg-hero` rounded panel | panel wrapper `py-[10px] sm:py-[42px]` | Full-width navy panel: centered header, glass tile list + offset photo with tilted accent shapes, highlights footer strip |
| 4 | ApplicationSteps | `bg-background` | `section-content` | **Editorial rail + staircase ledger** (see §11.2): sticky header rail, numbered steps indent progressively in reading direction |
| 5 | About (campus) | `bg-background` | `section-content` | Split header + navy stats panel + accordion expanding image grid |
| 6 | FixedVideoSection | full-bleed media | `h-[80svh]` (60svh mobile) | Fixed-attachment campus video, custom play/captions controls |
| 7 | Accreditation | `bg-muted` | `section-content` | **Asymmetric header + hairline register panel** (see §11.2) |
| 8 | NewsCarousel | `bg-background` | `py-20` (`section-md`) | Split header + center-mode carousel of tall image cards + prev/next |
| 9 | CtaBanner | `bg-background` | `pb-28` only | Card panel: eyebrow + accent dash, title, description, primary button end-aligned |

Band rhythm rule: consecutive `bg-background` sections must differ structurally (panel /
split / ledger), and `bg-muted` or full-bleed media bands must separate long background
runs — this is what replaced the old uniform "white section after white section" look.

### 11.2 New deliberate patterns (required for future home-page sections)

1. **Editorial split header — two approved forms.** The centered header is no longer the
   default for home sections. Use one of:
   - **Rail form** (ApplicationSteps): header column with eyebrow + accent dash
     (`text-sm font-bold text-accent` + `h-0.5 w-8 bg-accent rounded-full`), display title
     with accent word, description `max-w-md`, CTA button — column is `lg:sticky lg:top-24`
     beside the content. Same voice as CtaBanner's eyebrow + dash.
   - **Register form** (Accreditation): title start-aligned (`max-w-2xl`) with the
     description end-aligned on the opposite side, bottom edges aligned via
     `flex flex-wrap items-end justify-between` (About/DepartmentsShowcase header DNA).
2. **Staircase ledger.** Ordered lists of 3–5 steps render as full-width rows separated by
   `border-t border-border` hairlines, with progressive indent in the reading direction
   (`lg:ps-12`, `lg:ps-24`; mirrored automatically in RTL via logical properties). Rows
   carry a ghost ordinal + title + description; no icons, no card boxes.
3. **Ghost ordinals.** `font-display text-primary/20 font-extrabold tabular-nums` numerals
   (`01`, `02`, … via `String(n).padStart(2, '0')`), sized `text-5xl sm:text-6xl` in
   ledgers, `text-3xl` in register cells. Interactive rows transition the ordinal to
   `text-accent` on hover (`duration-300`, §6 easing).
4. **Hairline register panel.** A group of peer items (accreditation bodies, legal lists)
   renders as ONE panel — `bg-border` parent + `gap-px` grid of `bg-card` cells inside
   `rounded-2xl border border-border overflow-hidden` — not sibling boxed cards. Same
   trick already allowed for Features Grid in §5. Cells are start-aligned text, no icons.
5. **Name + qualifier typesetting.** Institutional names carrying an em-dash qualifier
   ("Ministry — Directorate") split at the em-dash: the name is `font-display text-lg
   font-bold`, the qualifier is a muted `text-sm` second line. Never render the whole
   string at one weight.
6. **Easing.** All section-level transitions use `cubic-bezier(.22,1,.36,1)` (§6) via the
   `ease-[cubic-bezier(.22,1,.36,1)]` utility, `motion-reduce:transition-none` alongside.

### 11.3 Anti-slop removals (this wave)

| Removed pattern | Why it was slop | Replacement |
|-----------------|-----------------|-------------|
| Centered title → 3 equal icon cards → centered button (ApplicationSteps) | The canonical AI landing-page section: perfectly symmetric, three equal columns, decorative icon chips | Sticky rail header + staircase ledger (§11.2.1/2) |
| 3 centered circular-icon tiles (Accreditation) | Same symmetric template; icon circles repeated what the name already says | Register panel with typeset names (§11.2.4/5) |
| Lucide chips `ClipboardCheck`/`FileText`/`Send` in navy squares | Decorative icons that duplicated the ordinal already shown | Typographic ordinals `01/02/03` |
| Centered `max-w-3xl text-center` header on both sections | Every neighboring section already uses start-aligned split headers; centered headers only survive on genuinely symmetric sections (WhyUs panel) | Rail / register header forms |

### 11.4 Slop-gate checklist for any NEW home section

- [ ] No "centered header + symmetric N-column card grid" as the section's entire structure.
- [ ] Header anatomy differs from the immediately neighboring sections (alternate rail /
      register / panel forms); no two adjacent sections with identical headers.
- [ ] The section declares exactly one band: `bg-background`, `bg-muted`, a `bg-hero`
      panel, or full-bleed media — and the band rhythm of §11.1 still holds after insertion.
- [ ] All numerals: `font-display` + `tabular-nums` + `text-primary/20` (accent on
      interaction) per §2.9/§8.5.
- [ ] Icons only where they carry information (controls, nav); never as decoration in
      card corners.
- [ ] Verified in both locales (AR RTL / EN LTR), both themes, and at 375px width.

---

## 12. Public Pages Wave (2026-10-02)

Second anti-slop wave: all remaining public marketing pages brought under the §11
language. Per-page inventory and the new rules introduced by it.

### 12.1 Page inventory after the wave

| Page (`pages/site/…`) | Pattern now |
|-----------------------|-------------|
| `about.tsx` | PageHero → pillars as gap-px register (§11.2.4) → values split w/ image + accent icon squares → milestones as hairline timeline strip → Testimonials → CtaBanner |
| `departments.tsx` | PageHero → split header with live count → **academic register rows** (§12.2) incl. level chips + head/counts meta → Contact → CtaBanner |
| `teachers.tsx` | PageHero → split header with count → **faculty directory ledger** (§12.2), alternating `sm:ps-14` row stagger → CtaBanner |
| `faq.tsx` | PageHero → Faq accordion → CtaBanner (unchanged — already on-system) |
| `blog/index.tsx` | PageHero → category chips + FeaturedNewsCard + NewsCard grid + pagination (unchanged) |
| `blog/show.tsx` | PageHero → prose article; media frame `rounded-3xl` → `rounded-2xl` |
| `contact.tsx` | PageHero → 5/7 split (image + contact cards / form card) → map section → Faq → CtaBanner (token pass, structure kept) |
| `verify-certificate.tsx` | PageHero → search card → result/not-found cards (token pass; `font-serif`→`font-display`, raw `emerald-*`→`success`) |
| `student/portal.tsx` | PageHero → search card → status-badged result cards (token pass; status badges = `success/info/warning/destructive`) |
| `student/register.tsx` | **New page** (controller rendered a missing component): PageHero → grouped fieldset form (personal / placement / password) with department→level dependent selects + honeypot |
| `static-page.tsx` | **Rebuilt**: was raw `gray-*` + `md:px-16` gutters + no footer → now PageHero + prose article + SiteFooter + FloatingButtons |

### 12.2 Rules introduced by this wave

1. **PageHero is the only public page header.** No page may hand-roll a centered navy
   hero band (the departments/teachers pattern before this wave). PageHero carries
   breadcrumb, title, description, accent dash.
2. **Directory/register rows for people and departments.** Lists of teachers or academic
   departments render as full-width `border-t border-b` ledger rows with ghost ordinals
   (`01…`), name + role/description, and meta (chips, counts, links) end-aligned — never
   3-col boxed icon cards. Optional alternating row indent (`sm:ps-14` on odd rows) adds
   ledger rhythm without boxes.
3. **Semantic data belongs in register rows.** Counts, department heads, level chips are
   part of the row's meta column — surfacing data (e.g. department `levels` chips) beats
   hiding it inside card bodies.
4. **Status colors are semantic only.** Enrollment/academic status badges map:
   completed → `success`, active/confirmed → `info`, pending → `warning`,
   cancelled/dropped → `destructive`. Raw `emerald/blue/amber/indigo-*` are banned (§2.11).
5. **Public forms use auth-style field treatment inside marketing cards.** `AuthField` /
   `AuthPasswordField` components, fields grouped in bordered `fieldset`s with
   `font-display` legends, the whole form in a `rounded-2xl border bg-card shadow-md`
   card, submit = marketing CTA (`rounded-lg shadow-md`). Dependent selects disable with
   an explanatory placeholder ("pick a department first").
6. **Local imagery only.** Public pages use `/images/*.webp` assets — no external
   Unsplash/CDN images in layout-critical positions.
7. **Legal/static pages get the full chrome.** CMS-driven content pages (terms, privacy)
   render inside PageHero + prose + SiteFooter like any other page.

### 12.3 Slop removed this wave

| Removed | Where | Replacement |
|---------|-------|-------------|
| Centered 3-pillar icon cards | About | gap-px register panel with ghost ordinals |
| Centered 5-tile milestone grid | About | hairline timeline strip with ghost years |
| Centered custom navy hero ×2 | Departments, Teachers | PageHero |
| 3-col boxed icon cards ×2 | Departments, Teachers | register/directory ledger rows |
| `font-serif` headings ×12 | Teachers, Contact, Verify, Portal | `font-display` per §7.5 |
| `tracking-[0.2em]` ×2 | Teachers (old), Contact | `tracking-widest` per §1 |
| `rounded-full` submit, `rounded-3xl` cards ×7 | Contact, Verify, Portal, Blog show | tier-correct radius per §4 |
| Raw `emerald/blue/amber/indigo-*` | Verify, Portal | semantic status tokens |
| Raw `gray-*` + missing footer | static-page | system tokens + full chrome |


