import { SeoHead } from '@/components/seo-head';
import { CtaBanner } from '@/components/site/cta-banner';
import { FloatingButtons } from '@/components/site/floating-buttons';
import { PageHero } from '@/components/site/page-hero';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Clock } from 'lucide-react';

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  title_ar?: string;
  title_en?: string;
  excerpt?: string;
  excerpt_ar?: string;
  excerpt_en?: string;
  cover_image?: string;
  published_at?: string;
  reading_time?: number;
  author?: { name: string };
}

interface Props {
  posts: BlogPost[];
}

export default function BlogIndex({ posts = [] }: Props) {
  const { locale } = useSite();
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight;

  const title = (p: BlogPost) => p.title || p.title_ar || p.title_en || '';
  const excerpt = (p: BlogPost) => p.excerpt || p.excerpt_ar || p.excerpt_en || '';

  const formatDate = (d?: string) => {
    if (!d) {
      return '';
    }

    return new Date(d).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const [featured, ...rest] = posts;

  return (
    <>
      <SeoHead
        title={locale === 'ar' ? 'المدونة' : 'Blog'}
        description={
          locale === 'ar'
            ? 'مقالات ونصائح من المعايير الحديثة للتعليم والتدريب'
            : 'Articles and insights from Modern Standards for Education & Training'
        }
      />
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1">
          <PageHero
            label={locale === 'ar' ? 'الأخبار والمقالات' : 'News & articles'}
            title={locale === 'ar' ? 'آخر الأخبار' : 'Latest news'}
            description={
              locale === 'ar'
                ? 'أحدث المقالات والنصائح من خبراء التدريب المهني'
                : 'The latest articles and advice from professional training experts'
            }
          />

          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-primary/10 text-primary mb-4 flex size-16 items-center justify-center rounded-full">
                  <BookOpen className="size-8" />
                </div>
                <h2 className="font-serif text-2xl font-bold">{locale === 'ar' ? 'لا توجد مقالات بعد' : 'No articles yet'}</h2>
                <p className="text-muted-foreground mt-2 text-sm">{locale === 'ar' ? 'تابعنا قريباً' : 'Check back soon'}</p>
              </div>
            ) : (
              <>
                {featured && (
                  <Link
                    href={`/blog-posts/${featured.slug}`}
                    className="group border-border bg-card hover:border-primary/30 mb-12 grid overflow-hidden border transition-colors lg:grid-cols-2"
                  >
                    <div className="bg-muted relative aspect-video overflow-hidden lg:aspect-auto">
                      {featured.cover_image ? (
                        <img
                          src={featured.cover_image.startsWith('http') ? featured.cover_image : `/storage/${featured.cover_image}`}
                          alt={title(featured)}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="bg-primary/5 flex h-full items-center justify-center">
                          <BookOpen className="text-primary/40 size-16" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center p-8 lg:p-10">
                      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {formatDate(featured.published_at)}
                        </span>
                        {featured.reading_time && (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3.5" />
                            {featured.reading_time} {locale === 'ar' ? 'دقائق' : 'min'}
                          </span>
                        )}
                      </div>
                      <h2 className="text-foreground group-hover:text-primary mt-4 font-serif text-2xl leading-snug font-bold transition-colors lg:text-3xl">
                        {title(featured)}
                      </h2>
                      <p className="text-muted-foreground mt-3 line-clamp-3 text-sm leading-relaxed">{excerpt(featured)}</p>
                      <div className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-semibold">
                        <span>{locale === 'ar' ? 'اقرأ المقال' : 'Read article'}</span>
                        <Arrow className="size-4" />
                      </div>
                    </div>
                  </Link>
                )}

                {rest.length > 0 && (
                  <div className="border-border bg-border grid gap-px overflow-hidden border sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((post) => (
                      <Link key={post.id} href={`/blog-posts/${post.slug}`} className="group bg-card hover:bg-secondary flex flex-col transition-colors">
                        <div className="bg-muted relative aspect-[16/9] overflow-hidden">
                          {post.cover_image ? (
                            <img
                              src={post.cover_image.startsWith('http') ? post.cover_image : `/storage/${post.cover_image}`}
                              alt={title(post)}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            />
                          ) : (
                            <div className="bg-primary/5 flex h-full items-center justify-center">
                              <BookOpen className="text-primary/30 size-10" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <div className="text-muted-foreground flex items-center gap-2 text-xs">
                            <Calendar className="size-3" />
                            {formatDate(post.published_at)}
                          </div>
                          <h3 className="text-foreground group-hover:text-primary mt-3 line-clamp-2 flex-1 font-serif text-base font-bold leading-snug transition-colors">
                            {title(post)}
                          </h3>
                          <div className="text-primary mt-4 flex items-center gap-1.5 text-xs font-semibold">
                            <span>{locale === 'ar' ? 'اقرأ المزيد' : 'Read more'}</span>
                            <Arrow className="size-3.5" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <CtaBanner />
        </main>
        <SiteFooter />
        <FloatingButtons />
      </div>
    </>
  );
}
