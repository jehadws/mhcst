import { Student } from "@/types";
import { StudentForm } from "./create";

export default function EditStudentPage({ student }: { student: Student }) {
    return <StudentForm student={student} />;
}
