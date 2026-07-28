import CmsPageFormPage from "./form";

interface Props {
    page: { id: number; key: string; title: string; content: string };
}

export default function EditCmsPage({ page }: Props) {
    return <CmsPageFormPage page={page} />;
}
