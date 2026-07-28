import { Testimonial } from "@/types";
import TestimonialFormPage from "./form";

export default function EditTestimonialPage({ testimonial }: { testimonial: Testimonial }) {
    return <TestimonialFormPage testimonial={testimonial} />;
}
