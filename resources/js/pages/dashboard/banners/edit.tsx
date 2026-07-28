import { Banner } from "@/types";
import BannerFormPage from "./form";

export default function EditBannerPage({ banner }: { banner: Banner }) {
    return <BannerFormPage banner={banner} />;
}
