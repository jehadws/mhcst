# College Management System (CMS) — Technical Specification

> **Project:** College Management System (CMS)  
> **Language:** Arabic (RTL)  
> **Type:** Full-Stack Web Application  
> **Stack:** Laravel 11 (Backend) + React 19 + Inertia.js + TypeScript + Tailwind CSS + shadcn/ui  
> **Database:** SQLite (development) / MySQL (production)  
> **Date:** August 2026  

---

## 1. Project Overview

A comprehensive web-based system for managing academic and administrative operations of a college. The system covers departments, students, teachers, courses, grades, attendance, and class schedules. It supports three user roles with granular permissions.

### Key Goals
- Digitize all college academic operations
- Reduce administrative time by 60%
- Reduce human errors by 95%
- Provide real-time reports and analytics
- Enable multi-user concurrent access
- Support RTL (Arabic) interface fully

---

## 2. Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Backend Framework | Laravel | 11 | PHP backend, routing, ORM, auth |
| Frontend Framework | React | 19 | UI components, state management |
| Bridge | Inertia.js | latest | SPA without REST API |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Components | shadcn/ui | latest | Pre-built accessible components |
| Database | SQLite / MySQL | — | Data persistence |
| Auth | Laravel Breeze + Spatie | — | Authentication & roles |
| Charts | Chart.js | 4.x | Analytics & reports |
| PWA | Vite PWA | — | Mobile-ready progressive web app |

### Security Stack
- **Authentication:** Bcrypt hashing, JWT tokens, session-based login
- **Authorization:** Spatie Laravel-Permission (Roles & Permissions)
- **Audit:** Full audit log for every CRUD operation
- **Validation:** Server-side form validation on all endpoints
- **CSRF:** Laravel CSRF protection on all forms

---

## 3. Database Schema

### 3.1 Tables

#### `departments`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PK, auto-increment | Unique department ID |
| name | varchar(255) | not null | Department name (e.g., "Computer Science") |
| head_id | bigint unsigned | FK → teachers.id, nullable | Department head (teacher) |
| description | text | nullable | Department description |
| created_at | timestamp | default now() | Creation timestamp |
| updated_at | timestamp | auto-update | Last update timestamp |

#### `levels` (Academic Levels / Years)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PK, auto-increment | Unique level ID |
| department_id | bigint unsigned | FK → departments.id, cascade delete | Parent department |
| year | tinyint unsigned | not null | Academic year (1, 2, 3, 4+) |
| section | varchar(10) | not null | Section letter (A, B, C, D...) |
| capacity | smallint unsigned | default 40 | Max students per section |
| created_at | timestamp | default now() | — |
| updated_at | timestamp | auto-update | — |

#### `teachers`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PK, auto-increment | Unique teacher ID |
| user_id | bigint unsigned | FK → users.id, nullable | Linked user account |
| name | varchar(255) | not null | Full name |
| email | varchar(255) | unique, nullable | Contact email |
| phone | varchar(20) | nullable | Phone number |
| specialization | varchar(255) | nullable | Academic specialization |
| qualification | varchar(255) | nullable | Highest degree (PhD, Masters...) |
| join_date | date | nullable | Employment start date |
| status | enum | default 'active' | active / suspended / resigned |
| created_at | timestamp | default now() | — |
| updated_at | timestamp | auto-update | — |

#### `subjects` (Courses)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PK, auto-increment | Unique subject ID |
| department_id | bigint unsigned | FK → departments.id, cascade delete | Parent department |
| code | varchar(50) | unique, not null | Subject code (e.g., "CS101") |
| name | varchar(255) | not null | Subject name |
| credits | tinyint unsigned | default 3 | Credit hours |
| has_lab | boolean | default false | Has practical/lab component |
| semester | enum | not null | first / second / summer |
| description | text | nullable | Course description |
| created_at | timestamp | default now() | — |
| updated_at | timestamp | auto-update | — |

#### `students`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PK, auto-increment | Unique student ID |
| user_id | bigint unsigned | FK → users.id, nullable | Linked user account |
| student_no | varchar(50) | unique, not null | University registration number |
| name | varchar(255) | not null | Full name |
| email | varchar(255) | unique, nullable | Student email |
| phone | varchar(20) | nullable | Phone number |
| level_id | bigint unsigned | FK → levels.id, cascade delete | Current level/section |
| enrollment_date | date | not null | Date of enrollment |
| status | enum | default 'active' | active / suspended / graduated / withdrawn |
| gender | enum | nullable | male / female |
| birth_date | date | nullable | Date of birth |
| address | text | nullable | Home address |
| photo | varchar(255) | nullable | Profile photo path |
| created_at | timestamp | default now() | — |
| updated_at | timestamp | auto-update | — |

#### `enrollments` (Student-Course Registration)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PK, auto-increment | Unique enrollment ID |
| student_id | bigint unsigned | FK → students.id, cascade delete | Enrolled student |
| subject_id | bigint unsigned | FK → subjects.id, cascade delete | Enrolled subject |
| academic_year | varchar(20) | not null | e.g., "2025-2026" |
| semester | enum | not null | first / second / summer |
| enrollment_date | date | default now() | Registration date |
| status | enum | default 'active' | active / dropped / completed |
| created_at | timestamp | default now() | — |
| updated_at | timestamp | auto-update | — |
| **UNIQUE** | (student_id, subject_id, academic_year, semester) | — | Prevent duplicate enrollment |

#### `grades`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PK, auto-increment | Unique grade ID |
| enrollment_id | bigint unsigned | FK → enrollments.id, cascade delete | Linked enrollment |
| midterm | decimal(5,2) | nullable, 0-100 | Midterm exam score |
| final | decimal(5,2) | nullable, 0-100 | Final exam score |
| assignments | decimal(5,2) | nullable, 0-100 | Assignments average |
| projects | decimal(5,2) | nullable, 0-100 | Projects score |
| participation | decimal(5,2) | nullable, 0-100 | Class participation |
| total | decimal(5,2) | nullable, 0-100 | Computed weighted total |
| grade_letter | varchar(5) | nullable | A / B+ / B / C+ / C / D / F |
| entered_by | bigint unsigned | FK → users.id | Teacher who entered grades |
| entered_at | timestamp | nullable | Entry timestamp |
| created_at | timestamp | default now() | — |
| updated_at | timestamp | auto-update | — |

**Grade Calculation Logic:**
```
weights = { midterm: 30%, final: 40%, assignments: 15%, projects: 10%, participation: 5% }
total = (midterm * 0.30) + (final * 0.40) + (assignments * 0.15) + (projects * 0.10) + (participation * 0.05)
grade_letter mapping:
  >= 90: A
  >= 85: B+
  >= 80: B
  >= 75: C+
  >= 70: C
  >= 65: D
  < 65: F
```

#### `attendance`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PK, auto-increment | Unique attendance ID |
| enrollment_id | bigint unsigned | FK → enrollments.id, cascade delete | Linked enrollment |
| date | date | not null | Attendance date |
| status | enum | not null | present / absent / late / excused |
| recorded_by | bigint unsigned | FK → users.id | Teacher who recorded |
| notes | varchar(255) | nullable | Optional note |
| created_at | timestamp | default now() | — |
| updated_at | timestamp | auto-update | — |
| **UNIQUE** | (enrollment_id, date) | — | One record per student per day per subject |

#### `schedules` (Class Timetable)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PK, auto-increment | Unique schedule ID |
| subject_id | bigint unsigned | FK → subjects.id, cascade delete | Scheduled subject |
| teacher_id | bigint unsigned | FK → teachers.id, cascade delete | Assigned teacher |
| level_id | bigint unsigned | FK → levels.id, cascade delete | Target level/section |
| day | enum | not null | saturday / sunday / monday / tuesday / wednesday / thursday / friday |
| start_time | time | not null | Class start time |
| end_time | time | not null | Class end time |
| room | varchar(50) | nullable | Classroom / lab number |
| type | enum | default 'lecture' | lecture / lab / seminar |
| academic_year | varchar(20) | not null | e.g., "2025-2026" |
| semester | enum | not null | first / second / summer |
| created_at | timestamp | default now() | — |
| updated_at | timestamp | auto-update | — |

**Schedule Validation Rules:**
- No overlapping schedules for the same teacher at the same time
- No overlapping schedules for the same room at the same time
- No overlapping schedules for the same level at the same time
- End time must be after start time
- Maximum 6 hours per day per teacher

#### `users` (System Authentication)
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PK, auto-increment | Unique user ID |
| name | varchar(255) | not null | Display name |
| email | varchar(255) | unique, not null | Login email |
| email_verified_at | timestamp | nullable | Email verification timestamp |
| password | varchar(255) | not null | Bcrypt hashed password |
| role | enum | default 'student' | admin / teacher / student |
| remember_token | varchar(100) | nullable | Laravel remember token |
| created_at | timestamp | default now() | — |
| updated_at | timestamp | auto-update | — |

#### `audit_logs`
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | bigint unsigned | PK, auto-increment | Unique log ID |
| user_id | bigint unsigned | FK → users.id, nullable | Acting user |
| action | varchar(50) | not null | create / update / delete / login / logout / export |
| entity_type | varchar(50) | not null | Model name (e.g., "Student", "Grade") |
| entity_id | bigint unsigned | nullable | Affected record ID |
| old_values | json | nullable | Previous data (for updates) |
| new_values | json | nullable | New data |
| ip_address | varchar(45) | nullable | User IP address |
| user_agent | text | nullable | Browser user agent |
| created_at | timestamp | default now() | — |

### 3.2 Relationships Diagram

```
departments (1) ───► (N) levels
                    levels (1) ───► (N) students
                    levels (1) ───► (N) schedules

departments (1) ───► (N) subjects
                    subjects (1) ───► (N) enrollments
                    subjects (1) ───► (N) schedules

teachers (1) ───► (N) schedules
teachers (1) ───► (1) departments (as head)

students (1) ───► (N) enrollments

enrollments (1) ───► (N) grades
enrollments (1) ───► (N) attendance

users (1) ───► (1) teachers (optional)
users (1) ───► (1) students (optional)
users (1) ───► (N) audit_logs
```

---

## 4. User Roles & Permissions

### 4.1 Role: Admin (Administrator)
**Permissions:** ALL — Full system access

**Capabilities:**
- CRUD on all tables (departments, levels, teachers, subjects, students, enrollments, grades, attendance, schedules, users)
- Manage user accounts and assign roles
- View all reports and analytics
- System settings (academic year, semesters, backup, restore)
- Export any data to PDF, Excel, CSV
- View audit logs
- Manage notifications and alerts
- Bulk operations (import students from Excel, bulk enrollment, etc.)

**Dashboard Widgets:**
- Total students per department
- Total teachers
- Daily attendance rate
- Grade distribution chart
- Upcoming exams / schedules
- System health metrics

### 4.2 Role: Teacher
**Permissions:** Limited to their assigned data

**Capabilities:**
- View their own profile
- View their class schedule
- View list of students in their assigned subjects/levels
- Enter and edit grades for their subjects (within time window)
- Record daily attendance for their subjects
- View attendance reports for their classes
- View grade reports for their classes
- Send notifications to students in their classes
- **CANNOT:** Delete students, delete grades, access other teachers' data, access admin settings

**Dashboard Widgets:**
- Today's schedule
- Classes taught this week
- Students count per class
- Pending grade entries
- Attendance summary for their classes

### 4.3 Role: Student
**Permissions:** Read-only for own data

**Capabilities:**
- View own profile
- View own class schedule
- View enrolled subjects
- View grades for all enrolled subjects
- View attendance percentage per subject
- View notifications
- Download grade report (PDF)
- **CANNOT:** Edit any data, view other students' data, access teacher/admin features

**Dashboard Widgets:**
- Today's schedule
- Current GPA / average
- Attendance status
- Upcoming exams
- Recent grades

---

## 5. Modules / Features

### 5.1 Departments Module
- List all departments with pagination and search
- Add / Edit / Delete department
- Assign department head (teacher)
- View department statistics (student count, teacher count, subject count)
- Export department list

### 5.2 Levels Module
- List levels grouped by department
- Add / Edit / Delete level (year + section)
- Set capacity per section
- View enrollment count vs capacity
- Auto-generate sections (A, B, C...) based on capacity

### 5.3 Teachers Module
- List teachers with search and filters (department, specialization, status)
- Add / Edit / Delete teacher
- Link teacher to user account
- View teacher schedule
- View teacher's subjects and classes
- Export teacher list

### 5.4 Subjects Module
- List subjects with filters (department, semester, credits)
- Add / Edit / Delete subject
- Assign prerequisites (future feature)
- View enrollment count per subject
- Export subject list

### 5.5 Students Module
- List students with advanced search (name, student_no, department, level, status)
- Add / Edit / Delete student
- Bulk import from Excel/CSV
- Link student to user account
- View student profile (grades, attendance, schedule)
- Generate student ID card (PDF)
- Export student list

### 5.6 Enrollments Module
- List enrollments with filters (academic year, semester, subject, level)
- Enroll single student in subject
- Bulk enroll entire level/section in subject
- Drop enrollment (soft delete)
- View enrollment history
- Export enrollment list

### 5.7 Grades Module
- Grade entry form per subject (grid of students with input fields)
- Auto-calculate total and grade letter
- Bulk grade entry
- Grade validation (0-100 range)
- Grade lock after deadline (admin can unlock)
- View grade reports (per student, per subject, per level)
- Export grade sheets
- Generate official transcript (PDF)

### 5.8 Attendance Module
- Daily attendance sheet per subject (grid of students with status buttons)
- Quick mark all present + individually mark absent/late
- Attendance percentage calculation per student per subject
- Absence alerts (auto-flag after 3 consecutive absences)
- Monthly attendance report
- Export attendance records

### 5.9 Schedules Module
- Weekly timetable view (grid: days × time slots)
- Add / Edit / Delete class session
- Conflict detection (teacher, room, level overlap)
- Auto-suggest available rooms and times
- View schedules by: teacher, level, room, subject
- Export schedule to PDF

### 5.10 Reports Module
- **Grade Report:** Per student (all subjects, GPA, status)
- **Attendance Report:** Per subject / per student / monthly summary
- **Top Students:** Ranked by GPA per department/level
- **Teacher Performance:** Classes taught, average grades, attendance rates
- **Enrollment Statistics:** New vs withdrawn, per department trends
- **Exam Schedule:** Auto-generated from schedule data
- **Financial Report:** (future feature) Tuition and fees summary
- **Certificate Generator:** Official completion certificate (PDF)

**Export Formats:** PDF, Excel (XLSX), CSV, JSON

### 5.11 Notifications Module
- In-app notification center
- Email notifications (configurable)
- Trigger events:
  - Grade published
  - Attendance alert (excessive absence)
  - Schedule change
  - Exam reminder
  - Enrollment confirmation
  - System announcements (admin only)

### 5.12 Settings Module (Admin Only)
- Academic year management
- Semester dates
- Grade entry deadline
- Attendance threshold (alert after X absences)
- System backup (manual + scheduled)
- Theme settings (primary color, logo upload)
- Email SMTP configuration

---

## 6. UI/UX Specifications

### 6.1 Design System
- **Language:** Arabic (RTL) — `dir="rtl"` on `<html>`
- **Font:** Tajawal (Google Fonts) — weights: 400, 500, 700, 800, 900
- **Primary Color:** `#1a237e` (Deep Indigo)
- **Primary Light:** `#3949ab`
- **Accent:** `#00c853` (Green for success/checkmarks)
- **Danger:** `#ff1744` (Red for errors/deletions)
- **Background:** `#f5f7fa` (Light gray)
- **Card Background:** `#ffffff`
- **Border Radius:** 16px (cards), 12px (buttons), 20px (badges)
- **Shadow:** `0 4px 20px rgba(0,0,0,0.06)` (subtle)

### 6.2 Layout Structure
- **Sidebar Navigation:** Collapsible, icons + labels, active state highlighted
- **Top Bar:** Page title, breadcrumb, user profile dropdown, notification bell
- **Main Content:** Cards-based layout, responsive grid
- **Footer:** Minimal, version info

### 6.3 Responsive Breakpoints
- Desktop: > 1024px (full sidebar, multi-column grids)
- Tablet: 768px - 1024px (collapsed sidebar, 2-column grids)
- Mobile: < 768px (bottom nav or hamburger menu, single column)

### 6.4 Key Components
- **Data Table:** Sortable, searchable, filterable, pagination, bulk actions, export button
- **Form Cards:** Grouped fields, inline validation, save/cancel buttons
- **Modal Dialogs:** Confirmations, quick edits, detail views
- **Toast Notifications:** Success/error/info messages (top-right, auto-dismiss 4s)
- **Stats Cards:** Large number + label + trend indicator
- **Charts:** Bar charts (grades distribution), Line charts (attendance trends), Pie charts (gender/department distribution)

### 6.5 Dark Mode
- Toggle switch in user profile dropdown
- Dark background: `#0f172a` (slate-900)
- Dark card: `#1e293b` (slate-800)
- Dark text: `#f1f5f9` (slate-100)
- Store preference in localStorage

---

## 7. API / Routes Structure

### 7.1 Authentication Routes
```
GET  /login              → Login page
POST /login              → Authenticate
POST /logout             → Logout
GET  /register           → Registration page (admin only for teachers/students)
POST /register           → Create account
GET  /forgot-password    → Password reset request
POST /forgot-password    → Send reset link
```

### 7.2 Dashboard Routes
```
GET /dashboard           → Role-based dashboard redirect
GET /admin/dashboard     → Admin dashboard
GET /teacher/dashboard   → Teacher dashboard
GET /student/dashboard   → Student dashboard
```

### 7.3 Resource Routes (CRUD)
All follow RESTful pattern with Inertia.js:
```
GET    /departments              → index (list)
GET    /departments/create       → create form
POST   /departments              → store
GET    /departments/{id}         → show (detail)
GET    /departments/{id}/edit    → edit form
PUT    /departments/{id}         → update
DELETE /departments/{id}         → destroy
```

Same pattern for: `/levels`, `/teachers`, `/subjects`, `/students`, `/enrollments`, `/grades`, `/attendance`, `/schedules`

### 7.4 Report Routes
```
GET /reports/grades?student_id={id}&format={pdf|excel}     → Grade report
GET /reports/attendance?subject_id={id}&month={m}           → Attendance report
GET /reports/top-students?department_id={id}&level_id={id}  → Top students
GET /reports/teacher-performance?teacher_id={id}            → Teacher stats
GET /reports/enrollment-stats?academic_year={year}          → Enrollment trends
GET /reports/schedule?level_id={id}                         → Schedule PDF
GET /reports/certificate?student_id={id}                    → Completion certificate
```

### 7.5 Bulk Action Routes
```
POST /students/import              → Excel/CSV import
POST /enrollments/bulk             → Bulk enroll level in subject
POST /grades/bulk-update           → Bulk grade entry
POST /attendance/bulk              → Bulk attendance recording
```

### 7.6 Settings Routes (Admin)
```
GET  /settings                     → Settings page
POST /settings/general             → Update general settings
POST /settings/backup              → Trigger manual backup
GET  /settings/backup/download     → Download latest backup
POST /settings/theme               → Update theme colors/logo
```

---

## 8. Business Logic & Validation Rules

### 8.1 Student Enrollment
- A student can only be enrolled in a subject once per academic year + semester
- Student must belong to a level within the subject's department (or cross-department allowed with admin override)
- Maximum enrollment per subject = level capacity
- Cannot enroll a suspended/withdrawn student

### 8.2 Grade Entry
- Only teachers assigned to the subject can enter grades
- Grade entry window: from semester start until 2 weeks after finals
- After deadline, grades are locked (admin can unlock)
- Total is auto-calculated; grade letter auto-assigned
- Cannot enter grades for dropped enrollments

### 8.3 Attendance Recording
- Only the assigned teacher can record attendance for their subject
- Can only record for today's date or past dates (not future)
- One record per student per subject per day
- Auto-alert when student reaches 3 absences in a subject
- Auto-alert when student reaches 20% absence rate

### 8.4 Schedule Creation
- Teacher cannot have overlapping classes
- Room cannot have overlapping classes
- Level cannot have overlapping classes
- Teacher max 6 hours per day
- Break between classes: minimum 10 minutes
- Lab sessions must be in rooms marked as labs

### 8.5 User Account Linking
- When creating a teacher, optionally create a `users` account
- When creating a student, optionally create a `users` account
- Email must be unique across `users`, `teachers`, and `students`
- If user account exists, role must match (teacher user → teacher role)

---

## 9. File Structure

```
cms/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginController.php
│   │   │   │   └── ... (Laravel Breeze)
│   │   │   ├── DashboardController.php
│   │   │   ├── DepartmentController.php
│   │   │   ├── LevelController.php
│   │   │   ├── TeacherController.php
│   │   │   ├── SubjectController.php
│   │   │   ├── StudentController.php
│   │   │   ├── EnrollmentController.php
│   │   │   ├── GradeController.php
│   │   │   ├── AttendanceController.php
│   │   │   ├── ScheduleController.php
│   │   │   ├── ReportController.php
│   │   │   └── SettingController.php
│   │   ├── Middleware/
│   │   │   ├── RoleMiddleware.php        # Check user role
│   │   │   └── AuditLogMiddleware.php    # Log all actions
│   │   └── Requests/
│   │       ├── StoreStudentRequest.php
│   │       ├── UpdateGradeRequest.php
│   │       └── ... (FormRequest validations)
│   ├── Models/
│   │   ├── User.php
│   │   ├── Department.php
│   │   ├── Level.php
│   │   ├── Teacher.php
│   │   ├── Subject.php
│   │   ├── Student.php
│   │   ├── Enrollment.php
│   │   ├── Grade.php
│   │   ├── Attendance.php
│   │   ├── Schedule.php
│   │   └── AuditLog.php
│   ├── Policies/                         # Authorization policies
│   └── Services/
│       ├── GradeCalculator.php
│       ├── AttendanceAlert.php
│       ├── ScheduleValidator.php
│       └── ReportGenerator.php
├── database/
│   ├── migrations/                       # All table migrations
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── DepartmentSeeder.php
│   │   ├── UserSeeder.php
│   │   └── DemoDataSeeder.php            # Sample data for testing
│   └── factories/                        # Model factories
├── resources/
│   ├── js/
│   │   ├── Pages/                        # Inertia.js pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Departments/
│   │   │   │   ├── Index.tsx
│   │   │   │   ├── Create.tsx
│   │   │   │   └── Edit.tsx
│   │   │   ├── Students/
│   │   │   ├── Grades/
│   │   │   ├── Reports/
│   │   │   └── Settings.tsx
│   │   ├── Components/
│   │   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── DataTable.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── ChartWidget.tsx
│   │   ├── Layouts/
│   │   │   └── AuthenticatedLayout.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── lib/
│   │       └── utils.ts
│   └── css/
│       └── app.css                       # Tailwind directives
├── routes/
│   └── web.php                           # All web routes
├── config/
│   └── permission.php                    # Spatie permission config
├── storage/
│   ├── app/
│   │   ├── backups/                      # Database backups
│   │   ├── exports/                      # Generated reports
│   │   └── public/
│   │       └── logos/                    # Uploaded logos
│   └── logs/
│       └── audit/                        # Audit log files (optional)
├── tests/
│   ├── Feature/                          # Feature tests
│   └── Unit/                             # Unit tests
├── .env.example
├── composer.json
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── phpunit.xml
```

---

## 10. Seed Data (For Development)

Create demo data seeder with:
- 3 departments (Computer Science, Engineering, Business)
- 4 levels per department (Year 1-4, sections A & B)
- 10 teachers
- 20 subjects (distributed across departments)
- 100 students
- Enrollments for current semester
- Sample grades and attendance records
- 1 admin user: `admin@cms.local` / `password`
- 2 teacher users
- 5 student users

---

## 11. Future Enhancements

- **Online Exams:** Quiz module with timed assessments
- **Fee Management:** Tuition payment tracking and invoicing
- **Library Integration:** Book borrowing and catalog
- **Parent Portal:** Read-only access for parents to view student progress
- **Mobile App:** Native iOS/Android app using the existing API
- **Multi-language:** English interface toggle
- **AI Chatbot:** Student support assistant
- **Biometric Attendance:** Fingerprint/face recognition integration

---

## 12. Contact Information

- **Email:** info@jehad.ly
- **Phone:** 0921397242
- **Website:** www.jehad.ly

---

*Document Version: 1.0*  
*Last Updated: August 2026*
