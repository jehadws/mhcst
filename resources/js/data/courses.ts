export type Locale = 'en' | 'ar'

export type Level = 'beginner' | 'intermediate' | 'advanced'

export type Localized = Record<Locale, string>

export type CourseCategory = 'business' | 'it' | 'finance' | 'languages' | 'project' | 'marketing'

export interface Course {
    slug: string
    category: CourseCategory
    image: string
    level: Level
    featured?: boolean
    priceUSD: number
    rating: number
    reviews: number
    durationHours: number
    lessons: number
    title: Localized
    summary: Localized
    description: Localized
    instructor: {
        name: Localized
        role: Localized
    }
    outcomes: Localized[]
    modules: { title: Localized; lessons: number }[]
}

export const categories: {
    id: CourseCategory
    label: Localized
    image: string
}[] = [
    {
        id: 'business',
        label: { en: 'Business & Management', ar: 'الأعمال والإدارة' },
        image: '/images/course-business.png',
    },
    {
        id: 'it',
        label: { en: 'IT & Software', ar: 'تقنية المعلومات والبرمجيات' },
        image: '/images/course-it.png',
    },
    {
        id: 'finance',
        label: { en: 'Accounting & Finance', ar: 'المحاسبة والمالية' },
        image: '/images/course-finance.png',
    },
    {
        id: 'languages',
        label: { en: 'Languages', ar: 'اللغات' },
        image: '/images/course-languages.png',
    },
    {
        id: 'project',
        label: { en: 'Project Management', ar: 'إدارة المشاريع' },
        image: '/images/course-project.png',
    },
    {
        id: 'marketing',
        label: { en: 'Digital Marketing', ar: 'التسويق الرقمي' },
        image: '/images/course-marketing.png',
    },
]

export const levelLabels: Record<Level, Localized> = {
    beginner: { en: 'Beginner', ar: 'مبتدئ' },
    intermediate: { en: 'Intermediate', ar: 'متوسط' },
    advanced: { en: 'Advanced', ar: 'متقدم' },
}

const outcome = (en: string, ar: string): Localized => ({ en, ar })

export const courses: Course[] = [
    {
        slug: 'strategic-leadership',
        category: 'business',
        image: '/images/course-business.png',
        level: 'advanced',
        featured: true,
        priceUSD: 320,
        rating: 4.9,
        reviews: 214,
        durationHours: 40,
        lessons: 32,
        title: { en: 'Strategic Leadership & Management', ar: 'القيادة الاستراتيجية والإدارة' },
        summary: {
            en: 'Lead teams with confidence and drive organizational growth through proven strategy frameworks.',
            ar: 'قُد فرقك بثقة وادفع نمو مؤسستك من خلال أطر استراتيجية مثبتة.',
        },
        description: {
            en: 'A comprehensive program for managers and aspiring leaders. Build the strategic mindset, communication skills, and decision-making tools needed to lead high-performing teams in a changing market.',
            ar: 'برنامج شامل للمديرين والقادة الطامحين. اكتسب العقلية الاستراتيجية ومهارات التواصل وأدوات اتخاذ القرار اللازمة لقيادة فرق عالية الأداء في سوق متغير.',
        },
        instructor: {
            name: { en: 'Dr. Amal Bin Saleh', ar: 'د. آمال بن صالح' },
            role: { en: 'Management Consultant', ar: 'مستشارة إدارية' },
        },
        outcomes: [
            outcome('Design and execute a strategic plan', 'تصميم وتنفيذ خطة استراتيجية'),
            outcome('Lead change and manage stakeholders', 'قيادة التغيير وإدارة أصحاب المصلحة'),
            outcome('Make data-informed decisions', 'اتخاذ قرارات مبنية على البيانات'),
            outcome('Build and motivate high-performing teams', 'بناء وتحفيز فرق عالية الأداء'),
        ],
        modules: [
            { title: { en: 'Foundations of Strategy', ar: 'أسس الاستراتيجية' }, lessons: 8 },
            { title: { en: 'Leading People', ar: 'قيادة الأفراد' }, lessons: 10 },
            { title: { en: 'Decision Making', ar: 'اتخاذ القرار' }, lessons: 8 },
            { title: { en: 'Driving Change', ar: 'قيادة التغيير' }, lessons: 6 },
        ],
    },
    {
        slug: 'fullstack-web-development',
        category: 'it',
        image: '/images/course-it.png',
        level: 'intermediate',
        featured: true,
        priceUSD: 380,
        rating: 4.8,
        reviews: 342,
        durationHours: 60,
        lessons: 48,
        title: { en: 'Full-Stack Web Development', ar: 'تطوير الويب المتكامل' },
        summary: {
            en: 'Build modern, production-ready web applications from front-end to back-end.',
            ar: 'ابنِ تطبيقات ويب حديثة وجاهزة للإنتاج من الواجهة الأمامية إلى الخلفية.',
        },
        description: {
            en: 'Master HTML, CSS, JavaScript, React and Node.js while building real projects. Finish with a portfolio of deployed applications and the confidence to work as a professional developer.',
            ar: 'أتقن HTML وCSS وJavaScript وReact وNode.js أثناء بناء مشاريع حقيقية. أنهِ الدورة بمعرض من التطبيقات المنشورة والثقة للعمل كمطور محترف.',
        },
        instructor: {
            name: { en: 'Eng. Yousef Al-Mansuri', ar: 'م. يوسف المنصوري' },
            role: { en: 'Senior Software Engineer', ar: 'مهندس برمجيات أول' },
        },
        outcomes: [
            outcome('Build responsive interfaces with React', 'بناء واجهات متجاوبة باستخدام React'),
            outcome('Create REST APIs with Node.js', 'إنشاء واجهات REST باستخدام Node.js'),
            outcome('Work with databases', 'التعامل مع قواعد البيانات'),
            outcome('Deploy applications to the cloud', 'نشر التطبيقات على السحابة'),
        ],
        modules: [
            { title: { en: 'Web Fundamentals', ar: 'أساسيات الويب' }, lessons: 12 },
            { title: { en: 'React in Depth', ar: 'React بعمق' }, lessons: 14 },
            { title: { en: 'Back-end with Node.js', ar: 'الواجهة الخلفية مع Node.js' }, lessons: 12 },
            { title: { en: 'Databases & Deployment', ar: 'قواعد البيانات والنشر' }, lessons: 10 },
        ],
    },
    {
        slug: 'financial-accounting',
        category: 'finance',
        image: '/images/course-finance.png',
        level: 'beginner',
        priceUSD: 240,
        rating: 4.7,
        reviews: 178,
        durationHours: 36,
        lessons: 28,
        title: { en: 'Financial Accounting Essentials', ar: 'أساسيات المحاسبة المالية' },
        summary: {
            en: 'Understand financial statements, bookkeeping, and reporting from the ground up.',
            ar: 'افهم القوائم المالية ومسك الدفاتر وإعداد التقارير من الصفر.',
        },
        description: {
            en: 'A practical introduction to accounting for professionals and business owners. Learn to read balance sheets, manage ledgers, and prepare accurate financial reports.',
            ar: 'مقدمة عملية في المحاسبة للمهنيين وأصحاب الأعمال. تعلّم قراءة الميزانيات وإدارة الدفاتر وإعداد تقارير مالية دقيقة.',
        },
        instructor: {
            name: { en: 'Ms. Huda Trabelsi', ar: 'أ. هدى الطرابلسي' },
            role: { en: 'Certified Public Accountant', ar: 'محاسبة قانونية معتمدة' },
        },
        outcomes: [
            outcome('Read and interpret financial statements', 'قراءة وتفسير القوائم المالية'),
            outcome('Maintain accurate ledgers', 'إمساك دفاتر دقيقة'),
            outcome('Understand accounting principles', 'فهم مبادئ المحاسبة'),
            outcome('Prepare monthly reports', 'إعداد التقارير الشهرية'),
        ],
        modules: [
            { title: { en: 'Accounting Basics', ar: 'أساسيات المحاسبة' }, lessons: 8 },
            { title: { en: 'The Balance Sheet', ar: 'الميزانية العمومية' }, lessons: 7 },
            { title: { en: 'Income & Cash Flow', ar: 'الدخل والتدفق النقدي' }, lessons: 7 },
            { title: { en: 'Reporting', ar: 'إعداد التقارير' }, lessons: 6 },
        ],
    },
    {
        slug: 'business-english',
        category: 'languages',
        image: '/images/course-languages.png',
        level: 'intermediate',
        priceUSD: 180,
        rating: 4.6,
        reviews: 256,
        durationHours: 30,
        lessons: 40,
        title: { en: 'Professional Business English', ar: 'الإنجليزية للأعمال الاحترافية' },
        summary: {
            en: 'Communicate clearly and confidently in the international workplace.',
            ar: 'تواصل بوضوح وثقة في بيئة العمل الدولية.',
        },
        description: {
            en: 'Improve your speaking, writing, and presentation skills for real business contexts — emails, meetings, negotiations, and interviews.',
            ar: 'طوّر مهاراتك في التحدث والكتابة والعرض في سياقات الأعمال الحقيقية — الرسائل والاجتماعات والمفاوضات والمقابلات.',
        },
        instructor: {
            name: { en: 'Mr. James Carter', ar: 'أ. جيمس كارتر' },
            role: { en: 'Language Trainer', ar: 'مدرب لغة' },
        },
        outcomes: [
            outcome('Write clear professional emails', 'كتابة رسائل احترافية واضحة'),
            outcome('Lead meetings in English', 'إدارة الاجتماعات بالإنجليزية'),
            outcome('Deliver confident presentations', 'تقديم عروض بثقة'),
            outcome('Handle negotiations', 'إدارة المفاوضات'),
        ],
        modules: [
            { title: { en: 'Workplace Vocabulary', ar: 'مفردات مكان العمل' }, lessons: 10 },
            { title: { en: 'Written Communication', ar: 'التواصل الكتابي' }, lessons: 10 },
            { title: { en: 'Meetings & Calls', ar: 'الاجتماعات والمكالمات' }, lessons: 10 },
            { title: { en: 'Presentations', ar: 'العروض التقديمية' }, lessons: 10 },
        ],
    },
    {
        slug: 'project-management-pmp',
        category: 'project',
        image: '/images/course-project.png',
        level: 'advanced',
        featured: true,
        priceUSD: 420,
        rating: 4.9,
        reviews: 301,
        durationHours: 50,
        lessons: 36,
        title: { en: 'Project Management (PMP Prep)', ar: 'إدارة المشاريع (تحضير PMP)' },
        summary: {
            en: 'Plan, execute, and deliver projects on time and on budget — and prepare for the PMP exam.',
            ar: 'خطّط ونفّذ وسلّم المشاريع في الوقت والميزانية المحددين — واستعد لامتحان PMP.',
        },
        description: {
            en: 'Aligned with the PMBOK framework, this course covers the full project lifecycle, risk management, and stakeholder engagement, with exam-focused practice throughout.',
            ar: 'متوافقة مع إطار PMBOK، تغطي هذه الدورة دورة حياة المشروع الكاملة وإدارة المخاطر وإشراك أصحاب المصلحة، مع تدريب مركّز على الامتحان.',
        },
        instructor: {
            name: { en: 'Eng. Sara Khalifa', ar: 'م. سارة خليفة' },
            role: { en: 'PMP Certified Trainer', ar: 'مدربة معتمدة PMP' },
        },
        outcomes: [
            outcome('Manage the full project lifecycle', 'إدارة دورة حياة المشروع الكاملة'),
            outcome('Build schedules and budgets', 'بناء الجداول الزمنية والميزانيات'),
            outcome('Identify and mitigate risks', 'تحديد المخاطر والحد منها'),
            outcome('Prepare for the PMP exam', 'الاستعداد لامتحان PMP'),
        ],
        modules: [
            { title: { en: 'Initiating & Planning', ar: 'البدء والتخطيط' }, lessons: 10 },
            { title: { en: 'Executing', ar: 'التنفيذ' }, lessons: 9 },
            { title: { en: 'Monitoring & Control', ar: 'المراقبة والتحكم' }, lessons: 9 },
            { title: { en: 'Exam Preparation', ar: 'التحضير للامتحان' }, lessons: 8 },
        ],
    },
    {
        slug: 'digital-marketing',
        category: 'marketing',
        image: '/images/course-marketing.png',
        level: 'beginner',
        priceUSD: 260,
        rating: 4.7,
        reviews: 189,
        durationHours: 34,
        lessons: 30,
        title: { en: 'Digital Marketing Mastery', ar: 'إتقان التسويق الرقمي' },
        summary: {
            en: 'Grow brands online with social media, SEO, and data-driven campaigns.',
            ar: 'نمِّ العلامات التجارية عبر الإنترنت باستخدام وسائل التواصل وتحسين محركات البحث والحملات المبنية على البيانات.',
        },
        description: {
            en: 'Learn to plan and run effective digital campaigns across search and social. Measure performance, optimize budgets, and turn audiences into customers.',
            ar: 'تعلّم تخطيط وتشغيل حملات رقمية فعّالة عبر البحث والتواصل الاجتماعي. قِس الأداء وحسّن الميزانيات وحوّل الجمهور إلى عملاء.',
        },
        instructor: {
            name: { en: 'Ms. Lina Ferjani', ar: 'أ. لينا فرجاني' },
            role: { en: 'Marketing Strategist', ar: 'خبيرة استراتيجيات التسويق' },
        },
        outcomes: [
            outcome('Build a marketing strategy', 'بناء استراتيجية تسويقية'),
            outcome('Run social media campaigns', 'تشغيل حملات التواصل الاجتماعي'),
            outcome('Improve search rankings (SEO)', 'تحسين ترتيب البحث (SEO)'),
            outcome('Analyze campaign performance', 'تحليل أداء الحملات'),
        ],
        modules: [
            { title: { en: 'Marketing Foundations', ar: 'أسس التسويق' }, lessons: 7 },
            { title: { en: 'Social Media', ar: 'وسائل التواصل' }, lessons: 8 },
            { title: { en: 'SEO & Content', ar: 'تحسين محركات البحث والمحتوى' }, lessons: 8 },
            { title: { en: 'Analytics', ar: 'التحليلات' }, lessons: 7 },
        ],
    },
]

export function getCourse(slug: string): Course | undefined {
    return courses.find((c) => c.slug === slug)
}
