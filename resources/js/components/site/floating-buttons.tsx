import { useSiteSettings } from '@/hooks/use-site-settings';
import { cn } from '@/lib/utils';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function FloatingButtons() {
  const settings = useSiteSettings();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const whatsapp = (settings.whatsapp_number || '218912345678').replace(/\D/g, '');

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="fixed end-4 bottom-24 z-50 flex flex-col items-end gap-3 md:end-6 md:bottom-6">
      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="group bg-hero text-accent hover:bg-hero/90 flex size-11 items-center justify-center rounded-full shadow-xl transition-all duration-300 md:size-12"
      >
        <MessageCircle className="size-5" />
      </a>

      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={cn(
          'border-border bg-card text-muted-foreground hover:border-primary/40 hover:bg-primary hover:text-primary-foreground flex size-11 items-center justify-center rounded-full border shadow-lg transition-all duration-300 md:size-12',
          showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        )}
      >
        <ArrowUp className="size-5" />
      </button>
    </div>
  );
}
