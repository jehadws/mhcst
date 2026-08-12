export const NEWS_FALLBACK_IMAGES = [
  '/images/news-forum.png',
  '/images/news-partnership.png',
  '/images/news-volunteer.png',
  '/images/college-health.png',
];

export type NewsTagKey = 'events' | 'partnerships' | 'academic' | 'community';

export interface NewsPost {
  id: number;
  slug: string;
  title?: string;
  title_ar?: string;
  title_en?: string;
  excerpt?: string;
  excerpt_ar?: string;
  excerpt_en?: string;
  cover_image?: string;
  published_at?: string;
  category?: string;
}

export function newsTitle(post: NewsPost): string {
  return post.title || post.title_ar || post.title_en || '';
}

export function newsExcerpt(post: NewsPost): string {
  return post.excerpt || post.excerpt_ar || post.excerpt_en || '';
}

export function newsImage(post: NewsPost, index = 0): string {
  if (post.cover_image) {
    return post.cover_image.startsWith('http') ? post.cover_image : `/storage/${post.cover_image}`;
  }

  return NEWS_FALLBACK_IMAGES[index % NEWS_FALLBACK_IMAGES.length];
}

export function newsTagKey(post: NewsPost): NewsTagKey {
  const keys: NewsTagKey[] = ['events', 'partnerships', 'community', 'academic'];

  return keys[post.id % keys.length];
}

export function formatNewsDate(date: string | undefined, locale: 'ar' | 'en'): string {
  if (!date) {
    return '';
  }

  return new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
