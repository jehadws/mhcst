import { useSite } from '@/context/site-context';
import { formatNewsDate, newsImage, newsTagKey, newsTitle, type NewsPost } from '@/lib/news';
import { Link } from '@inertiajs/react';

interface NewsCardProps {
  post: NewsPost;
  index?: number;
  className?: string;
}

export function NewsCard({ post, index = 0, className }: NewsCardProps) {
  const { t, locale } = useSite();
  const tagKey = newsTagKey(post);
  const tag = t.news.tags[tagKey];

  return (
    <Link
      href={`/blog-posts/${post.slug}`}
      className={`group border-border bg-card shadow-primary/5 flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-lg ${className ?? ''}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={newsImage(post, index)}
          alt={newsTitle(post)}
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="bg-accent text-accent-foreground absolute end-3 top-3 rounded-full px-3 py-1 text-xs font-bold">
          {post.category || tag}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 text-start">
        <span className="text-muted-foreground text-xs font-medium">{formatNewsDate(post.published_at, locale)}</span>
        <h3 className="text-primary group-hover:text-accent mt-2 text-lg font-bold leading-snug transition-colors">
          {newsTitle(post)}
        </h3>
      </div>
    </Link>
  );
}
