import { Category, Course, Instructor } from "@/types";
import { CourseForm } from "./create";

interface Props {
    course: Course;
    categories: Category[];
    instructors: Instructor[];
}

export default function EditCoursePage({ course, categories, instructors }: Props) {
    return <CourseForm course={course} categories={categories} instructors={instructors} />;
}
