import { Instructor } from "@/types";
import InstructorFormPage from "./form";

export default function EditInstructorPage({ instructor }: { instructor: Instructor }) {
    return <InstructorFormPage instructor={instructor} />;
}
