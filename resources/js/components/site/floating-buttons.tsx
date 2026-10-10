import { useSiteSettings } from '@/hooks/use-site-settings';
import { cn } from '@/lib/utils';
import { ArrowUp, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function FloatingButtons() {
    const settings = useSiteSettings();
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 400);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const whatsapp = String(settings.whatsapp_number ?? '').replace(/\D/g, '');
    if (!whatsapp) return null;

    return (
        <div className="fixed bottom-5 end-5 z-40 flex flex-col items-center gap-3 site-md:bottom-7 site-md:end-7">
            <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="grid size-[46px] place-items-center rounded-full bg-teal-dark text-white shadow-[0_10px_25px_rgba(17,34,59,.18)] transition-colors hover:bg-coral"
            >
                <MessageCircle className="size-5" aria-hidden="true" />
            </a>

            <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Back to top"
                className={cn(
                    'grid size-[46px] place-items-center rounded-full border border-ink bg-white text-ink transition-[opacity,transform,background-color,color] duration-300 hover:bg-ink hover:text-white',
                    showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
                )}
            >
                <ArrowUp className="size-5" aria-hidden="true" />
            </button>
        </div>
    );
}
