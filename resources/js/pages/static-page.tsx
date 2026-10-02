import Editor from '@/components/editor';
import { SeoHead } from '@/components/seo-head';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { PageHero } from '@/components/site/page-hero';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite } from '@/context/site-context';

export default function StaticPage({ title, content }: { title: string; content: string }) {
  const { t } = useSite();

  return (
    <>
      <SeoHead title={title} />
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">
          <PageHero title={title} crumbs={[{ label: t.nav.home, href: '/' }, { label: title, href: '/' }]} />
          <article className="prose prose-headings:font-display text-foreground mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <Editor content={content || ''} editable={false} onChange={() => {}} />
          </article>
        </main>
        <SiteFooter />
        <FloatingButtons />
      </div>
    </>
  );
}
