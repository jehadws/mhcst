import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';
import { useSite } from '@/context/site-context';
import { formatNewsDateShort, newsImage, newsTitle, type NewsPost } from '@/lib/news';
import { Link } from '@inertiajs/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface Props {
  items?: NewsPost[];
}

function NewsCard({ post, index }: { post: NewsPost; index: number }) {
  const { t, locale, isRTL } = useSite();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;

  return (
    <Link
      href={`/blog-posts/${post.slug}`}
      aria-label={newsTitle(post)}
      className="group border-border relative block h-[420px] overflow-hidden rounded-2xl border shadow-md transition-shadow hover:shadow-lg md:h-[500px]"
    >
      <img
        src={newsImage(post, index)}
        alt={newsTitle(post)}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 flex flex-col bg-linear-to-t from-black/70 via-black/35 to-transparent px-6 pt-28 pb-8 text-white sm:px-8">
        <span className="text-sm font-medium text-white/80">{formatNewsDateShort(post.published_at, locale)}</span>
        <h3 className="font-display mt-2 line-clamp-2 text-2xl leading-snug font-light text-balance sm:text-4xl">{newsTitle(post)}</h3>
        <span className="mt-4 inline-flex items-center gap-2 text-base opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {t.news.readMore}
          <Arrow className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function NewsCarousel({ items = [] }: Props) {
  const { t, isRTL } = useSite();
  const [api, setApi] = useState<CarouselApi>();
  const PrevIcon = isRTL ? ArrowRight : ArrowLeft;
  const NextIcon = isRTL ? ArrowLeft : ArrowRight;

  // Embla's loop engine translates edge slides across the seams; a short
  // track leaves a seam uncovered and cards vanish mid-wrap. Pad with whole
  // cycles of the items so the repetition stays seamless.
  const MIN_SLIDES = 6;
  const slideCount = Math.max(items.length, Math.ceil(MIN_SLIDES / items.length) * items.length);

  if (items.length === 0) {
    return null;
  }

  return (
    <section id="blog" className="bg-background scroll-mt-20 py-20">
      <div className="mx-auto flex max-w-7xl flex-wrap items-start justify-between gap-x-8 gap-y-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="font-display text-primary text-3xl leading-snug font-extrabold sm:text-4xl">
            {t.news.title} <span className="text-accent">{t.news.titleAccent}</span>
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">{t.news.pageDescription}</p>
        </div>
        <Link
          href="/blog-posts"
          className="bg-accent text-accent-foreground inline-flex shrink-0 items-center gap-1.5 rounded-lg px-6 py-2.5 text-sm font-bold transition-all hover:-translate-y-0.5 hover:brightness-110 sm:py-3"
        >
          {t.news.viewAll}
        </Link>
      </div>

      <div className="mt-8 select-none sm:mt-12">
        <Carousel
          key={isRTL ? 'rtl' : 'ltr'}
          opts={{ direction: isRTL ? 'rtl' : 'ltr', align: 'center', loop: true }}
          setApi={setApi}
          aria-label={t.news.pageTitle}
        >
          <CarouselContent>
            {Array.from({ length: slideCount }, (_, i) => {
              const post = items[i % items.length];
              return (
                <CarouselItem key={`${post.id}-${i}`} className="py-1 md:basis-1/2">
                  <NewsCard post={post} index={i % items.length} />
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="mx-auto mt-6 flex max-w-7xl items-center justify-end gap-1 px-4 sm:px-6 lg:px-8">
        <Button variant="outline" size="icon" onClick={() => api?.scrollPrev()} aria-label="Previous">
          <PrevIcon className="size-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => api?.scrollNext()} aria-label="Next">
          <NextIcon className="size-5" />
        </Button>
      </div>
    </section>
  );
}
