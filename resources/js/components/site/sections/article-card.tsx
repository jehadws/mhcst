import { CircleArrow } from '@/components/site/primitives/circle-arrow';
import { Reveal } from '@/components/site/primitives/reveal';
import { useSite } from '@/context/site-context';
import { formatNewsDateShort, newsExcerpt, newsImage, newsTagKey, newsTitle, newsVideoUrl, type NewsPost } from '@/lib/news';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface ArticleCardProps {
    post: NewsPost;
    index?: number;
    featured?: boolean;
    delay?: 'none' | 'delay' | 'delay-2';
    className?: string;
}

export function ArticleCard({ post, index = 0, featured = false, delay = 'none', className }: ArticleCardProps) {
    const { t, locale } = useSite();
    const video = newsVideoUrl(post);
    const tag = t.news.tags[newsTagKey(post)];
    const href = `/blog-posts/${post.slug}`;

    return (
        <Reveal delay={delay} className={cn('h-full', className)}>
            <article
                className={cn(
                    'group flex h-full min-h-[330px] flex-col border p-7',
                    featured ? 'border-transparent bg-ink text-white' : 'border-line bg-paper',
                )}
            >
                <div className="relative h-[170px] overflow-hidden">
                    <img
                        src={newsImage(post, index)}
                        alt={newsTitle(post)}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    {video ? (
                        <span className="bg-ink/70 absolute bottom-0 start-0 flex items-center gap-2 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur-sm">
                            <span aria-hidden="true">▶</span>
                            {locale === 'ar' ? 'فيديو' : 'Video'}
                        </span>
                    ) : null}
                </div>

                <div className={cn('mt-5 flex items-center justify-between text-[10px]', featured ? 'text-white/50' : 'text-ink-muted')}>
                    <span className="font-site-latin font-bold tracking-[0.1em] text-coral">{tag}</span>
                    <span>{formatNewsDateShort(post.published_at, locale)}</span>
                </div>

                <h3 className="m-[10px_0_0] text-[19px] leading-[1.55] font-semibold tracking-[-0.03em] site-md:text-[21px]">{newsTitle(post)}</h3>
                <p className={cn('mt-3 line-clamp-2 text-[13px] leading-[1.9]', featured ? 'text-white/60' : 'text-ink-muted')}>{newsExcerpt(post)}</p>

                <Link
                    href={href}
                    className="mt-auto flex items-center gap-3 self-start pt-6 text-[12px] font-bold no-underline"
                    aria-label={newsTitle(post)}
                >
                    <span className={featured ? 'text-white' : 'text-ink group-hover:text-coral'}>{t.news.readMore}</span>
                    <CircleArrow light={featured} />
                </Link>
            </article>
        </Reveal>
    );
}
