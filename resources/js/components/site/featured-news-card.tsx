import { useSite } from '@/context/site-context';
import { formatNewsDate, newsExcerpt, newsImage, newsTagKey, newsTitle, type NewsPost } from '@/lib/news';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CalendarDays } from 'lucide-react';

interface FeaturedNewsCardProps {
  post: NewsPost;
  index?: number;
}

export function FeaturedNewsCard({ post, index = 0 }: FeaturedNewsCardProps) {
  const { t, locale, isRTL } = useSite();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const tagKey = newsTagKey(post);
  const tag = t.news.tags[tagKey];
  const excerpt = newsExcerpt(post);

  return (
    <article className="border-border bg-card shadow-primary/5 grid overflow-hidden rounded-3xl border shadow-lg lg:grid-cols-2">
      <div className="relative min-h-64 overflow-hidden">
        <img src={newsImage(post, index)} alt={newsTitle(post)} className="absolute inset-0 size-full object-cover" />
        <span className="bg-accent text-accent-foreground absolute end-4 top-4 rounded-full px-3 py-1 text-xs font-bold">
          {post.category || tag}
        </span>
      </div>
      <div className="flex flex-col justify-center p-8 text-start sm:p-10">
        <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
          <CalendarDays className="size-4" aria-hidden="true" />
          {formatNewsDate(post.published_at, locale)}
        </span>
        <h2 className="text-primary mt-3 text-2xl font-extrabold leading-snug text-balance">{newsTitle(post)}</h2>
        {excerpt ? <p className="text-muted-foreground mt-4 leading-relaxed">{excerpt}</p> : null}
        <Link
          href={`/blog-posts/${post.slug}`}
          className="text-accent hover:text-primary mt-6 inline-flex items-center gap-1.5 self-start text-sm font-bold"
        >
          {t.news.readMore}
          <Arrow className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
