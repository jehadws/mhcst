import { SeoHead } from '@/components/seo-head';
import { CtaBanner } from '@/components/site/cta-banner';
import { FeaturedNewsCard } from '@/components/site/featured-news-card';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { NewsCard } from '@/components/site/news-card';
import { PageHero } from '@/components/site/page-hero';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite } from '@/context/site-context';
import { newsTagKey, type NewsPost, type NewsTagKey } from '@/lib/news';
import { cn } from '@/lib/utils';
import { BookOpen } from 'lucide-react';
import { useMemo, useState } from 'react';

interface Props {
  posts: NewsPost[];
}

const PAGE_SIZE = 6;
type CategoryFilter = 'all' | NewsTagKey;

export default function BlogIndex({ posts = [] }: Props) {
  const { t } = useSite();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [page, setPage] = useState(1);

  const categories: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: t.news.categories.all },
    { key: 'events', label: t.news.categories.events },
    { key: 'partnerships', label: t.news.categories.partnerships },
    { key: 'academic', label: t.news.categories.academic },
    { key: 'community', label: t.news.categories.community },
  ];

  const filteredPosts = useMemo(() => {
    if (category === 'all') {
      return posts;
    }

    return posts.filter((post) => newsTagKey(post) === category);
  }, [category, posts]);

  const featured = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);
  const totalPages = Math.max(1, Math.ceil(gridPosts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginatedPosts = gridPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleCategoryChange = (key: CategoryFilter) => {
    setCategory(key);
    setPage(1);
  };

  return (
    <>
      <SeoHead title={t.news.pageTitle} description={t.news.pageDescription} />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageHero
            title={t.news.pageTitle}
            description={t.news.pageDescription}
            crumbs={[{ label: t.news.viewAll, href: '/blog-posts' }]}
          />

          <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-start gap-2">
              {categories.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => handleCategoryChange(c.key)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    category === c.key
                      ? 'bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-accent hover:text-accent border',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-primary/10 text-primary mb-4 flex size-16 items-center justify-center rounded-full">
                  <BookOpen className="size-8" />
                </div>
                <h2 className="text-primary text-2xl font-extrabold">{t.news.emptyTitle}</h2>
                <p className="text-muted-foreground mt-2 text-sm">{t.news.emptyBody}</p>
              </div>
            ) : (
              <>
                {featured && (
                  <div className="mt-10">
                    <FeaturedNewsCard post={featured} />
                  </div>
                )}

                {paginatedPosts.length > 0 && (
                  <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {paginatedPosts.map((post, idx) => (
                      <NewsCard key={post.id} post={post} index={idx + 1} />
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={cn(
                          'size-10 rounded-lg text-sm font-bold transition-colors',
                          currentPage === p
                            ? 'bg-primary text-primary-foreground'
                            : 'border-border bg-card text-muted-foreground hover:border-accent hover:text-accent border',
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          <CtaBanner />
        </main>
        <SiteFooter />
        <FloatingButtons />
      </div>
    </>
  );
}
