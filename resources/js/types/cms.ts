export interface CmsTeacher {
    id: number;
    user_id?: number | null;
    name: string;
    email?: string | null;
    phone?: string | null;
    specialization?: string | null;
    qualification?: string | null;
    join_date?: string | null;
    status: 'active' | 'suspended' | 'resigned';
    user?: { id: number; name: string; email: string };
    schedules_count?: number;
}

export interface CmsDepartment {
    id: number;
    name: string;
    head_id?: number | null;
    description?: string | null;
    head?: CmsTeacher | null;
    levels_count?: number;
    subjects_count?: number;
    teachers_count?: number;
}

export interface CmsLevel {
    id: number;
    department_id: number;
    year: number;
    section: string;
    capacity: number;
    department?: CmsDepartment;
    students_count?: number;
}

export interface CmsSubject {
    id: number;
    department_id: number;
    code: string;
    name: string;
    credits: number;
    has_lab: boolean;
    semester: 'first' | 'second' | 'summer';
    description?: string | null;
    department?: CmsDepartment;
    enrollments_count?: number;
}

export interface CmsStudent {
    id: number;
    user_id?: number | null;
    student_no: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    level_id: number;
    enrollment_date: string;
    status: 'active' | 'suspended' | 'graduated' | 'withdrawn';
    gender?: 'male' | 'female' | null;
    birth_date?: string | null;
    address?: string | null;
    photo?: string | null;
    level?: CmsLevel;
    user?: { id: number; name: string; email: string };
    enrollments_count?: number;
    enrollments?: CmsEnrollment[];
}

export interface CmsGrade {
    id: number;
    enrollment_id: number;
    midterm?: number | null;
    final?: number | null;
    assignments?: number | null;
    projects?: number | null;
    participation?: number | null;
    total?: number | null;
    grade_letter?: string | null;
    entered_by?: number | null;
    entered_at?: string | null;
}

export interface CmsAttendance {
    id: number;
    enrollment_id: number;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    recorded_by?: number | null;
    notes?: string | null;
}

export interface CmsEnrollment {
    id: number;
    student_id: number;
    subject_id: number;
    academic_year: string;
    semester: 'first' | 'second' | 'summer';
    enrollment_date: string;
    status: 'active' | 'dropped' | 'completed';
    student?: CmsStudent;
    subject?: CmsSubject;
    grade?: CmsGrade | null;
    attendance?: CmsAttendance[];
}

export interface CmsSchedule {
    id: number;
    subject_id: number;
    teacher_id: number;
    level_id: number;
    day: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';
    start_time: string;
    end_time: string;
    room?: string | null;
    type: 'lecture' | 'lab' | 'seminar';
    academic_year: string;
    semester: 'first' | 'second' | 'summer';
    subject?: CmsSubject;
    teacher?: CmsTeacher;
    level?: CmsLevel;
}
