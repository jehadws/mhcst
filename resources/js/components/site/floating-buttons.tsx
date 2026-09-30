import { useEffect, useState } from 'react'
import { ArrowUp, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSiteSettings } from '@/hooks/use-site-settings'

export function FloatingButtons() {
    const settings = useSiteSettings()
    const [showTop, setShowTop] = useState(false)

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 400)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const whatsapp = (settings.whatsapp_number || '218912345678').replace(/\D/g, '')

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

    return (
        <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
            <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="group flex size-12 items-center justify-center rounded-full bg-[oklch(0.68_0.20_145)] text-white shadow-xl transition-all duration-300 hover:bg-[oklch(0.62_0.19_145)]"
            >
                <MessageCircle className="size-5" />
            </a>

            <button
                type="button"
                onClick={scrollToTop}
                aria-label="Scroll to top"
                className={cn(
                    'flex size-12 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-lg transition-all duration-300 hover:border-primary/40 hover:bg-primary hover:text-primary-foreground',
                    showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
                )}
            >
                <ArrowUp className="size-5" />
            </button>
        </div>
    )
}
