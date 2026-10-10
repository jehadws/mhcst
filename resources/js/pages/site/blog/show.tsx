import { SeoHead } from '@/components/seo-head';
import { InnerHero } from '@/components/site/primitives/inner-hero';
import { InnerSection, Prose } from '@/components/site/primitives/inner-section';
import { TextLink } from '@/components/site/primitives/text-link';
import { ArticleCard } from '@/components/site/sections/article-card';
import { CtaBand } from '@/components/site/sections/cta-band';
import { SiteLayout } from '@/components/site/site-layout';
import { useSite } from '@/context/site-context';
import {
    formatNewsDate,
    newsExcerpt,
    newsImage,
    newsSeoDescription,
    newsSeoTitle,
    newsTagKey,
    newsTitle,
    newsVideoUrl,
    type NewsPost,
} from '@/lib/news';
import { cn } from '@/lib/utils';

interface Props {
    post: NewsPost & {
        content?: string;
        content_ar?: string;
        content_en?: string;
        reading_time?: number;
        cover_video?: string;
    };
    related: NewsPost[];
}

export default function BlogShow({ post, related = [] }: Props) {
    const { t, locale } = useSite();
    const isAr = locale === 'ar';

    const content = post.content || (isAr ? post.content_ar : post.content_en) || post.content_ar || '';
    const excerpt = newsExcerpt(post);
    const coverImage = post.cover_image ? newsImage(post) : undefined;
    const videoUrl = newsVideoUrl(post);
    const tag = t.news.tags[newsTagKey(post)];

    return (
        <>
            <SeoHead
                title={newsSeoTitle(post)}
                description={newsSeoDescription(post)}
                image={coverImage}
                type="article"
                url={`/blog-posts/${post.slug}`}
                publishedTime={post.published_at ?? undefined}
                modifiedTime={post.updated_at ?? undefined}
            />
            <SiteLayout headerVariant="solid">
                <InnerHero index="06" eyebrow={post.category || tag} title={newsTitle(post)} intro={excerpt || undefined} />

                <article className="bg-paper py-[75px] site-md:py-[110px]">
                    <div className="site-container">
                        <div className="relative mb-10 overflow-hidden rounded-ss-[70px]">
                            {videoUrl ? (
                                <video
                                    src={videoUrl}
                                    controls
                                    preload="metadata"
                                    poster={coverImage}
                                    className="aspect-[16/9] w-full bg-ink object-contain"
                                />
                            ) : coverImage ? (
                                <img src={coverImage} alt={newsTitle(post)} className="aspect-[16/9] w-full object-cover" />
                            ) : (
                                <div className="bg-cream text-teal-dark grid aspect-[16/9] w-full place-items-center text-[13px]">
                                    {isAr ? 'لا توجد صورة للمقال' : 'No cover image'}
                                </div>
                            )}
                        </div>

                        <div className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-ink-muted">
                            <span>{formatNewsDate(post.published_at, locale)}</span>
                            <span className="font-site-latin font-bold tracking-[0.1em] text-coral">{tag}</span>
                            {post.reading_time ? (
                                <span>
                                    {post.reading_time} {isAr ? 'دقيقة قراءة' : 'min read'}
                                </span>
                            ) : null}
                        </div>

                        {content ? (
                            <Prose className="article-body">
                                <div dangerouslySetInnerHTML={{ __html: content }} />
                            </Prose>
                        ) : (
                            <p className="max-w-[680px] text-[15px] leading-[2] text-ink-muted italic">
                                {isAr ? 'محتوى المقال غير متوفر حالياً.' : 'Article content is not available yet.'}
                            </p>
                        )}

                        <div className="mt-12 border-t border-line pt-8">
                            <TextLink href="/blog-posts">{t.news.backToNews}</TextLink>
                        </div>
                    </div>
                </article>

                {related.length > 0 && (
                    <InnerSection tone="cream" kicker={t.news.pageTitle} title={t.news.relatedTitle}>
                        <div className={cn('mt-2 grid gap-4 site-md:grid-cols-2', related.length > 2 && 'site-lg:grid-cols-3')}>
                            {related.slice(0, 3).map((p, idx) => (
                                <ArticleCard key={p.id} post={p} index={idx} />
                            ))}
                        </div>
                    </InnerSection>
                )}

                <CtaBand />
            </SiteLayout>
        </>
    );
}
