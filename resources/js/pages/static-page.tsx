import Editor from '@/components/editor';
import { SeoHead } from '@/components/seo-head';
import { InnerHero } from '@/components/site/primitives/inner-hero';
import { SiteLayout } from '@/components/site/site-layout';
import { useSite } from '@/context/site-context';

export default function StaticPage({ title, content }: { title: string; content: string }) {
    const { t } = useSite();

    return (
        <>
            <SeoHead title={title} />
            <SiteLayout headerVariant="solid">
                <InnerHero eyebrow={t.nav.home} title={title} />
                <article className="bg-paper py-[75px] site-md:py-[110px]">
                    <div className="site-container">
                        <div className="article-body">
                            <Editor content={content || ''} editable={false} onChange={() => {}} />
                        </div>
                    </div>
                </article>
            </SiteLayout>
        </>
    );
}
