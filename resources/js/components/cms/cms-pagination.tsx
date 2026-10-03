import { PaginatedData } from '@/types';
import { router } from '@inertiajs/react';

/**
 * Shared pager for the CMS listing pages. Renders Laravel's paginator
 * `links` and navigates with the full query string intact.
 */
export default function CmsPagination({ paginator }: { paginator: PaginatedData<unknown> }) {
  if (paginator.last_page <= 1) return null;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {paginator.links.map((link, index) => (
        <button
          key={index}
          type="button"
          disabled={!link.url}
          onClick={() => link.url && router.get(link.url)}
          className={`rounded-lg px-3 py-1.5 text-sm ${
            link.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
          } ${!link.url ? 'opacity-50' : ''}`}
          dangerouslySetInnerHTML={{ __html: link.label }}
        />
      ))}
    </div>
  );
}
