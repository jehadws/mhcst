import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, ArrowRight, BookOpen, Calendar, ChevronLeft, ChevronRight, Clock, Tag } from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
import { useSite } from '@/context/site-context'

interface BlogPost {
    id: number
    slug: string
    title: string
    title_ar?: string
    title_en?: string
    content?: string
    content_ar?: string
    content_en?: string
    excerpt?: string
    excerpt_ar?: string
    excerpt_en?: string
    cover_image?: string
    published_at?: string
    reading_time?: number
    author?: { name: string }
}

interface Props {
    post: BlogPost
    related: BlogPost[]
}

export default function BlogShow({ post, related = [] }: Props) {
    const { t, locale } = useSite()
    const ArrowBack = locale === 'ar' ? ChevronRight : ChevronLeft

    const title = (p: BlogPost) => p.title || p.title_ar || p.title_en || ''
    const content = post.content || (locale === 'ar' ? post.content_ar : post.content_en) || post.content_ar || ''
    const excerpt = (p: BlogPost) => p.excerpt || p.excerpt_ar || p.excerpt_en || ''

    const formatDate = (d?: string) => {
        if (!d) return ''
        return new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    return (
        <>
            <Head title={`${title(post)} | ${t.brandShort}`} />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">
                    {/* Cover Image */}
                    {post.cover_image && (
                        <div className="relative h-72 w-full overflow-hidden bg-muted sm:h-96 lg:h-[480px]">
                            <img
                                src={post.cover_image.startsWith('http') ? post.cover_image : `/storage/${post.cover_image}`}
                                alt={title(post)}
                                className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                        </div>
                    )}

                    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                        {/* Back Link */}
                        <Link
                            href="/blog-posts"
                            className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs transition-all hover:border-primary/40 hover:text-foreground mb-8"
                        >
                            <ArrowBack className="size-3.5" />
                            <span>{locale === 'ar' ? 'العودة إلى المدونة' : 'Back to Blog'}</span>
                        </Link>

                        {/* Article Header */}
                        <div className="mb-8">
                            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
                                <span className="flex items-center gap-1">
                                    <Calendar className="size-3.5" />
                                    {formatDate(post.published_at)}
                                </span>
                                {post.reading_time && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="size-3.5" />
                                        {post.reading_time} {locale === 'ar' ? 'دقائق للقراءة' : 'min read'}
                                    </span>
                                )}
                                {post.author && (
                                    <span className="flex items-center gap-1">
                                        <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                                            {post.author.name.charAt(0)}
                                        </span>
                                        {post.author.name}
                                    </span>
                                )}
                            </div>
                            <h1 className="font-serif text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                {title(post)}
                            </h1>
                        </div>

                        {/* Article Content */}
                        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
                            {content ? (
                                <div dangerouslySetInnerHTML={{ __html: content }} />
                            ) : (
                                <p className="text-muted-foreground italic">
                                    {locale === 'ar' ? 'محتوى المقال غير متوفر حالياً.' : 'Article content is not available yet.'}
                                </p>
                            )}
                        </div>

                        {/* Related Articles */}
                        {related.length > 0 && (
                            <div className="mt-16 border-t border-border/60 pt-10">
                                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                                    {locale === 'ar' ? 'مقالات ذات صلة' : 'Related Articles'}
                                </h2>
                                <div className="grid gap-6 sm:grid-cols-3">
                                    {related.map((p) => (
                                        <Link
                                            key={p.id}
                                            href={`/blog-posts/${p.slug}`}
                                            className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                                        >
                                            <div className="relative aspect-video overflow-hidden bg-muted">
                                                {p.cover_image ? (
                                                    <img
                                                        src={p.cover_image.startsWith('http') ? p.cover_image : `/storage/${p.cover_image}`}
                                                        alt={title(p)}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-indigo-500/10">
                                                        <BookOpen className="size-8 text-primary/30" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <p className="text-xs text-muted-foreground mb-2">{formatDate(p.published_at)}</p>
                                                <h3 className="line-clamp-2 font-serif text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                                    {title(p)}
                                                </h3>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                <SiteFooter />
            </div>
        </>
    )
}
