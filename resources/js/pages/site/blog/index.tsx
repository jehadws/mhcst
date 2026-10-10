import { SeoHead } from '@/components/seo-head';
import { InnerHero } from '@/components/site/primitives/inner-hero';
import { ArticleCard } from '@/components/site/sections/article-card';
import { CtaBand } from '@/components/site/sections/cta-band';
import { NewsletterBand } from '@/components/site/sections/newsletter-band';
import { SiteLayout } from '@/components/site/site-layout';
import { useSite } from '@/context/site-context';
import { newsTagKey, type NewsPost, type NewsTagKey } from '@/lib/news';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

interface Props {
    posts: NewsPost[];
}

const PAGE_SIZE = 6;
type CategoryFilter = 'all' | NewsTagKey;

export default function BlogIndex({ posts = [] }: Props) {
    const { t, locale } = useSite();
    const isAr = locale === 'ar';
    const [category, setCategory] = useState<CategoryFilter>('all');
    const [page, setPage] = useState(1);

    const categories: { key: CategoryFilter; label: string }[] = [
        { key: 'all', label: t.news.categories.all },
        { key: 'events', label: t.news.categories.events },
        { key: 'partnerships', label: t.news.categories.partnerships },
        { key: 'academic', label: t.news.categories.academic },
        { key: 'community', label: t.news.categories.community },
    ];

    const filteredPosts = useMemo(
        () => (category === 'all' ? posts : posts.filter((post) => newsTagKey(post) === category)),
        [category, posts],
    );

    const featured = filteredPosts[0];
    const gridPosts = filteredPosts.slice(1);
    const totalPages = Math.max(1, Math.ceil(gridPosts.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginatedPosts = gridPosts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    return (
        <>
            <SeoHead title={t.news.pageTitle} description={t.news.pageDescription} />
            <SiteLayout headerVariant="solid">
                <InnerHero index="06" eyebrow={t.news.pageTitle} title={t.news.title} accent={t.news.titleAccent} intro={t.news.pageDescription} />

                <section className="bg-cream py-[75px] site-md:py-[110px]" aria-labelledby="blog-heading">
                    <div className="site-container">
                        <h2 id="blog-heading" className="sr-only">
                            {t.news.pageTitle}
                        </h2>

                        <div className="flex flex-wrap gap-2" role="group" aria-label={isAr ? 'تصنيفات الأخبار' : 'News categories'}>
                            {categories.map((c) => (
                                <button
                                    key={c.key}
                                    type="button"
                                    onClick={() => {
                                        setCategory(c.key);
                                        setPage(1);
                                    }}
                                    aria-pressed={category === c.key}
                                    className={cn(
                                        'border px-[14px] py-[9px] text-[11px] font-bold transition-colors',
                                        category === c.key
                                            ? 'border-ink bg-ink text-white'
                                            : 'border-line bg-transparent text-ink-muted hover:border-coral hover:text-ink',
                                    )}
                                >
                                    {c.label}
                                </button>
                            ))}
                        </div>

                        {filteredPosts.length === 0 ? (
                            <div className="mt-10 border-t border-line py-[60px] text-center">
                                <h3 className="m-0 text-[20px] font-semibold">{t.news.emptyTitle}</h3>
                                <p className="mt-2 text-[14px] text-ink-muted">{t.news.emptyBody}</p>
                            </div>
                        ) : (
                            <>
                                <div className="mt-10 grid gap-4 site-lg:grid-cols-[1.25fr_1fr_1fr]">
                                    {featured && <ArticleCard post={featured} index={0} featured />}

                                    {paginatedPosts.map((post, idx) => (
                                        <ArticleCard
                                            key={post.id}
                                            post={post}
                                            index={idx + 1}
                                            delay={idx % 3 === 1 ? 'delay' : idx % 3 === 2 ? 'delay-2' : 'none'}
                                        />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <nav
                                        className="mt-12 flex items-center justify-center gap-2"
                                        aria-label={isAr ? 'التنقل بين صفحات الأخبار' : 'News pagination'}
                                    >
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPage(p)}
                                                aria-current={currentPage === p ? 'page' : undefined}
                                                className={cn(
                                                    'font-site-latin size-[38px] text-[13px] font-bold transition-colors',
                                                    currentPage === p
                                                        ? 'bg-ink text-white'
                                                        : 'border border-line text-ink-muted hover:border-coral hover:text-ink',
                                                )}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </nav>
                                )}
                            </>
                        )}
                    </div>
                </section>

                <NewsletterBand />
                <CtaBand />
            </SiteLayout>
        </>
    );
}
