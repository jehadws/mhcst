import { SiteSetting } from "@/types";
import SiteSettingFormPage from "./form";

export default function EditSiteSettingPage({ siteSetting }: { siteSetting: SiteSetting }) {
    return <SiteSettingFormPage setting={siteSetting} />;
}
