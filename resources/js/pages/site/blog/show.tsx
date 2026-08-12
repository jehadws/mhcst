import { SeoHead } from '@/components/seo-head';
import { CtaBanner } from '@/components/site/cta-banner';
import { NewsCard } from '@/components/site/news-card';
import { PageHero } from '@/components/site/page-hero';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite } from '@/context/site-context';
import { formatNewsDate, newsExcerpt, newsImage, newsTagKey, newsTitle, type NewsPost } from '@/lib/news';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';

interface Props {
  post: NewsPost & {
    content?: string;
    content_ar?: string;
    content_en?: string;
    reading_time?: number;
  };
  related: NewsPost[];
}

export default function BlogShow({ post, related = [] }: Props) {
  const { t, locale, isRTL } = useSite();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  const content = post.content || (locale === 'ar' ? post.content_ar : post.content_en) || post.content_ar || '';
  const excerpt = newsExcerpt(post);
  const coverImage = post.cover_image ? newsImage(post) : undefined;
  const tag = t.news.tags[newsTagKey(post)];

  return (
    <>
      <SeoHead title={newsTitle(post)} description={excerpt} image={coverImage} type="article" />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageHero
            title={newsTitle(post)}
            description={excerpt || undefined}
            crumbs={[
              { label: t.news.viewAll, href: '/blog-posts' },
              { label: newsTitle(post), href: `/blog-posts/${post.slug}` },
            ]}
          />

          <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
            {post.cover_image && (
              <div className="border-border relative mb-10 overflow-hidden rounded-3xl border shadow-lg">
                <img src={newsImage(post)} alt={newsTitle(post)} className="aspect-[16/9] w-full object-cover" />
                <span className="bg-accent text-accent-foreground absolute end-4 top-4 rounded-full px-3 py-1 text-xs font-bold">
                  {post.category || tag}
                </span>
              </div>
            )}

            <div className="text-muted-foreground mb-8 flex flex-wrap items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden="true" />
                {formatNewsDate(post.published_at, locale)}
              </span>
              {!post.cover_image && (
                <span className="bg-accent/15 text-accent rounded-full px-3 py-1 text-xs font-bold">{tag}</span>
              )}
            </div>

            <div className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-p:leading-relaxed prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline max-w-none text-start">
              {content ? (
                <div dangerouslySetInnerHTML={{ __html: content }} />
              ) : (
                <p className="text-muted-foreground italic">
                  {locale === 'ar' ? 'محتوى المقال غير متوفر حالياً.' : 'Article content is not available yet.'}
                </p>
              )}
            </div>

            <div className="mt-10 flex justify-start">
              <Link
                href="/blog-posts"
                className="text-accent hover:text-primary inline-flex items-center gap-1.5 text-sm font-bold"
              >
                {t.news.backToNews}
                <Arrow className="size-4" aria-hidden="true" />
              </Link>
            </div>

            {related.length > 0 && (
              <div className="border-border mt-16 border-t pt-12">
                <h2 className="text-primary mb-8 text-2xl font-extrabold">{t.news.relatedTitle}</h2>
                <div className="grid gap-6 md:grid-cols-3">
                  {related.map((p, idx) => (
                    <NewsCard key={p.id} post={p} index={idx} />
                  ))}
                </div>
              </div>
            )}
          </article>

          <CtaBanner />
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
