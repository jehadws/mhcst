import { useEffect, useState } from 'react'
import { ArrowUp, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FloatingButtons() {
    const [showTop, setShowTop] = useState(false)

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 400)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

    return (
        <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
            {/* WhatsApp Button */}
            <a
                href="https://wa.me/218912345678"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="group flex size-13 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/40"
            >
                <MessageCircle className="size-6" />
                {/* Ping animation */}
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30" />
            </a>

            {/* Scroll to Top */}
            <button
                type="button"
                onClick={scrollToTop}
                aria-label="Scroll to top"
                className={cn(
                    'flex size-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-md transition-all duration-300 hover:border-primary/40 hover:bg-primary hover:text-primary-foreground hover:scale-110',
                    showTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none',
                )}
            >
                <ArrowUp className="size-5" />
            </button>
        </div>
    )
}
