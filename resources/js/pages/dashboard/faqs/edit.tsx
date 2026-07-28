import { Faq } from "@/types";
import FaqFormPage from "./form";

export default function EditFaqPage({ faq }: { faq: Faq }) {
    return <FaqFormPage faq={faq} />;
}
