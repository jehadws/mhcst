# دليل التطبيق (العربية)

> **المؤسسة:** كلية المعايير الحديثة للعلوم والتقنية  
> **الاسم بالإنجليزية:** Almaayir Alhaditha College for Science and Technology  
> **اللغات:** العربية (أساسية، RTL) + الإنجليزية  
> **آخر تحديث:** أغسطس 2026

---

## فهرس المحتويات

1. [نظرة عامة](#1-نظرة-عامة)
2. [التقنيات المستخدمة](#2-التقنيات-المستخدمة)
3. [وحدات التطبيق](#3-وحدات-التطبيق)
4. [الأدوار والصلاحيات](#4-الأدوار-والصلاحيات)
5. [مرجع المسارات](#5-مرجع-المسارات)
6. [حسابات التجربة](#6-حسابات-التجربة)
7. [الميزات الرئيسية](#7-الميزات-الرئيسية)
8. [التطوير](#8-التطوير)

---

## 1. نظرة عامة

منصة كلية المعايير الحديثة للعلوم والتقنية هي تطبيق ويب متكامل يتكون من ثلاثة أقسام رئيسية:

| القسم | بادئة الرابط | الغرض |
|-------|-------------|-------|
| **الموقع العام** | `/` | التسويق، القبول، المدونة، الأسئلة الشائعة، التحقق من الشهادات |
| **لوحة التحكم** | `/dashboard` | إدارة المحتوى، CRM، المستخدمين، الصفحة الرئيسية حسب الدور |
| **نظام إدارة الكلية (CMS)** | `/cms` | العمليات الأكاديمية — الأقسام، الطلاب، الدرجات، الحضور، الجداول، التقارير |

**المصادقة:** تسجيل دخول عبر جلسة Laravel.  
**الصلاحيات:** Spatie Laravel Permission مع ستة أدوار معرّفة في `App\Enums\UserRole`.

يتم فرض الصلاحيات على ثلاث مستويات:

1. **Middleware على المسارات** — يمنع الوصول غير المصرّح (403)
2. **التحكم في المتحكمات والخدمات** — الأستاذ يرى فقط مواده وطلابه
3. **واجهة المستخدم** — إخفاء القوائم والأزرار غير المتاحة

---

## 2. التقنيات المستخدمة

| الطبقة | التقنية |
|--------|---------|
| الخادم | Laravel 12، PHP 8.2 |
| الواجهة | React 19، TypeScript، Inertia.js v2 |
| التنسيق | Tailwind CSS v4، shadcn/ui |
| المصادقة والأدوار | Laravel Breeze + Spatie Permission |
| قاعدة البيانات | SQLite (تطوير) / MySQL (إنتاج) |
| الاختبارات | Pest 3 |
| التعدد اللغوي | سياق الموقع مع نصوص عربية/إنجليزية وتخطيط RTL |

---

## 3. وحدات التطبيق

### 3.1 الموقع العام

متاح بدون تسجيل دخول.

| الصفحة | المسار | الوصف |
|--------|--------|-------|
| الرئيسية | `/` | الصفحة الرئيسية |
| من نحن | `/about` | نبذة عن المؤسسة |
| الأقسام | `/departments` | الأقسام الأكاديمية |
| الأسئلة الشائعة | `/faq` | الأسئلة المتكررة |
| اتصل بنا | `/contact` | نموذج التواصل |
| المدونة | `/blog-posts` | الأخبار والمقالات |
| التحقق من الشهادة | `/verify-certificate` | البحث العام عن الشهادات |
| بوابة الطالب | `/student/portal` | بحث عام عن الطلاب |
| شروط الاستخدام | `/terms-of-use` | صفحة قانونية |
| سياسة الخصوصية | `/privacy-policy` | صفحة قانونية |
| الاشتراك في النشرة | `POST /newsletter` | اشتراك بالبريد |

يمكن تبديل اللغة عبر `POST /locale` (عربي / إنجليزي).

---

### 3.2 لوحة التحكم

تتطلب تسجيل الدخول. تظهر أقسام الشريط الجانبي حسب الدور (انظر [القسم 4](#4-الأدوار-والصلاحيات)).

#### نظرة عامة

| المسار | الوصف |
|--------|-------|
| `/dashboard` | الصفحة الرئيسية حسب الدور — إحصائيات المدير، ملخص الأستاذ، معدل الطالب، أو مقاييس المحتوى |

#### إدارة المحتوى

*الأدوار: Admin، Manager، Content Editor*

| الميزة | بادئة المسار |
|--------|-------------|
| المقالات | `/dashboard/blog-posts/*` |
| الشهادات والآراء | `/dashboard/testimonials/*` |
| الأسئلة الشائعة | `/dashboard/faqs/*` |
| الشهادات الأكاديمية | `/dashboard/certificates/*` |
| سياسة الخصوصية (تحرير) | `/dashboard/pages/privacy-policy` |
| شروط الاستخدام (تحرير) | `/dashboard/pages/terms-of-use` |

#### إدارة علاقات العملاء (CRM)

*الأدوار: Admin، Manager، Support*

| الميزة | بادئة المسار |
|--------|-------------|
| مشتركو النشرة | `/dashboard/newsletter/*` |
| الحملات البريدية | `/dashboard/newsletter/campaigns/*` |
| قوالب الإشعارات | `/dashboard/notification-templates/*` |

#### الإعدادات (Admin فقط)

| الميزة | المسار |
|--------|--------|
| إدارة المستخدمين | `/dashboard/users/*` |
| إعدادات الموقع | `/dashboard/site-settings` |

يمكن تعيين أدوار Spatie متعددة للمستخدم عبر خانات الاختيار في نموذج المستخدم.

#### خدمات الطالب الذاتية

*الدور: Student*

| الميزة | المسار |
|--------|--------|
| كشف الدرجات (PDF) | `/dashboard/my-transcript` |

يتطلب ربط سجل `CmsStudent` بحساب المستخدم (`user_id`).

---

### 3.3 نظام إدارة الكلية (CMS)

*أدوار الدخول: Admin، Manager، Teacher*

جميع مسارات CMS تستخدم middleware `cms.access` و `cms.audit` (تُسجَّل العمليات).

#### نطاق الأستاذ

يتعامل الأستاذ فقط مع البيانات المرتبطة **بالمواد التي يدرّسها** (عبر الجداول الدراسية):

- **الدرجات** — عرض وإدخال درجات مواده
- **الحضور** — تسجيل حضور مواده
- **الجداول** — عرض جدوله
- **الطلاب** — عرض طلاب مسجّلين في مواده
- **التسجيلات** — عرض تسجيلات مواده

لا يستطيع الأستاذ إنشاء/تعديل/حذف: الأقسام، المستويات، الأساتذة، المواد، الطلاب، التسجيلات، أو الجداول. الوصول اليدوي للروابط المحظورة يُرجع **403**.

#### الإدارة الكاملة (Admin + Manager)

| الوحدة | المسارات | الصلاحيات |
|--------|---------|-----------|
| الأقسام | `/cms/departments` | إنشاء، قراءة، تحديث، حذف |
| المستويات | `/cms/levels` | CRUD (سنة + شعبة لكل قسم) |
| الأساتذة | `/cms/teachers` | CRUD، ربط بحساب مستخدم |
| المواد | `/cms/subjects` | CRUD |
| الطلاب | `/cms/students` | CRUD، استيراد/تصدير، بطاقة، كشف درجات |
| التسجيلات | `/cms/enrollments` | CRUD، تسجيل جماعي |
| الدرجات | `/cms/grades` | إدخال، تحديث جماعي، استيراد/تصدير |
| الحضور | `/cms/attendance` | تسجيل، جماعي، تصدير |
| الجداول | `/cms/schedules` | CRUD |
| التقارير | `/cms/reports/*` | الدرجات، الحضور، أوائل الطلاب، ملخص الأقسام |

#### إدارة CMS (Admin فقط)

| الوحدة | المسار |
|--------|--------|
| سجل التدقيق | `/cms/audit-logs` |
| الإعدادات الأكاديمية | `/cms/settings` (قفل الدرجات، موعد الإدخال) |

---

## 4. الأدوار والصلاحيات

الأدوار معرّفة في `App\Enums\UserRole` ومتزامنة عبر Spatie.

| الدور | الاسم في Spatie | لوحة التحكم | CMS | ملاحظات |
|-------|----------------|-------------|-----|---------|
| **مدير النظام** | `Admin` | كامل + جميع الأقسام | CMS كامل + التدقيق + الإعدادات | يعدّل الدرجات عند القفل |
| **مدير** | `Manager` | لوحة المدير + المحتوى + CRM | CMS كامل (بدون تدقيق وإعدادات) | نفس صلاحيات الإدارة في CMS |
| **محرر المحتوى** | `Content Editor` | لوحة المحتوى | لا وصول (403) | المدونة، الأسئلة، الشهادات، الصفحات القانونية |
| **الدعم** | `Support` | لوحة افتراضية | لا وصول (403) | النشرة، الحملات، قوالب الإشعارات |
| **أستاذ** | `Teacher` | لوحة الأستاذ | عمليات تدريس محدودة | درجات وحضور مواده؛ عرض الجداول/الطلاب/التسجيلات |
| **طالب** | `Student` | لوحة الطالب | لا وصول (403) | المعدل، الجدول، الدرجات؛ كشف الدرجات PDF |

### جدول الصلاحيات التفصيلي

| القدرة | Admin | Manager | Content Editor | Support | Teacher | Student |
|--------|:-----:|:-------:|:--------------:|:-------:|:-------:|:-------:|
| الصفحة الرئيسية | ✅ | ✅ | ✅ (محتوى) | ✅ (افتراضي) | ✅ (أستاذ) | ✅ (طالب) |
| صفحات المحتوى | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| CRM | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| إدارة المستخدمين | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| إعدادات الموقع | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CMS — إدخال الدرجات | ✅ | ✅ | ❌ | ❌ | ✅ (مواده) | ❌ |
| CMS — إدارة الهيكل | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| CMS — التقارير | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| CMS — سجل التدقيق | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CMS — الإعدادات الأكاديمية | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| كشف درجاتي | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| رفع الصور | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |

### ربط Middleware بالأدوار

| Middleware | الأدوار المسموحة |
|------------|------------------|
| `cms.access` | Admin، Manager، Teacher |
| `cms.manage` | Admin، Manager |
| `dashboard.access:content` | Admin، Manager، Content Editor |
| `dashboard.access:crm` | Admin، Manager، Support |
| `dashboard.access:settings` | Admin |
| `dashboard.access:cms_admin` | Admin |
| `dashboard.access:student` | Student |
| `dashboard.access:uploads` | Admin، Manager، Teacher، Content Editor |

### قواعد نطاق الأستاذ

مُنفَّذة في `App\Services\CmsAuthorizationService`:

1. يجب وجود ملف أستاذ (`cms_teachers.user_id`) مرتبط بالمستخدم.
2. **معرّفات المواد** تُستخرج من الجداول حيث `teacher_id` يطابق الأستاذ.
3. **معرّفات الطلاب** هم الطلاب المسجّلون في تلك المواد.
4. تحديث الدرجات/الحضور يتحقق من أن التسجيل ينتمي لمادة مسموحة.
5. Admin/Manager يتجاوزان النطاق عبر `canManage()`.

### تسميات الأدوار في الواجهة

| Spatie | English | العربية |
|--------|---------|---------|
| Admin | Administrator | مدير النظام |
| Manager | Manager | مدير |
| Content Editor | Content Editor | محرر المحتوى |
| Support | Support | الدعم |
| Teacher | Teacher | أستاذ |
| Student | Student | طالب |

---

## 5. مرجع المسارات

### مسارات عامة

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

### مسارات لوحة التحكم (تتطلب تسجيل دخول)

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

POST /uploads/image                    [أدوار الرفع]
```

### مسارات CMS

```
# جميع مستخدمي CMS (نطاق الأستاذ في المتحكمات)
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

# Admin + Manager فقط (cms.manage)
/cms/departments, /cms/levels, /cms/teachers, /cms/subjects
/cms/students/*                        [إنشاء، تعديل، استيراد، تصدير، كشف]
/cms/enrollments/*
/cms/grades/export, /cms/grades/import/*
/cms/attendance/export
/cms/schedules/create, edit, delete
/cms/reports/*

# Admin فقط
GET  /cms/audit-logs
GET  /cms/settings
PUT  /cms/settings
```

---

## 6. حسابات التجربة

كلمة المرور الافتراضية: **`password`**

| البريد | الدور | ملاحظات |
|--------|------|---------|
| `admin@mhcst.ly` | Admin | مدير النظام الرئيسي |
| `manager@mhcst.ly` | Manager | |
| `editor@mhcst.ly` | Content Editor | |
| `support@mhcst.ly` | Support | |
| `admin@cms.local` | Admin | مدير CMS التجريبي |
| `a.sharif@cms.local` | Teacher | قسم علوم الحاسوب |
| `f.werfali@cms.local` | Teacher | |
| `s.haddad@cms.local` | Teacher | |
| `o.tarhuni@cms.local` | Teacher | |
| `m.obeidi@cms.local` | Teacher | |
| `k.sweisi@cms.local` | Teacher | |
| `student1@cms.local` | Student | حساب مرتبط — لوحة الطالب والسجل الأكاديمي |
| `student2@cms.local` | Student | حساب مرتبط — نفس الاستخدام أعلاه |

طلاب التجربة الآخرون (`student3@cms.local` …) موجودون ك**سجلات CMS فقط** بدون دخول. لربط المزيد:

1. أنشئ مستخدماً بدور **Student** (Admin ← المستخدمون).
2. اضبط `user_id` على سجل `CmsStudent` (أو فعّل الربط التلقائي عند تنفيذه).

---

## 7. الميزات الرئيسية

### قفل الدرجات

- يُضبط من `/cms/settings` (Admin فقط).
- الإعدادات: قفل يدوي + موعد نهائي لإدخال الدرجات.
- عند القفل، **Admin** فقط يستطيع تعديل الدرجات (`GradeLockService`).

### سجل التدقيق

- تُسجَّل جميع عمليات CMS عبر middleware `cms.audit`.
- العرض من `/cms/audit-logs` (Admin فقط).

### التقارير

| التقرير | المسار |
|---------|--------|
| نظرة عامة | `/cms/reports` |
| الدرجات | `/cms/reports/grades` |
| الحضور | `/cms/reports/attendance` |
| أوائل الطلاب | `/cms/reports/top-students` |
| ملخص الأقسام | `/cms/reports/departments` |

### كشوف الدرجات

| الجمهور | المسار |
|---------|--------|
| الموظفون (Admin/Manager) | `/cms/students/{id}/transcript` |
| الطالب | `/dashboard/my-transcript` |

### الاستيراد / التصدير

متاح لـ Admin/Manager:

- الطلاب — CSV
- الدرجات — CSV
- الحضور — CSV (تصدير)

### التعدد اللغوي

- نصوص عربية وإنجليزية
- تخطيط RTL عند اختيار العربية
- صفحات CMS تستخدم `useCms()` وملفات الترجمة

---

## 8. التطوير

### الإعداد

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install
npm run dev
# أو: composer run dev
```

### بيانات التجربة

```bash
php artisan db:seed --class=RoleSeeder
php artisan db:seed --class=UserSeeder
php artisan db:seed --class=CmsDemoDataSeeder
```

### تشغيل الاختبارات

```bash
php artisan test --compact
php artisan test --compact tests/Feature/Cms
php artisan test --compact tests/Feature/DashboardRouteAccessTest.php
```

### ملفات المصدر الرئيسية

| الغرض | المسار |
|-------|--------|
| تعريف الأدوار | `app/Enums/UserRole.php` |
| صلاحيات CMS | `app/Services/CmsAuthorizationService.php` |
| قفل الدرجات | `app/Services/GradeLockService.php` |
| المسارات | `routes/web.php` |
| صلاحيات الواجهة | `resources/js/lib/dashboard-access.ts` |
| الشريط الجانبي | `resources/js/components/app-sidebar.tsx` |
| قدرات CMS المشتركة | `app/Http/Middleware/HandleInertiaRequests.php` |

### وثائق ذات صلة

- [CMS Technical Specification](../CMS_Technical_Specification.md) — مخطط قاعدة البيانات والمواصفات التفصيلية
- [English guide](./app-guide.en.md) — Same content in English
