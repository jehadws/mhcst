import { Enrollment } from "@/types";
import { EnrollmentForm } from "./create";

interface Props {
    enrollment: Enrollment;
    courses: Array<{ id: number; title_ar: string }>;
    students: Array<{ id: number; full_name: string }>;
}

export default function EditEnrollmentPage({ enrollment, courses, students }: Props) {
    return <EnrollmentForm enrollment={enrollment} courses={courses} students={students} />;
}
