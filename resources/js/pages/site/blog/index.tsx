import { useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { Calendar, ChevronRight, Clock, Tag, BookOpen, Sparkles } from 'lucide-react'
import { SiteHeader } from '@/components/site/site-header'
import { SiteFooter } from '@/components/site/site-footer'
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
    reading_time?: number
    category?: { name_ar: string; name_en: string }
    author?: { name: string }
}

interface Props {
    posts: BlogPost[]
}

export default function BlogIndex({ posts = [] }: Props) {
    const { t, locale } = useSite()

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

    const [featured, ...rest] = posts

    return (
        <>
            <Head title={`${locale === 'ar' ? 'المدونة' : 'Blog'} | ${t.brandShort}`} />
            <div className="flex min-h-screen flex-col">
                <SiteHeader />
                <main className="flex-1">
                    {/* Hero Banner */}
                    <div className="relative border-b border-border/60 bg-gradient-to-b from-primary/10 via-background to-background py-14 sm:py-16">
                        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold text-primary">
                                <BookOpen className="size-3.5" />
                                <span>{locale === 'ar' ? 'المدونة والمقالات' : 'Blog & Insights'}</span>
                            </span>
                            <h1 className="mt-4 font-serif text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                                {locale === 'ar' ? 'مقالات ونصائح مهنية' : 'Professional Insights & Tips'}
                            </h1>
                            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted-foreground">
                                {locale === 'ar'
                                    ? 'أحدث المقالات والنصائح من خبراء التدريب المهني'
                                    : 'The latest articles and advice from professional training experts'}
                            </p>
                        </div>
                    </div>

                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        {posts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
                                    <BookOpen className="size-8" />
                                </div>
                                <h2 className="font-serif text-2xl font-bold text-foreground">
                                    {locale === 'ar' ? 'لا توجد مقالات بعد' : 'No articles yet'}
                                </h2>
                                <p className="mt-2 text-muted-foreground text-sm">
                                    {locale === 'ar' ? 'تابعنا قريباً لمحتوى متجدد' : 'Check back soon for fresh content'}
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Featured Article */}
                                {featured && (
                                            <Link
                                                href={`/blog-posts/${featured.slug}`}
                                        className="group mb-12 grid overflow-hidden rounded-3xl border border-border/80 bg-card shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl lg:grid-cols-2"
                                    >
                                        <div className="relative aspect-video overflow-hidden bg-muted lg:aspect-auto">
                                            {featured.cover_image ? (
                                                <img
                                                    src={featured.cover_image.startsWith('http') ? featured.cover_image : `/storage/${featured.cover_image}`}
                                                    alt={title(featured)}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-indigo-500/20">
                                                    <BookOpen className="size-16 text-primary/40" />
                                                </div>
                                            )}
                                            <div className="absolute start-4 top-4">
                                                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow">
                                                    {locale === 'ar' ? 'المقال المميز' : 'Featured'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col justify-center p-8 lg:p-10">
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="size-3.5" />
                                                    {formatDate(featured.published_at)}
                                                </span>
                                                {featured.reading_time && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="size-3.5" />
                                                        {featured.reading_time} {locale === 'ar' ? 'دقائق' : 'min read'}
                                                    </span>
                                                )}
                                            </div>
                                            <h2 className="mt-4 font-serif text-2xl font-bold leading-snug text-foreground transition-colors group-hover:text-primary lg:text-3xl">
                                                {title(featured)}
                                            </h2>
                                            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                                                {excerpt(featured)}
                                            </p>
                                            <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                                                <span>{locale === 'ar' ? 'اقرأ المقال' : 'Read article'}</span>
                                                <ChevronRight className="size-4" />
                                            </div>
                                        </div>
                                    </Link>
                                )}

                                {/* Article Grid */}
                                {rest.length > 0 && (
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {rest.map((post) => (
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
                                                        {post.reading_time && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="size-3" />
                                                                {post.reading_time} {locale === 'ar' ? 'دقائق' : 'min'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="mt-3 line-clamp-2 flex-1 font-serif text-base font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                                                        {title(post)}
                                                    </h3>
                                                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                        {excerpt(post)}
                                                    </p>
                                                    <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-primary">
                                                        <span>{locale === 'ar' ? 'اقرأ المزيد' : 'Read more'}</span>
                                                        <ChevronRight className="size-3.5" />
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </main>
                <SiteFooter />
            </div>
        </>
    )
}
