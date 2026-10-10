import { CircleArrow } from '@/components/site/primitives/circle-arrow';
import { Reveal } from '@/components/site/primitives/reveal';
import { SectionTag } from '@/components/site/primitives/section-tag';
import { TextLink } from '@/components/site/primitives/text-link';
import { useSite } from '@/context/site-context';
import { formatNewsDateShort, newsImage, newsTagKey, newsTitle, type NewsPost } from '@/lib/news';
import { Link } from '@inertiajs/react';

export function NewsHome({ posts = [] }: { posts?: NewsPost[] }) {
    const { t, locale } = useSite();
    const news = t.news;

    if (posts.length === 0) {
        return (
            <section className="bg-cream py-[80px] site-md:py-[120px]">
                <div className="site-container text-center">
                    <h2 className="text-site-h2 m-0 text-ink font-semibold tracking-[-0.06em]">{news.emptyTitle}</h2>
                    <p className="mt-3 text-[14px] text-ink-muted">{news.emptyBody}</p>
                </div>
            </section>
        );
    }

    const [featured, ...rest] = posts;
    const others = rest.slice(0, 2);

    return (
        <section aria-labelledby="news-heading" className="bg-cream py-[80px] site-md:py-[120px]">
            <div className="site-container">
                <Reveal>
                    <div className="mb-[60px] flex flex-wrap items-end justify-between gap-6 max-[760px]:mb-[38px]">
                        <div>
                            <SectionTag index="06" label={news.pageTitle} />
                            <h2 id="news-heading" className="text-site-h2 m-0 mt-[18px] text-ink font-semibold tracking-[-0.06em]">
                                {news.title} <span className="text-teal-dark">{news.titleAccent}</span>
                            </h2>
                        </div>
                        <TextLink href="/blog-posts">{news.viewAll}</TextLink>
                    </div>
                </Reveal>

                <div className="grid gap-[24px] site-lg:grid-cols-[1.15fr_0.85fr]">
                    <Reveal>
                        <Link
                            href={`/blog-posts/${featured.slug}`}
                            className="border-line group flex h-full min-h-[365px] flex-col border bg-white no-underline site-md:grid-cols-2 site-md:grid"
                        >
                            <div className="bg-ink relative min-h-[220px] overflow-hidden">
                                <img
                                    src={newsImage(featured)}
                                    alt={newsTitle(featured)}
                                    loading="lazy"
                                    decoding="async"
                                    className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                />
                            </div>
                            <div className="flex flex-col justify-between p-[30px]">
                                <div>
                                    <div className="flex items-center gap-4 text-[10px] text-ink-muted">
                                        <span>{formatNewsDateShort(featured.published_at, locale)}</span>
                                        <span className="font-semibold text-coral">{news.tags[newsTagKey(featured)]}</span>
                                    </div>
                                    <h3 className="m-0 mt-5 max-w-[330px] text-[24px] leading-[1.5] font-semibold tracking-[-0.04em] text-ink">
                                        {newsTitle(featured)}
                                    </h3>
                                </div>
                                <div className="mt-8">
                                    <CircleArrow />
                                </div>
                            </div>
                        </Link>
                    </Reveal>

                    <div className="grid gap-[24px]">
                        {others.map((post, index) => (
                            <Reveal key={post.id} delay={index === 0 ? 'delay' : 'delay-2'} className="h-full">
                                <Link
                                    href={`/blog-posts/${post.slug}`}
                                    className="border-line group flex h-full flex-col justify-between border bg-white p-[30px] no-underline"
                                >
                                    <div>
                                        <div className="flex items-center justify-between text-[10px] text-ink-muted">
                                            <span className="font-site-latin font-bold tracking-[0.12em] text-teal-dark">
                                                {news.tags[newsTagKey(post)]}
                                            </span>
                                            <span>{formatNewsDateShort(post.published_at, locale)}</span>
                                        </div>
                                        <h3 className="m-0 mt-5 text-[19px] leading-[1.6] font-semibold tracking-[-0.03em] text-ink">
                                            {newsTitle(post)}
                                        </h3>
                                    </div>
                                    <div className="mt-8">
                                        <CircleArrow />
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
