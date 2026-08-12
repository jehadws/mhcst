import { NewsCard } from '@/components/site/news-card';
import { useSite } from '@/context/site-context';
import type { NewsPost } from '@/lib/news';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface Props {
  items?: NewsPost[];
}

export function BlogPostsSection({ items = [] }: Props) {
  const { t, isRTL } = useSite();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  if (items.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-primary text-3xl font-extrabold sm:text-4xl">
          {t.news.title} <span className="text-accent">{t.news.titleAccent}</span>
        </h2>
        <Link href="/blog-posts" className="text-accent hover:text-primary inline-flex shrink-0 items-center gap-1.5 text-sm font-bold">
          {t.news.viewAll}
          <Arrow className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {items.slice(0, 3).map((post, idx) => (
          <NewsCard key={post.id} post={post} index={idx} />
        ))}
      </div>
    </section>
  );
}
