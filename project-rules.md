# Project Rules — Modern Standards Training Platform Rebuild

These are binding engineering rules for building this project. Follow them exactly.
Where a rule and a shortcut conflict, the rule wins. If something is ambiguous, choose the
interpretation a +20-year senior software engineer would choose and note the assumption in a
code comment or commit message — never silently guess.

---

## 1. Project Summary

Rebuild of the MHCST (Modern Higher College of Science & Technology) platform, consisting of:

- **Public website**: `/`, `/courses`, `/courses/{course}`, `/contact-us`, `/how-we-are`
- **Dashboard**: course management, student registration management, user management,
  admin/instructor email notifications, and a message inbox for contact-us submissions
- **Differentiator features**: student portal, course reviews, certificates, live seat counts,
  bilingual (AR/EN) support

## 2. Tech Stack (fixed — do not substitute)

- **Framework**: Laravel (latest LTS) as a single monolithic app
- **Frontend**: Inertia.js + React (no separate REST API, no separate SPA repo)
- **Build tool**: Vite
- **DB**: MySQL
- **Auth**: Laravel's built-in session auth via Inertia (no Sanctum tokens needed)
- **Roles/permissions**: spatie/laravel-permission
- **Queue driver**: `database` (no Redis — target is shared hosting)
- **Notifications**: Laravel Notification classes, queued
- **Testing**: Pest or PHPUnit (backend), Vitest + React Testing Library (frontend)
- **Deployment target**: cPanel shared hosting (Libyan Spider) — no Node process may run in
  production. Anything requiring a persistent Node server (e.g. Inertia SSR) is out of scope
  unless explicitly requested later.

Do not introduce Next.js, a separate Express/Node API, Redis, Docker-only workflows, or any
tool that assumes a non-shared-hosting environment, without asking first.

---

## 3. Architecture Principles

### 3.1 SOLID — enforced, not aspirational

- **Single Responsibility**: A class has one reason to change. Controllers only orchestrate —
  they must not contain business logic, query building, or notification-sending logic inline.
  That logic belongs in Actions, Services, or Model scopes.
- **Open/Closed**: Favor composition and interfaces over editing existing classes when adding
  variants (e.g. new notification channels, new payment methods, new course types).
- **Liskov Substitution**: Any interface implementation (e.g. a `NotificationChannel`,
  `PaymentGateway`) must be swappable without breaking calling code.
- **Interface Segregation**: Don't create fat interfaces. A `Payable` interface should not force
  a class to implement unrelated methods.
- **Dependency Inversion**: Controllers and Actions depend on interfaces/contracts (bound in a
  Service Provider), not concrete classes. Example: depend on `NotifierInterface`, not
  `MailNotifier` directly.

### 3.2 Layered structure (backend)

```
Controller  → thin, validates request (via Form Request), calls one Action/Service, returns Inertia response
Form Request → validation + authorization only
Action      → one class = one use case (e.g. RegisterStudentForCourseAction)
Service     → reusable domain logic shared across Actions (e.g. CourseAvailabilityService)
Model       → Eloquent model, relationships, scopes, casts, accessors — no business logic
Policy      → authorization rules (who can view/edit/delete what)
Notification → one class per notification type
Repository  → optional; only introduce if a model's queries genuinely need swappable data sources.
              Don't add a repository layer over Eloquent purely out of habit — that's needless
              indirection for this project's scale.
```

Rule of thumb: if a controller method is more than ~15–20 lines or contains an `if` that
branches business logic (not just validation), extract it into an Action.

### 3.3 Frontend structure (React + Inertia)

```
/resources/js
  /Pages          <- one file per Inertia route, thin — composition only, no business logic
  /Components     <- reusable, single-responsibility, prop-typed components
  /Layouts        <- PublicLayout, DashboardLayout
  /Hooks          <- custom hooks (useCourseFilters, useDebounce, etc.)
  /lib or /utils  <- pure functions only (formatCurrency, formatDate) — no side effects
```

- Components must do one thing. A `CourseCard` renders a course card — it does not also
  fetch data, format dates inline, or contain routing logic.
- No prop-drilling more than 2 levels — use composition or context instead.
- No business logic in `.jsx` files beyond UI state (open/closed, selected tab, form state).
  Anything resembling a domain rule (e.g. "is this course full") must be computed server-side
  and passed as a prop, not recalculated in React.

---

## 4. Clean Code Rules (non-negotiable)

1. **Naming**: descriptive, no abbreviations except universally known ones (`id`, `url`).
   Booleans read as questions (`isFull`, `hasReview`, `canRegister`). Functions are verbs
   (`calculateSeatsRemaining`), classes are nouns (`SeatAvailabilityCalculator`).
2. **Function length**: a function/method should fit on one screen (~25 lines). If it doesn't,
   extract.
3. **No magic numbers/strings**: use enums, constants, or config. E.g. registration statuses
   must be a PHP enum (`RegistrationStatus::Pending`), never a raw string `'pending'` scattered
   across the codebase.
4. **No commented-out code** in commits. Delete it — git history keeps it if ever needed.
5. **Comments explain *why*, not *what***. Code should be self-explanatory for the "what."
6. **Fail fast, fail clearly**: validate input at the boundary (Form Requests), throw typed
   exceptions (`CourseFullException`, `RegistrationClosedException`) rather than returning
   nulls/false and checking everywhere.
7. **No duplication (DRY)**: if logic is copy-pasted more than twice, extract it — but don't
   over-abstract prematurely for a single use case (avoid speculative generality).
8. **Immutable-by-default**: prefer readonly properties/DTOs for data passed between layers
   (e.g. an Action receiving a `RegisterStudentData` DTO instead of a raw array).
9. **Type everything**: PHP — use strict types (`declare(strict_types=1);`), typed properties,
   typed return values. React — use PropTypes or JSDoc typing at minimum (TypeScript is
   preferred if the agent is set up for it; ask before introducing TS if not already present).

---

## 5. Domain Rules to Encode Properly (not as afterthoughts)

- A course has a `capacity`. Registration logic must check remaining seats atomically
  (use DB transactions + row locking, not a naive count-then-insert, to avoid race conditions
  on concurrent signups).
- Registration statuses: `pending → approved/rejected`, plus `waitlisted` when capacity is hit.
- Every registration triggers queued notifications to: the assigned instructor, and all users
  with the `admin` role — via a single `NewCourseRegistration` Notification class, not inline
  `Mail::send()` calls in a controller.
- Every contact-us submission triggers a queued notification to admins and is persisted to the
  `messages` table regardless of email delivery success (email must never be the only record).
- All user-facing text must support `ar` and `en` from day one — do not hardcode strings in
  components; store translatable model fields with `_ar`/`_en` suffixes (or a translation
  package) and use Laravel's localization for static strings.

---

## 6. Security Rules

- Authorization goes through **Policies**, checked in Form Requests or controllers via
  `$this->authorize()` — never role checks scattered through Blade/React (`if user.role == 'admin'`
  in a component is a symptom of missing backend authorization, not a substitute for it).
- All forms validated server-side via Form Requests, even if also validated client-side.
- Mass assignment protection: explicit `$fillable` on every model, never `$guarded = []`.
- File uploads (course images, payment proof, certificates) validated by MIME type and size,
  stored outside of direct public execution paths where possible.
- Rate-limit the contact-us form and registration endpoints to prevent spam/abuse.

---

## 7. Testing Requirements

- Every Action/Service class gets a unit test.
- Every controller endpoint gets at least one feature test (happy path + one failure path).
- Registration race-condition logic (capacity limits) must have a test that simulates
  concurrent registrations.
- Do not mark a feature "done" without tests for: course CRUD, registration flow + capacity
  edge cases, notification dispatch, and authorization (a student must not reach dashboard
  routes; an instructor must not edit another instructor's course).

---

## 8. Performance Rules (shared-hosting aware)

- No N+1 queries — eager load relationships explicitly; add a test or a code review step that
  checks query count on key pages (course listing, dashboard registration list).
- Cache rarely-changing public data (course listings, categories) using Laravel's `Cache` facade.
- Run `config:cache`, `route:cache`, `view:cache` as part of the deployment step — this must be
  documented in a `DEPLOY.md`, not left to memory.
- Frontend: route-based code splitting per Inertia page (lazy `import.meta.glob`), compress
  images, avoid shipping unused component libraries.

---

## 9. Git & Workflow Rules

- Conventional commits (`feat:`, `fix:`, `refactor:`, `test:`, `chore:`).
- One logical change per commit — no "misc fixes" dumping ground commits.
- No direct commits of `.env`, `node_modules`, `vendor`, or compiled `public/build` assets.
- PR/commit descriptions state *what changed* and *why*, not just *what*.

---

## 10. Definition of Done (checklist for every feature)

A feature is not complete until all of the following are true:

- [ ] Business logic lives in an Action/Service, not the controller.
- [ ] Input validated via a Form Request.
- [ ] Authorization enforced via a Policy.
- [ ] No magic strings/numbers — enums/constants used.
- [ ] Tests written and passing (unit + feature as applicable).
- [ ] No N+1 queries introduced (verified, not assumed).
- [ ] Bilingual strings added for both `ar` and `en`.
- [ ] No commented-out code, no debug `dd()`/`console.log()` left in.
- [ ] Works within the shared-hosting constraint (no new Node/Redis/persistent-process
      dependency introduced without prior approval).

---

## 11. What NOT to do

- Do not add microservices, message brokers, or container orchestration — this is a monolith
  on shared hosting by design.
- Do not introduce a separate REST API layer "just in case" — Inertia already solves this.
- Do not over-engineer with repository/interface layers where Eloquent directly and simply
  suffices — apply SOLID pragmatically, not dogmatically.
- Do not silently change the agreed stack (Laravel + Inertia + React, MySQL, cPanel shared
  hosting). Flag any limitation you hit with this stack instead of quietly switching tools.
