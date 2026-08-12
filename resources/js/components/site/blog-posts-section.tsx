import { SectionHeader } from '@/components/site/section-header';
import { useSite } from '@/context/site-context';
import { Link } from '@inertiajs/react';
import { ArrowRight, BookOpen, Calendar, ChevronLeft } from 'lucide-react';

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
  author?: { name: string };
}

interface Props {
  items: BlogPost[];
}

export function BlogPostsSection({ items = [] }: Props) {
  const { locale } = useSite();

  if (items.length === 0) {
    return null;
  }

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

  const ArrowIcon = locale === 'ar' ? ChevronLeft : ArrowRight;

  return (
    <section id="blog" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader
            align="start"
            label={locale === 'ar' ? 'آخر المقالات' : 'Latest insights'}
            title={locale === 'ar' ? 'من مدونتنا' : 'From our blog'}
            description={locale === 'ar' ? 'نصائح وأفكار من خبراء التدريب المهني' : 'Tips and insights from professional training experts'}
          />
          <Link
            href="/blog-posts"
            className="border-border bg-card text-foreground hover:border-primary/50 hover:text-primary inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            <span>{locale === 'ar' ? 'عرض جميع المقالات' : 'View all articles'}</span>
            <ArrowIcon className="size-4" />
          </Link>
        </div>

        <div className="border-border bg-border mt-14 grid gap-px overflow-hidden border sm:grid-cols-2 lg:grid-cols-3">
          {items.map((post) => (
            <Link
              key={post.id}
              href={`/blog-posts/${post.slug}`}
              className="group bg-card hover:bg-secondary flex flex-col overflow-hidden transition-colors"
            >
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
                <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {formatDate(post.published_at)}
                  </span>
                  {post.author?.name && <span className="truncate">{post.author.name}</span>}
                </div>
                <h3 className="text-foreground group-hover:text-primary mt-3 line-clamp-2 flex-1 font-serif text-base leading-snug font-bold transition-colors">
                  {title(post)}
                </h3>
                {excerpt(post) && <p className="text-muted-foreground mt-2 line-clamp-2 text-sm leading-relaxed">{excerpt(post)}</p>}
                <div className="text-primary mt-4 flex items-center gap-1.5 text-xs font-semibold">
                  <span>{locale === 'ar' ? 'اقرأ المزيد' : 'Read more'}</span>
                  <ArrowIcon className="size-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
