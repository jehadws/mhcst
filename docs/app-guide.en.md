# Application Guide (English)

> **Institution:** Almaayir Alhaditha College for Science and Technology  
> **Arabic name:** كلية المعايير الحديثة للعلوم والتقنية  
> **Languages:** Arabic (primary, RTL) + English  
> **Last updated:** August 2026

---

## Table of contents

1. [Overview](#1-overview)
2. [Technology stack](#2-technology-stack)
3. [Application modules](#3-application-modules)
4. [Roles & permissions](#4-roles--permissions)
5. [Route reference](#5-route-reference)
6. [Demo accounts](#6-demo-accounts)
7. [Key features](#7-key-features)
8. [Development](#8-development)

---

## 1. Overview

Almaayir Alhaditha College for Science and Technology is a full-stack web platform with three main areas:

| Area | URL prefix | Purpose |
|------|------------|---------|
| **Public website** | `/` | Marketing, admissions info, blog, FAQ, certificate verification |
| **Admin dashboard** | `/dashboard` | Content management, CRM, user administration, role-specific home |
| **College Management System (CMS)** | `/cms` | Academic operations — departments, students, grades, attendance, schedules, reports |

Authentication uses **Laravel session login**. Authorization uses **Spatie Laravel Permission** with six named roles stored in `App\Enums\UserRole`.

Access is enforced at three layers:

1. **Route middleware** — blocks unauthorized URLs (returns 403)
2. **Controller / service scoping** — teachers see only their assigned subjects and students
3. **UI (sidebar & buttons)** — hides navigation and actions the user cannot use

---

## 2. Technology stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 12, PHP 8.2 |
| Frontend | React 19, TypeScript, Inertia.js v2 |
| Styling | Tailwind CSS v4, shadcn/ui |
| Auth & roles | Laravel Breeze + Spatie Permission |
| Database | SQLite (dev) / MySQL (production) |
| Testing | Pest 3 |
| i18n | Site context with Arabic/English strings, RTL layout |

---

## 3. Application modules

### 3.1 Public website

Available without login.

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page |
| About | `/about` | Institution overview |
| Departments | `/departments` | Academic departments |
| FAQ | `/faq` | Frequently asked questions |
| Contact | `/contact` | Contact form |
| Blog | `/blog-posts` | News and articles |
| Certificate verification | `/verify-certificate` | Public certificate lookup |
| Student portal | `/student/portal` | Public student lookup (search) |
| Terms of use | `/terms-of-use` | Legal page |
| Privacy policy | `/privacy-policy` | Legal page |
| Newsletter subscribe | `POST /newsletter` | Email subscription |

Locale can be switched via `POST /locale` (Arabic / English).

---

### 3.2 Admin dashboard

Requires login. Sidebar sections appear based on role (see [Section 4](#4-roles--permissions)).

#### Overview

| Route | Description |
|-------|-------------|
| `/dashboard` | Role-specific home — admin stats, teacher summary, student GPA/schedule, or content metrics |

#### Content management

*Roles: Admin, Manager, Content Editor*

| Feature | Route prefix |
|---------|--------------|
| Blog posts | `/dashboard/blog-posts/*` |
| Testimonials | `/dashboard/testimonials/*` |
| FAQs | `/dashboard/faqs/*` |
| Certificates | `/dashboard/certificates/*` |
| Privacy policy (edit) | `/dashboard/pages/privacy-policy` |
| Terms of use (edit) | `/dashboard/pages/terms-of-use` |

#### CRM

*Roles: Admin, Manager, Support*

| Feature | Route prefix |
|---------|--------------|
| Newsletter subscribers | `/dashboard/newsletter/*` |
| Email campaigns | `/dashboard/newsletter/campaigns/*` |
| Notification templates | `/dashboard/notification-templates/*` |

#### Settings (Admin only)

| Feature | Route |
|---------|-------|
| User management | `/dashboard/users/*` |
| Site settings | `/dashboard/site-settings` |

Users can be assigned multiple Spatie roles via checkboxes in the user form.

#### Student self-service

*Role: Student*

| Feature | Route |
|---------|-------|
| My transcript (PDF) | `/dashboard/my-transcript` |

Requires a `CmsStudent` record linked to the logged-in user (`user_id`).

---

### 3.3 College Management System (CMS)

*Entry roles: Admin, Manager, Teacher*

All CMS routes use middleware `cms.access` and `cms.audit` (actions are logged).

#### Teacher scope (Admin + Manager excluded from scoping)

Teachers interact only with data tied to **subjects they teach** (via schedule assignments):

- Grades — view and enter grades for own subjects
- Attendance — record for own subjects
- Schedules — view own timetable entries
- Students — view students enrolled in own subjects
- Enrollments — view enrollments for own subjects

Teachers **cannot** create/edit/delete departments, levels, teachers, subjects, students, enrollments, or schedules. Manual URL access returns **403**.

#### Full CMS management (Admin + Manager)

| Module | Routes | Capabilities |
|--------|--------|--------------|
| Departments | `/cms/departments` | CRUD |
| Levels | `/cms/levels` | CRUD (year + section per department) |
| Teachers | `/cms/teachers` | CRUD, link to user account |
| Subjects | `/cms/subjects` | CRUD |
| Students | `/cms/students` | CRUD, import/export, ID card, transcript PDF |
| Enrollments | `/cms/enrollments` | CRUD, bulk enroll |
| Grades | `/cms/grades` | Enter, bulk update, import/export |
| Attendance | `/cms/attendance` | Record, bulk record, export |
| Schedules | `/cms/schedules` | CRUD (timetable) |
| Reports | `/cms/reports/*` | Grades, attendance, top students, department summary |

#### CMS admin only (Admin)

| Module | Route |
|--------|-------|
| Audit log | `/cms/audit-logs` |
| Academic settings | `/cms/settings` (grade lock, entry deadline) |

---

## 4. Roles & permissions

Roles are defined in `App\Enums\UserRole` and synced via Spatie.

| Role | Spatie name | Dashboard | CMS | Notes |
|------|-------------|-----------|-----|-------|
| **Admin** | `Admin` | Full admin dashboard + all sidebar sections | Full CMS + audit + academic settings | Can edit grades when locked |
| **Manager** | `Manager` | Admin dashboard + content + CRM | Full CMS (no audit, no academic settings) | Same CMS manage access as Admin |
| **Content Editor** | `Content Editor` | Content dashboard | No access (403) | Blog, FAQs, testimonials, certificates, legal pages |
| **Support** | `Support` | Content-style fallback dashboard | No access (403) | Newsletter, campaigns, notification templates |
| **Teacher** | `Teacher` | Teacher dashboard | Scoped teaching ops only | Grades, attendance, read-only schedules/students/enrollments for own subjects |
| **Student** | `Student` | Student dashboard | No access (403) | GPA, schedule, grades overview; my transcript PDF |

### Access matrix (detailed)

| Capability | Admin | Manager | Content Editor | Support | Teacher | Student |
|------------|:-----:|:-------:|:--------------:|:-------:|:-------:|:-------:|
| Dashboard home | ✅ | ✅ | ✅ (content) | ✅ (fallback) | ✅ (teacher) | ✅ (student) |
| Content pages | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| CRM | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| User management | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Site settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CMS — enter grades | ✅ | ✅ | ❌ | ❌ | ✅ (own subjects) | ❌ |
| CMS — manage structure | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| CMS — reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| CMS — audit log | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CMS — academic settings | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| My transcript | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Image uploads | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |

### Middleware mapping

| Middleware | Allowed roles |
|------------|---------------|
| `cms.access` | Admin, Manager, Teacher |
| `cms.manage` | Admin, Manager |
| `dashboard.access:content` | Admin, Manager, Content Editor |
| `dashboard.access:crm` | Admin, Manager, Support |
| `dashboard.access:settings` | Admin |
| `dashboard.access:cms_admin` | Admin |
| `dashboard.access:student` | Student |
| `dashboard.access:uploads` | Admin, Manager, Teacher, Content Editor |

### Teacher scoping rules

Implemented in `App\Services\CmsAuthorizationService`:

1. A teacher profile (`cms_teachers.user_id`) must exist for the logged-in user.
2. **Subject IDs** are derived from schedules where `teacher_id` matches.
3. **Student IDs** are students enrolled in those subjects.
4. Grade/attendance updates verify enrollment belongs to an allowed subject.
5. Admin/Manager bypass all scoping via `canManage()`.

---

## 5. Route reference

### Public routes

```
GET  /
GET  /about
GET  /departments
GET  /faq
GET  /contact
POST /contact
GET  /blog-posts
GET  /blog-posts/{slug}
GET  /verify-certificate
GET  /student/portal
GET  /terms-of-use
GET  /privacy-policy
POST /newsletter
POST /locale
```

### Authenticated dashboard routes

```
GET  /dashboard
GET  /dashboard/my-transcript          [Student]

/dashboard/users/*                     [Admin]
/dashboard/site-settings               [Admin]

/dashboard/blog-posts/*                [Content]
/dashboard/testimonials/*
/dashboard/faqs/*
/dashboard/certificates/*
/dashboard/pages/privacy-policy
/dashboard/pages/terms-of-use

/dashboard/newsletter/*                [CRM]
/dashboard/notification-templates/*

POST /uploads/image                    [Upload roles]
```

### CMS routes

```
# All CMS users (teacher scope in controllers)
GET  /cms/grades
POST /cms/grades/update
POST /cms/grades/bulk-update
GET  /cms/attendance
POST /cms/attendance
POST /cms/attendance/bulk
GET  /cms/schedules
GET  /cms/schedules/{id}
GET  /cms/students
GET  /cms/students/{id}
GET  /cms/enrollments
GET  /cms/enrollments/{id}

# Admin + Manager only (cms.manage)
/cms/departments, /cms/levels, /cms/teachers, /cms/subjects  [resource CRUD]
/cms/students/*                        [create, edit, import, export, transcript]
/cms/enrollments/*
/cms/grades/export, /cms/grades/import/*
/cms/attendance/export
/cms/schedules/create, edit, delete
/cms/reports/*

# Admin only
GET  /cms/audit-logs
GET  /cms/settings
PUT  /cms/settings
```

---

## 6. Demo accounts

Default password for seeded accounts: **`password`**

| Email | Role | Notes |
|-------|------|-------|
| `admin@mhcst.ly` | Admin | Main system admin (UserSeeder) |
| `manager@mhcst.ly` | Manager | |
| `editor@mhcst.ly` | Content Editor | |
| `support@mhcst.ly` | Support | |
| `admin@cms.local` | Admin | CMS demo admin (CmsDemoDataSeeder) |
| `a.sharif@cms.local` | Teacher | CS department |
| `f.werfali@cms.local` | Teacher | |
| `s.haddad@cms.local` | Teacher | |
| `o.tarhuni@cms.local` | Teacher | |
| `m.obeidi@cms.local` | Teacher | |
| `k.sweisi@cms.local` | Teacher | |
| `student1@cms.local` | Student | Linked login — use for student dashboard & transcript |
| `student2@cms.local` | Student | Linked login — same as above |

Other demo students (`student3@cms.local` …) exist as **CMS records only** without login. To link more:

1. Create a user with the **Student** role (Admin → Users).
2. Set `user_id` on the `CmsStudent` record (or enable auto-link when implemented).

---

## 7. Key features

### Grade lock

- Configured at `/cms/settings` (Admin only).
- Settings: manual lock toggle + grade entry deadline.
- When locked, only **Admin** can edit grades (`GradeLockService`).

### Audit log

- All CMS mutations logged via `cms.audit` middleware.
- Viewable at `/cms/audit-logs` (Admin only).

### Reports

| Report | Route |
|--------|-------|
| Overview | `/cms/reports` |
| Grades | `/cms/reports/grades` |
| Attendance | `/cms/reports/attendance` |
| Top students | `/cms/reports/top-students` |
| Department summary | `/cms/reports/departments` |

### Transcripts

| Audience | Route |
|----------|-------|
| Staff (Admin/Manager) | `/cms/students/{id}/transcript` |
| Student self-service | `/dashboard/my-transcript` |

### Import / export

Available to Admin/Manager:

- Students — CSV import/export
- Grades — CSV import/export
- Attendance — CSV export

### Internationalization (i18n)

- Arabic and English UI strings
- RTL layout when Arabic is active
- CMS pages use shared `useCms()` hook and translation files

---

## 8. Development

### Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install
npm run dev
# or: composer run dev
```

### Seed data

```bash
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=CmsDemoDataSeeder
```

### Run tests

```bash
php artisan test --compact
php artisan test --compact tests/Feature/Cms
php artisan test --compact tests/Feature/DashboardRouteAccessTest.php
```

### Key source files

| Purpose | Path |
|---------|------|
| Role enum | `app/Enums/UserRole.php` |
| CMS authorization | `app/Services/CmsAuthorizationService.php` |
| Grade lock | `app/Services/GradeLockService.php` |
| Routes | `routes/web.php` |
| Dashboard access (frontend) | `resources/js/lib/dashboard-access.ts` |
| Sidebar navigation | `resources/js/components/app-sidebar.tsx` |
| Shared CMS capabilities | `app/Http/Middleware/HandleInertiaRequests.php` |

### Related documentation

- [CMS Technical Specification](../CMS_Technical_Specification.md) — database schema, API details, UI wireframes
- [Arabic guide](./app-guide.ar.md) — نفس المحتوى بالعربية
