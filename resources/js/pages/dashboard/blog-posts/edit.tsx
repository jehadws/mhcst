import { BlogPost } from "@/types";
import BlogPostFormPage from "./form";

export default function EditBlogPostPage({ post }: { post: BlogPost }) {
    return <BlogPostFormPage post={post} />;
}
