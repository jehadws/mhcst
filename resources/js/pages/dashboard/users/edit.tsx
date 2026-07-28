import { User } from "@/types";
import { UserForm } from "./create";

export default function EditUserPage({ user }: { user: User }) {
    return <UserForm user={user} />;
}
