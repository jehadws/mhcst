import { Link } from '@inertiajs/react'
import { ArrowRight, BookOpen, Calendar, ChevronLeft, Sparkles } from 'lucide-react'
import { useSite } from '@/context/site-context'

interface BlogPost {
    id: number
    slug: string
    title: string
    title_ar?: string
    title_en?: string
    excerpt?: string
    excerpt_ar?: string
    excerpt_en?: string
    cover_image?: string
    published_at?: string
    author?: { name: string }
}

interface Props {
    items: BlogPost[]
}

export function BlogPostsSection({ items = [] }: Props) {
    const { locale } = useSite()

    if (items.length === 0) return null

    const title = (p: BlogPost) => p.title || p.title_ar || p.title_en || ''
    const excerpt = (p: BlogPost) => p.excerpt || p.excerpt_ar || p.excerpt_en || ''

    const formatDate = (d?: string) => {
        if (!d) return ''
        return new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-GB', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    }

    const ArrowIcon = locale === 'ar' ? ChevronLeft : ArrowRight

    return (
        <section id="blog" className="scroll-mt-20 border-t border-border/60 bg-background py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
                    <div className="max-w-xl">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                            <Sparkles className="size-3.5" />
                            <span>{locale === 'ar' ? 'آخر المقالات' : 'Latest Insights'}</span>
                        </span>
                        <h2 className="mt-4 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {locale === 'ar' ? 'من مدونتنا' : 'From our blog'}
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            {locale === 'ar'
                                ? 'نصائح وأفكار من خبراء التدريب المهني'
                                : 'Tips and insights from professional training experts'}
                        </p>
                    </div>
                    <Link
                        href="/blog-posts"
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-xs transition-colors hover:border-primary/40 hover:text-primary"
                    >
                        <span>{locale === 'ar' ? 'عرض جميع المقالات' : 'View all articles'}</span>
                        <ArrowIcon className="size-4" />
                    </Link>
                </div>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog-posts/${post.slug}`}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-xl"
                        >
                            <div className="relative aspect-[16/9] overflow-hidden bg-muted">
                                {post.cover_image ? (
                                    <img
                                        src={post.cover_image.startsWith('http') ? post.cover_image : `/storage/${post.cover_image}`}
                                        alt={title(post)}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-indigo-500/10">
                                        <BookOpen className="size-10 text-primary/30" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-1 flex-col p-5">
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="size-3" />
                                        {formatDate(post.published_at)}
                                    </span>
                                    {post.author?.name && (
                                        <span className="truncate">{post.author.name}</span>
                                    )}
                                </div>
                                <h3 className="mt-3 line-clamp-2 flex-1 font-serif text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                                    {title(post)}
                                </h3>
                                {excerpt(post) && (
                                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                        {excerpt(post)}
                                    </p>
                                )}
                                <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                                    <span>{locale === 'ar' ? 'اقرأ المزيد' : 'Read more'}</span>
                                    <ArrowIcon className="size-3.5" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
