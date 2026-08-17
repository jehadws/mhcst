export type GuideLocale = 'en' | 'ar';

export type GuideLink = { label: string; href: string };

export type GuideSection = {
    id: string;
    title: string;
    description: string;
    roles: string[];
    steps: string[];
    tips?: string[];
    links?: GuideLink[];
};

export type RoleQuickStart = {
    roles: string[];
    title: string;
    steps: string[];
    tips?: string[];
    links?: GuideLink[];
};

export type RoleExplanation = {
    role: string;
    label: string;
    summary: string;
};

export type GuideContent = {
    title: string;
    subtitle: string;
    intro: {
        title: string;
        paragraphs: string[];
    };
    loginSteps: {
        title: string;
        steps: string[];
    };
    sidebarNote: string;
    quickStarts: RoleQuickStart[];
    rolesExplained: {
        title: string;
        description: string;
        roles: RoleExplanation[];
    };
    sections: GuideSection[];
    demoTitle: string;
    demoPassword: string;
    demoAccounts: Array<{ email: string; role: string }>;
};

export const dashboardGuide: Record<GuideLocale, GuideContent> = {
    en: {
        title: 'How to use this system',
        subtitle: 'A plain guide to logging in, finding your way around, and doing your daily work.',
        intro: {
            title: 'What is this?',
            paragraphs: [
                'The college platform has two main parts. The public website is what visitors see — homepage, departments, blog, contact form, and certificate checks.',
                'The dashboard (where you are now) is the staff area. Teachers, admins, content editors, and students sign in here to do their work.',
                'Most academic work — students, grades, attendance, and timetables — lives under the College system section in the left menu.',
            ],
        },
        loginSteps: {
            title: 'How to sign in',
            steps: [
                'Open the college website and click Login at the top.',
                'Enter the email and password that an administrator created for you.',
                'If login fails or you forgot your password, contact an Admin — you cannot register yourself.',
            ],
        },
        sidebarNote: 'The left menu only shows pages you are allowed to open. If something is missing, your account role does not include that feature.',
        quickStarts: [
            {
                roles: ['Admin'],
                title: 'Admin — start here',
                steps: [
                    'Create user accounts: Settings → Users → add a person and pick their role (Teacher, Student, etc.).',
                    'Set college name and contact details: Settings → Site settings.',
                    'Build the college structure: College system → Departments, then Levels, Teachers, and Subjects.',
                    'Add students and enroll them in subjects: College system → Students, then Enrollments.',
                    'Build the timetable: College system → Schedules.',
                    'When the term ends, enter grades and lock them: College system → Grades. Use College system → Settings to set grade-lock rules.',
                ],
                links: [
                    { label: 'Manage users', href: '/dashboard/users/list' },
                    { label: 'Site settings', href: '/dashboard/site-settings' },
                    { label: 'Departments', href: '/cms/departments' },
                ],
            },
            {
                roles: ['Manager'],
                title: 'Manager — start here',
                steps: [
                    'Open Dashboard to see college-wide summaries and pending tasks.',
                    'Manage students, enrollments, grades, attendance, and schedules from the College system menu.',
                    'Run reports (grades, attendance, top students) from College system → Reports.',
                    'For creating new user accounts or changing site-wide settings, ask an Admin.',
                ],
                links: [
                    { label: 'College reports', href: '/cms/reports' },
                    { label: 'Students', href: '/cms/students' },
                ],
            },
            {
                roles: ['Teacher'],
                title: 'Teacher — start here',
                steps: [
                    'Open Dashboard — you should see today’s classes and any grades waiting for you.',
                    'Record who attended: College system → Attendance → pick your class and mark present/absent.',
                    'Enter marks: College system → Grades → choose subject and student.',
                    'Check your weekly timetable: College system → Schedules.',
                ],
                tips: [
                    'If your dashboard is empty, an Admin must link your login to a teacher profile in the college system.',
                    'You can view students in your classes but cannot add new students or change departments.',
                ],
                links: [
                    { label: 'Attendance', href: '/cms/attendance' },
                    { label: 'Grades', href: '/cms/grades' },
                    { label: 'My schedule', href: '/cms/schedules' },
                ],
            },
            {
                roles: ['Student'],
                title: 'Student — start here',
                steps: [
                    'Open Dashboard to see your GPA, today’s classes, and recent grades.',
                    'Download your official transcript: use My transcript in the menu (PDF).',
                    'The public “student portal” on the website is a separate lookup tool — use the dashboard for your real records.',
                ],
                links: [{ label: 'My transcript', href: '/dashboard/my-transcript' }],
            },
            {
                roles: ['Content Editor'],
                title: 'Content editor — start here',
                steps: [
                    'Publish news: Content → Blog posts → create or edit an article, then publish.',
                    'Update FAQs and testimonials visitors see on the website.',
                    'Edit legal pages (Privacy policy, Terms of use) under the Legal section.',
                    'You do not have access to student records or grades — that is intentional.',
                ],
                links: [
                    { label: 'Blog posts', href: '/dashboard/blog-posts/list' },
                    { label: 'FAQs', href: '/dashboard/faqs/list' },
                ],
            },
            {
                roles: ['Support'],
                title: 'Support — start here',
                steps: [
                    'View newsletter subscribers: CRM → Newsletter.',
                    'Create an email campaign as a draft, review it, then send from the campaign page.',
                    'Edit email templates (e.g. absence alerts) under Notification templates.',
                ],
                links: [
                    { label: 'Newsletter', href: '/dashboard/newsletter/list' },
                    { label: 'Campaigns', href: '/dashboard/newsletter/campaigns/list' },
                ],
            },
        ],
        rolesExplained: {
            title: 'Who can do what?',
            description: 'Each person has one or more roles. Your role controls what appears in the menu.',
            roles: [
                { role: 'Admin', label: 'Administrator', summary: 'Full control — users, site settings, college structure, grades, reports, and audit log.' },
                { role: 'Manager', label: 'Manager', summary: 'Runs daily college operations and reports. Cannot change system settings or audit log.' },
                { role: 'Teacher', label: 'Teacher', summary: 'Attendance and grades for own classes only. Sees own timetable and class lists.' },
                { role: 'Student', label: 'Student', summary: 'Own grades, schedule, and transcript. No access to other students’ data.' },
                { role: 'Content Editor', label: 'Content editor', summary: 'Public website content — blog, FAQ, testimonials, legal pages.' },
                { role: 'Support', label: 'Support', summary: 'Newsletter subscribers, email campaigns, and notification templates.' },
            ],
        },
        sections: [
            {
                id: 'public-site',
                title: 'The public website (for visitors)',
                description: 'What people see without logging in.',
                roles: ['all'],
                steps: [
                    'Homepage, About, Departments, FAQ, and Contact explain the college to the public.',
                    'Blog shows news and articles that content editors publish from the dashboard.',
                    'Certificate verification lets anyone check if a training certificate is valid.',
                    'Student portal on the website is a simple lookup — students with accounts should use the dashboard instead.',
                ],
                links: [{ label: 'View public site', href: '/' }],
            },
            {
                id: 'college-workflow',
                title: 'Typical college year workflow',
                description: 'How admins and managers usually set things up, in order.',
                roles: ['Admin', 'Manager'],
                steps: [
                    '1. Create departments (e.g. IT, Business) and levels (years) inside each department.',
                    '2. Add teachers and subjects, then link subjects to departments and levels.',
                    '3. Register students and create enrollments (which student takes which subject).',
                    '4. Build the weekly schedule so teachers know when each class runs.',
                    '5. During the term: teachers record attendance and enter grades.',
                    '6. At term end: review reports, lock grades, and export data if needed.',
                ],
                links: [
                    { label: 'Start with departments', href: '/cms/departments' },
                    { label: 'Reports', href: '/cms/reports' },
                ],
            },
            {
                id: 'admin-only',
                title: 'Admin-only tasks',
                description: 'These are reserved for the main system administrator.',
                roles: ['Admin'],
                steps: [
                    'Create and deactivate user accounts, and assign roles.',
                    'Change college name, logo, phone, email, and address on the public site.',
                    'Set academic calendar dates and when grades become locked.',
                    'Review the audit log to see who changed important records.',
                ],
                links: [
                    { label: 'Users', href: '/dashboard/users/list' },
                    { label: 'Site settings', href: '/dashboard/site-settings' },
                    { label: 'Academic settings', href: '/cms/settings' },
                    { label: 'Audit log', href: '/cms/audit-logs' },
                ],
            },
            {
                id: 'teacher-detail',
                title: 'Teacher — daily tasks explained',
                description: 'What teachers do most often.',
                roles: ['Teacher'],
                steps: [
                    'Each morning: open Dashboard to see which classes you have today.',
                    'After each class: open Attendance, select the class, and mark each student present or absent.',
                    'When assessments are done: open Grades, pick the subject, and enter each student’s mark.',
                    'Need a student list? Open Students or Enrollments — you can view but not edit college-wide data.',
                ],
                tips: [
                    'You only see subjects assigned to you in the timetable. If a class is missing, ask a Manager to fix the schedule.',
                ],
                links: [
                    { label: 'Attendance', href: '/cms/attendance' },
                    { label: 'Grades', href: '/cms/grades' },
                ],
            },
            {
                id: 'content-detail',
                title: 'Updating the public website',
                description: 'For content editors and admins.',
                roles: ['Admin', 'Manager', 'Content Editor'],
                steps: [
                    'Write a blog post, add a title and body, optionally set a short SEO description, then publish.',
                    'Keep FAQs up to date so the contact team gets fewer repeat questions.',
                    'Add or edit testimonials and training certificates shown on the site.',
                    'When uploading images, use the upload button inside the editor — do not paste external image URLs.',
                ],
                links: [
                    { label: 'Blog posts', href: '/dashboard/blog-posts/list' },
                    { label: 'Testimonials', href: '/dashboard/testimonials/list' },
                ],
            },
            {
                id: 'crm-detail',
                title: 'Newsletter and emails',
                description: 'For support and admin teams.',
                roles: ['Admin', 'Manager', 'Support'],
                steps: [
                    'Contact form messages from the public site are saved under CRM → Leads — reply by email and mark status (New → In progress → Closed).',
                    'People subscribe on the public website — their emails appear under Newsletter subscribers.',
                    'To send a bulk email: create a Campaign, write the message, save as draft, then click Send when ready.',
                    'Notification templates control automatic emails (e.g. when attendance drops). Edit the wording there.',
                    'Check CRM → Notification log to see which alert emails were sent or failed.',
                ],
                links: [
                    { label: 'Contact messages', href: '/dashboard/leads/list' },
                    { label: 'Subscribers', href: '/dashboard/newsletter/list' },
                    { label: 'Campaigns', href: '/dashboard/newsletter/campaigns/list' },
                    { label: 'Notification log', href: '/dashboard/notification-logs/list' },
                ],
            },
            {
                id: 'help',
                title: 'Something not working?',
                description: 'Common issues and who to ask.',
                roles: ['all'],
                steps: [
                    'Cannot log in → check email/password with Admin; your account may be inactive.',
                    'Empty teacher dashboard → Admin must link your login to a teacher record.',
                    'Student cannot download transcript → Admin must link the login to a student record.',
                    'Missing menu item → your role does not include that feature; ask Admin if you need access.',
                    'Page shows “403 Forbidden” → same as above — you reached a URL your role cannot use.',
                ],
            },
        ],
        demoTitle: 'Test accounts (development only)',
        demoPassword: 'Password for all accounts below: password',
        demoAccounts: [
            { email: 'admin@mhcst.ly', role: 'Admin' },
            { email: 'manager@mhcst.ly', role: 'Manager' },
            { email: 'editor@mhcst.ly', role: 'Content Editor' },
            { email: 'a.sharif@cms.local', role: 'Teacher' },
            { email: 'student1@cms.local', role: 'Student' },
        ],
    },
    ar: {
        title: 'كيف تستخدم هذا النظام',
        subtitle: 'دليل مبسّط لتسجيل الدخول، التنقل، وإنجاز عملك اليومي.',
        intro: {
            title: 'ما هذا النظام؟',
            paragraphs: [
                'منصة الكلية لها جزآن. الموقع العام يراه الزوار — الصفحة الرئيسية، الأقسام، المدونة، التواصل، والتحقق من الشهادات.',
                'لوحة التحكم (أنت هنا الآن) هي منطقة الموظفين. يسجّل الأساتذة والإدارة ومحررو المحتوى والطلاب الدخول من هنا.',
                'معظم العمل الأكاديمي — الطلاب، الدرجات، الحضور، والجداول — موجود تحت قسم «نظام الكلية» في القائمة اليسرى.',
            ],
        },
        loginSteps: {
            title: 'كيف تسجّل الدخول',
            steps: [
                'افتح موقع الكلية واضغط «تسجيل الدخول» في الأعلى.',
                'أدخل البريد وكلمة المرور التي أنشأها لك المدير.',
                'إذا فشل الدخول أو نسيت كلمة المرور، تواصل مع Admin — لا يمكنك إنشاء حساب بنفسك.',
            ],
        },
        sidebarNote: 'القائمة اليسرى تعرض فقط الصفحات المسموح لك بفتحها. إذا لم تجد رابطاً، فدورك لا يتضمن هذه الميزة.',
        quickStarts: [
            {
                roles: ['Admin'],
                title: 'Admin — ابدأ من هنا',
                steps: [
                    'إنشاء حسابات: الإعدادات ← المستخدمون ← أضف شخصاً واختر دوره (أستاذ، طالب، …).',
                    'اسم الكلية وبيانات التواصل: الإعدادات ← إعدادات الموقع.',
                    'بناء هيكل الكلية: نظام الكلية ← الأقسام، ثم المستويات، الأساتذة، والمواد.',
                    'إضافة الطلاب وتسجيلهم في المواد: نظام الكلية ← الطلاب، ثم التسجيلات.',
                    'إعداد الجدول الدراسي: نظام الكلية ← الجداول.',
                    'في نهاية الفصل: إدخال الدرجات وقفلها ← نظام الكلية ← الدرجات. قواعد القفل من نظام الكلية ← الإعدادات.',
                ],
                links: [
                    { label: 'المستخدمون', href: '/dashboard/users/list' },
                    { label: 'إعدادات الموقع', href: '/dashboard/site-settings' },
                    { label: 'الأقسام', href: '/cms/departments' },
                ],
            },
            {
                roles: ['Manager'],
                title: 'Manager — ابدأ من هنا',
                steps: [
                    'افتح لوحة التحكم لرؤية ملخصات الكلية والمهام المعلّقة.',
                    'إدارة الطلاب، التسجيلات، الدرجات، الحضور، والجداول من قائمة نظام الكلية.',
                    'التقارير (الدرجات، الحضور، أوائل الطلاب) من نظام الكلية ← التقارير.',
                    'لإنشاء حسابات جديدة أو تغيير إعدادات النظام، اطلب من Admin.',
                ],
                links: [
                    { label: 'التقارير', href: '/cms/reports' },
                    { label: 'الطلاب', href: '/cms/students' },
                ],
            },
            {
                roles: ['Teacher'],
                title: 'الأستاذ — ابدأ من هنا',
                steps: [
                    'افتح لوحة التحكم — يجب أن ترى حصص اليوم والدرجات المطلوب إدخالها.',
                    'تسجيل الحضور: نظام الكلية ← الحضور ← اختر الحصة وعلّم حاضر/غائب.',
                    'إدخال الدرجات: نظام الكلية ← الدرجات ← اختر المادة والطالب.',
                    'جدولك الأسبوعي: نظام الكلية ← الجداول.',
                ],
                tips: [
                    'إذا كانت لوحتك فارغة، يجب على Admin ربط حسابك بملف أستاذ في نظام الكلية.',
                    'يمكنك عرض طلاب صفوفك لكن لا يمكنك إضافة طلاب أو تغيير الأقسام.',
                ],
                links: [
                    { label: 'الحضور', href: '/cms/attendance' },
                    { label: 'الدرجات', href: '/cms/grades' },
                    { label: 'جدولي', href: '/cms/schedules' },
                ],
            },
            {
                roles: ['Student'],
                title: 'الطالب — ابدأ من هنا',
                steps: [
                    'افتح لوحة التحكم لرؤية معدلك، حصص اليوم، وآخر الدرجات.',
                    'تحميل كشف الدرجات الرسمي: «كشف درجاتي» من القائمة (PDF).',
                    '«بوابة الطالب» على الموقع العام أداة بحث منفصلة — استخدم لوحة التحكم لسجلاتك الرسمية.',
                ],
                links: [{ label: 'كشف درجاتي', href: '/dashboard/my-transcript' }],
            },
            {
                roles: ['Content Editor'],
                title: 'محرر المحتوى — ابدأ من هنا',
                steps: [
                    'نشر الأخبار: المحتوى ← المقالات ← أنشئ أو عدّل مقالاً ثم انشره.',
                    'تحديث الأسئلة الشائعة والآراء التي يراها الزوار.',
                    'تعديل الصفحات القانونية (الخصوصية، الشروط) من قسم Legal.',
                    'لا يمكنك الوصول لسجلات الطلاب أو الدرجات — هذا مقصود.',
                ],
                links: [
                    { label: 'المقالات', href: '/dashboard/blog-posts/list' },
                    { label: 'الأسئلة الشائعة', href: '/dashboard/faqs/list' },
                ],
            },
            {
                roles: ['Support'],
                title: 'الدعم — ابدأ من هنا',
                steps: [
                    'مشتركو النشرة: CRM ← النشرة.',
                    'إنشاء حملة بريد كمسودة، مراجعتها، ثم الإرسال من صفحة الحملة.',
                    'قوالب الإشعارات (مثل تنبيهات الغياب) من Notification templates.',
                ],
                links: [
                    { label: 'النشرة', href: '/dashboard/newsletter/list' },
                    { label: 'الحملات', href: '/dashboard/newsletter/campaigns/list' },
                ],
            },
        ],
        rolesExplained: {
            title: 'من يفعل ماذا؟',
            description: 'لكل شخص دور واحد أو أكثر. الدور يحدد ما يظهر في القائمة.',
            roles: [
                { role: 'Admin', label: 'مدير النظام', summary: 'تحكم كامل — المستخدمون، إعدادات الموقع، هيكل الكلية، الدرجات، التقارير، وسجل التدقيق.' },
                { role: 'Manager', label: 'مدير', summary: 'العمليات اليومية والتقارير. لا يغيّر إعدادات النظام أو سجل التدقيق.' },
                { role: 'Teacher', label: 'أستاذ', summary: 'الحضور والدرجات لصفوفه فقط. يرى جدوله وقوائم طلابه.' },
                { role: 'Student', label: 'طالب', summary: 'درجاته وجدوله وكشفه. لا يرى بيانات طلاب آخرين.' },
                { role: 'Content Editor', label: 'محرر محتوى', summary: 'محتوى الموقع العام — المدونة، الأسئلة، الآراء، الصفحات القانونية.' },
                { role: 'Support', label: 'دعم', summary: 'مشتركو النشرة، الحملات البريدية، وقوالب الإشعارات.' },
            ],
        },
        sections: [
            {
                id: 'public-site',
                title: 'الموقع العام (للزوار)',
                description: 'ما يراه الناس دون تسجيل دخول.',
                roles: ['all'],
                steps: [
                    'الصفحة الرئيسية، من نحن، الأقسام، الأسئلة الشائعة، والتواصل تُعرّف بالكلية.',
                    'المدونة تعرض أخباراً ينشرها محررو المحتوى من لوحة التحكم.',
                    'التحقق من الشهادات يتيح للجميع التأكد من صحة شهادة تدريب.',
                    'بوابة الطالب على الموقع أداة بحث بسيطة — الطالب ذو الحساب يستخدم لوحة التحكم.',
                ],
                links: [{ label: 'عرض الموقع', href: '/' }],
            },
            {
                id: 'college-workflow',
                title: 'سير العمل الأكاديمي المعتاد',
                description: 'كيف يجهّز المديرون النظام، بالترتيب.',
                roles: ['Admin', 'Manager'],
                steps: [
                    '١. إنشاء الأقسام (مثل IT، Business) والمستويات (السنوات) داخل كل قسم.',
                    '٢. إضافة الأساتذة والمواد وربط المواد بالأقسام والمستويات.',
                    '٣. تسجيل الطلاب وإنشاء تسجيلات (أي طالب يدرس أي مادة).',
                    '٤. بناء الجدول الأسبوعي لمعرفة مواعيد الحصص.',
                    '٥. أثناء الفصل: الأساتذة يسجلون الحضور والدرجات.',
                    '٦. نهاية الفصل: مراجعة التقارير، قفل الدرجات، وتصدير البيانات إن لزم.',
                ],
                links: [
                    { label: 'ابدأ بالأقسام', href: '/cms/departments' },
                    { label: 'التقارير', href: '/cms/reports' },
                ],
            },
            {
                id: 'admin-only',
                title: 'مهام Admin فقط',
                description: 'محجوزة لمدير النظام الرئيسي.',
                roles: ['Admin'],
                steps: [
                    'إنشاء وتعطيل حسابات المستخدمين وتعيين الأدوار.',
                    'تغيير اسم الكلية، الشعار، الهاتف، البريد، والعنوان على الموقع.',
                    'ضبط التقويم الأكademي وموعد قفل الدرجات.',
                    'مراجعة سجل التدقيق لمعرفة من غيّر السجلات المهمة.',
                ],
                links: [
                    { label: 'المستخدمون', href: '/dashboard/users/list' },
                    { label: 'إعدادات الموقع', href: '/dashboard/site-settings' },
                    { label: 'الإعدادات الأكاديمية', href: '/cms/settings' },
                    { label: 'سجل التدقيق', href: '/cms/audit-logs' },
                ],
            },
            {
                id: 'teacher-detail',
                title: 'الأستاذ — المهام اليومية',
                description: 'ما يفعله الأستاذ غالباً.',
                roles: ['Teacher'],
                steps: [
                    'كل صباح: افتح لوحة التحكم لمعرفة حصص اليوم.',
                    'بعد كل حصة: افتح الحضور، اختر الصف، وعلّم كل طالب.',
                    'عند انتهاء التقييم: افتح الدرجات، اختر المادة، وأدخل العلامة.',
                    'لقائمة الطلاب: الطلاب أو التسجيلات — عرض فقط.',
                ],
                tips: ['ترى فقط المواد المعيّنة لك في الجدول. إذا نقصت حصة، اطلب من Manager تصحيح الجدول.'],
                links: [
                    { label: 'الحضور', href: '/cms/attendance' },
                    { label: 'الدرجات', href: '/cms/grades' },
                ],
            },
            {
                id: 'content-detail',
                title: 'تحديث الموقع العام',
                description: 'لمحرري المحتوى والمديرين.',
                roles: ['Admin', 'Manager', 'Content Editor'],
                steps: [
                    'اكتب مقالاً، أضف العنوان والمحتوى، وصف SEO اختياري، ثم انشر.',
                    'حدّث الأسئلة الشائعة لتقليل الأسئلة المتكررة.',
                    'أضف أو عدّل الآراء وشهادات التدريب.',
                    'عند رفع الصور استخدم زر الرفع داخل المحرر.',
                ],
                links: [
                    { label: 'المقالات', href: '/dashboard/blog-posts/list' },
                    { label: 'الآراء', href: '/dashboard/testimonials/list' },
                ],
            },
            {
                id: 'crm-detail',
                title: 'النشرة والبريد',
                description: 'لفريق الدعم والإدارة.',
                roles: ['Admin', 'Manager', 'Support'],
                steps: [
                    'رسائل نموذج التواصل تُحفظ في CRM ← الرسائل — رُد بالبريد وغيّر الحالة (جديد ← قيد المتابعة ← مغلق).',
                    'المشتركون يسجلون من الموقع — تظهر عناوينهم تحت مشتركي النشرة.',
                    'لإرسال بريد جماعي: أنشئ حملة، اكتب الرسالة، احفظ كمسودة، ثم أرسل.',
                    'قوالب الإشعارات تتحكم في رسائل تلقائية (مثل تنبيه الغياب).',
                    'راجع CRM ← سجل الإشعارات لمعرفة الرسائل المرسلة أو الفاشلة.',
                ],
                links: [
                    { label: 'رسائل التواصل', href: '/dashboard/leads/list' },
                    { label: 'المشتركون', href: '/dashboard/newsletter/list' },
                    { label: 'الحملات', href: '/dashboard/newsletter/campaigns/list' },
                    { label: 'سجل الإشعارات', href: '/dashboard/notification-logs/list' },
                ],
            },
            {
                id: 'help',
                title: 'شيء لا يعمل؟',
                description: 'مشاكل شائعة ومن تسأل.',
                roles: ['all'],
                steps: [
                    'لا أستطيع الدخول ← تحقق من البريد/كلمة المرور مع Admin؛ قد يكون حسابك معطّلاً.',
                    'لوحة أستاذ فارغة ← Admin يجب أن يربط حسابك بملف أستاذ.',
                    'الطالب لا يحمّل كشف الدرجات ← Admin يربط الحساب بملف طالب.',
                    'رابط ناقص في القائمة ← دورك لا يتضمن هذه الميزة.',
                    'صفحة «403 Forbidden» ← وصلت لرابط دورك لا يسمح به.',
                ],
            },
        ],
        demoTitle: 'حسابات تجريبية (للتطوير فقط)',
        demoPassword: 'كلمة المرور لجميع الحسابات: password',
        demoAccounts: [
            { email: 'admin@mhcst.ly', role: 'Admin' },
            { email: 'manager@mhcst.ly', role: 'Manager' },
            { email: 'editor@mhcst.ly', role: 'Content Editor' },
            { email: 'a.sharif@cms.local', role: 'Teacher' },
            { email: 'student1@cms.local', role: 'Student' },
        ],
    },
};

export function visibleGuideSections(sections: GuideSection[], userRoles: string[]): GuideSection[] {
    return sections.filter((section) => {
        if (section.roles.includes('all')) {
            return true;
        }

        return section.roles.some((role) => userRoles.includes(role));
    });
}

export function quickStartsForRoles(quickStarts: RoleQuickStart[], userRoles: string[]): RoleQuickStart[] {
    return quickStarts.filter((qs) => qs.roles.some((role) => userRoles.includes(role)));
}
