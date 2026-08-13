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
9. [SEO ومحركات البحث](#9-seo-ومحركات-البحث)
10. [الأمان](#10-الأمان)

---

## 1. نظرة عامة

منصة كلية المعايير الحديثة للعلوم والتقنية هي تطبيق ويب متكامل يتكون من ثلاثة أقسام رئيسية:

| القسم | بادئة الرابط | الغرض |
|-------|-------------|-------|
| **الموقع العام** | `/` | التسويق، القبول، المدونة، الأسئلة الشائعة، التحقق من الشهادات |
| **لوحة التحكم** | `/dashboard` | إدارة المحتوى، CRM، المستخدمين، الصفحة الرئيسية حسب الدور |
| **نظام إدارة الكلية (CMS)** | `/cms` | العمليات الأكاديمية — الأقسام، الطلاب، الدرجات، الحضور، الجداول، التقارير |

**المصادقة:** تسجيل دخول عبر جلسة Laravel. **التسجيل العام معطّل افتراضياً** — تُنشأ الحسابات الجديدة بواسطة **Admin ← المستخدمون**.  
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
| التحقق من الشهادة | `/verify-certificate` | بحث عام (بيانات محدودة؛ رابط تحميل موقّع) |
| بوابة الطالب | `/student/portal` | بحث بالتطابق التام (رقم قيد، بريد، أو هاتف) |
| شروط الاستخدام | `/terms-of-use` | صفحة قانونية |
| سياسة الخصوصية | `/privacy-policy` | صفحة قانونية |
| الاشتراك في النشرة | `POST /newsletter` | اشتراك بالبريد |

يمكن تبديل اللغة عبر `POST /locale` (عربي / إنجليزي).

---

### 3.2 لوحة التحكم

تتطلب تسجيل الدخول **ودور Spatie**. المستخدمون بدون أي دور يحصلون على **403** في `/dashboard` وجميع مسارات لوحة التحكم/CMS (middleware `dashboard.role`).

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
| `dashboard.role` | أي مستخدم لديه دور Spatie واحد على الأقل |
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

1. يجب وجود ملف أستاذ (`cms_teachers.user_id`) مرتبط بالمستخدم. إن لم يوجد، يرى الأستاذ **لوحة أستاذ فارغة** (وليس إحصائيات المدير).
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
POST /contact                         [حد: 5/دقيقة]
GET  /blog-posts
GET  /blog-posts/{slug}               [المقالات المنشورة فقط]
GET  /verify-certificate              [حد: 30/دقيقة]
GET  /verify-certificate/{number}/download   [رابط موقّع، حد: 10/دقيقة]
GET  /student/portal
GET  /student/portal/search           [تطابق تام، 4 أحرف كحد أدنى، حد: 20/دقيقة]
GET  /terms-of-use
GET  /privacy-policy
POST /newsletter                      [حد: 10/دقيقة]
GET  /newsletter/unsubscribe/{token}  [حد: 10/دقيقة]
POST /locale

# SEO (ديناميكي من إعدادات الموقع)
GET  /site.webmanifest
GET  /robots.txt
GET  /sitemap.xml
GET  /browserconfig.xml
```

### مسارات المصادقة

```
GET  /login
POST /login
POST /logout
GET  /register                        [404 ما لم يُفعَّل AUTH_REGISTRATION_ENABLED]
POST /register                        [404 ما لم يُفعَّل AUTH_REGISTRATION_ENABLED]
```

### مسارات لوحة التحكم (تتطلب تسجيل دخول)

جميع المسارات أدناه تتطلب `auth` + `dashboard.role`.
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

POST /uploads/image                    [أدوار الرفع؛ مجلدات مسموحة]
DELETE /uploads/image                  [أدوار الرفع؛ مسارات مسموحة]
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

### التحقق من الشهادات (عام)

- البحث برقم الشهادة في `/verify-certificate`
- تعرض الصفحة **حقولاً عامة فقط**: اسم المتدرب، الدورة، تاريخ الإصدار، المُصدر
- تحميل PDF يتطلب **رابطاً موقّعاً مؤقتاً** (30 دقيقة) بعد نجاح البحث — التحميل المباشر بدون توقيع يُرجع 403

### بوابة الطالب (عام)

- البحث يتطلب **تطابقاً تاماً** على رقم القيد أو البريد أو الهاتف أو الاسم (4 أحرف كحد أدنى)
- البحث الجزئي (مثل `@gmail.com`) لا يُرجع نتائج — يقلل التعداد غير المصرّح
- الاستجابة لا تتضمن البريد أو الهاتف أو حقول الدفع
- تحميل الشهادات من النتائج يستخدم روابط موقّعة أيضاً

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

اضبط `APP_URL` على رابط التطوير أو الإنتاج. اترك `AUTH_REGISTRATION_ENABLED=false` ما لم تحتاج تسجيلاً مفتوحاً في بيئة التطوير.

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
php artisan test --compact tests/Feature/SecurityHardeningTest.php
php artisan test --compact tests/Feature/SeoTest.php
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
| خدمة SEO | `app/Services/SiteSeoService.php` |
| متحكم SEO | `app/Http/Controllers/SeoController.php` |
| وسوم Meta (React) | `resources/js/components/seo-head.tsx` |
| تنقية HTML | `app/Support/HtmlSanitizer.php` |
| بوابة أدوار لوحة التحكم | `app/Http/Middleware/EnsureHasDashboardRole.php` |

### وثائق ذات صلة

- [CMS Technical Specification](../CMS_Technical_Specification.md) — مخطط قاعدة البيانات والمواصفات التفصيلية
- [English guide](./app-guide.en.md) — Same content in English

---

## 9. SEO ومحركات البحث

تُولَّد أصول SEO ديناميكياً من **لوحة التحكم ← إعدادات الموقع** (اسم الموقع، الوصف، بيانات التواصل).

| الأصل | المسار | الوصف |
|-------|--------|-------|
| Web manifest | `/site.webmanifest` | اسم PWA، الأيقونات، لون السمة (`#1B365D`) |
| Robots | `/robots.txt` | يسمح بالصفحات العامة؛ يمنع `/dashboard` و`/cms` والبوابات الخاصة |
| Sitemap | `/sitemap.xml` | الصفحات العامة + **مقالات المدونة المنشورة** فقط |
| Browser config | `/browserconfig.xml` | لون وأيقونات بلاط Windows |

### وسوم الصفحات

الصفحات العامة تستخدم `SeoHead` (`resources/js/components/seo-head.tsx`):

- العنوان، الوصف، الرابط الأساسي (canonical من `APP_URL`)
- Open Graph و Twitter
- JSON-LD (`EducationalOrganization`، `WebSite`، `Article` في المدونة)
- المقالات تستخدم `seo_title` / `seo_description` عند تعيينهما في CMS

خصائص Inertia المشتركة: `appUrl`، `seo.organization`.

### متطلبات الإنتاج

- اضبط **`APP_URL`** على النطاق الفعلي — الروابط الأساسية وخريطة الموقع ومعاينات الشبكات الاجتماعية تعتمد عليه
- بعد تغيير اسم الموقع أو الوصف، تحقق من `/sitemap.xml` و`/site.webmanifest` في الإنتاج

### الاختبارات

```bash
php artisan test --compact tests/Feature/SeoTest.php
```

---

## 10. الأمان

### المصادقة والحسابات

| الضابط | السلوك |
|--------|--------|
| التسجيل العام | **معطّل** افتراضياً (`AUTH_REGISTRATION_ENABLED=false`) |
| الوصول للوحة التحكم | يتطلب تسجيل دخول **ودور Spatie** (`dashboard.role`) |
| الحسابات المعطّلة | `is_active = false` لا يمكنها تسجيل الدخول |
| حد محاولات الدخول | 5 محاولات لكل بريد/IP |

حسابات جديدة: **Admin ← المستخدمون ← إنشاء** (تعيين الأدوار هناك).

### النقاط العامة

| النقطة | الحماية |
|--------|---------|
| `POST /contact` | حد 5/دقيقة؛ التحقق من البريد في reply-to |
| `POST /newsletter` | حد 10/دقيقة |
| بحث بوابة الطالب | تطابق تام، 4 أحرف كحد أدنى، حد 20/دقيقة؛ استجابة JSON محدودة |
| التحقق من الشهادة | حد 30/دقيقة؛ لا بريد/هاتف في props |
| تحميل الشهادة | رابط موقّع مطلوب؛ حد 10/دقيقة |

المناطق الخاصة (`/dashboard`، `/cms`، `/settings`، بوابة الطالب) تحصل أيضاً على `noindex, nofollow` في قالب Blade الجذر.

### أمان المحتوى

HTML الغني (المدونة، الصفحات الثابتة، حملات النشرة) يُنقّى عند الحفظ عبر `HtmlSanitizer`:

- وسوم مسموحة: فقرات، عناوين، قوائم، روابط، صور
- يزيل `onclick` و`style` وروابط `javascript:`
- JSON-LD يهرب `<` لمنع كسر `<script>`

### رفع الملفات

رفع الصور (`POST /uploads/image`):

- مجلدات مسموحة: `uploads`، `blog`، `testimonials`، `settings`
- الحذف مقيّد بمسارات تلك المجلدات

### إعدادات الموقع

تُشارك فقط المفاتيح الآمنة للعامة (الاسم، الشعار، التواصل، الوصف). إعدادات CMS الداخلية غير مُضمّنة.

### الاختبارات

```bash
php artisan test --compact tests/Feature/SecurityHardeningTest.php
php artisan test --compact tests/Feature/Auth
php artisan test --compact tests/Feature/StudentPortalTest.php
php artisan test --compact tests/Feature/CertificateVerificationTest.php
```
